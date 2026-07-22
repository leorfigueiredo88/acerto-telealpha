-- ============================================================
-- ENDURECIMENTO DE SEGURANÇA (RLS, views, papéis, auditoria)
--
-- Fecha lacunas encontradas numa revisão de segurança do projeto:
--
-- 1) despesa_eventos (trilha de auditoria) nunca teve RLS habilitado.
--    Qualquer usuário autenticado — inclusive alguém que se
--    autocadastrasse direto pela API — conseguia ler, gravar ou
--    apagar o histórico completo de aprovações/recusas de despesas
--    de TODA a empresa via REST (/rest/v1/despesa_eventos).
--
-- 2) As views vw_acerto_viagem, vw_resumo_colaborador e
--    vw_gastos_mensais rodavam com os privilégios de quem as criou
--    (dono da view no Postgres), não de quem consulta. Na prática
--    isso ignora a RLS de "despesas": qualquer usuário autenticado
--    conseguia puxar os dados financeiros de todos os colaboradores
--    e viagens via essas views, mesmo sem participar de nada.
--
-- 3) "Desativar funcionário" (migration 0006) só escondia o
--    colaborador das listas do app — a conta continuava valendo
--    para tudo o resto (RLS, RPCs) porque nenhuma policy checava
--    usuarios.ativo. Um funcionário desligado mantinha acesso total
--    aos próprios dados (e o app já fazia logout automático ao
--    detectar isso no login — mas só na tela de login; qualquer
--    chamada direta à API continuava valendo).
--
-- 4) As policies "creditos_update_gestor" e "participantes_update_gestor"
--    permitem update genérico do gestor na tabela inteira. Isso deixa
--    a porta aberta para, via chamada direta à API REST (fora do
--    app), reescrever "confirmado"/"confirmado_em" de um crédito ou
--    "status"/"fechado_por"/"fechado_em" de um participante direto na
--    tabela — ignorando as regras das RPCs confirmar_credito (só o
--    próprio colaborador confirma) e fechar_acerto_participante
--    (exige despesas e créditos resolvidos antes de fechar).
-- ============================================================


-- ---------- 1) RLS na tabela de auditoria ----------
-- O trigger que grava os eventos passa a ser SECURITY DEFINER, então
-- continua funcionando mesmo sem nenhuma policy de INSERT para
-- authenticated — só o próprio Postgres (via trigger) grava ali.
ALTER FUNCTION fn_log_evento_status() SECURITY DEFINER SET search_path = public;

ALTER TABLE despesa_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY despesa_eventos_select ON despesa_eventos
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM despesas d WHERE d.id = despesa_eventos.despesa_id AND d.usuario_id = auth.uid())
        OR EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );
-- (sem policy de INSERT/UPDATE/DELETE para authenticated — só a
-- trigger, que é SECURITY DEFINER, grava nessa tabela)


-- ---------- 2) Views passam a respeitar a RLS de quem consulta ----------
ALTER VIEW vw_acerto_viagem      SET (security_invoker = true);
ALTER VIEW vw_resumo_colaborador SET (security_invoker = true);
ALTER VIEW vw_gastos_mensais     SET (security_invoker = true);


-- ---------- 3) "ativo" passa a valer de verdade, não só na UI ----------
CREATE OR REPLACE FUNCTION fn_usuario_ativo()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT COALESCE((SELECT ativo FROM usuarios WHERE id = auth.uid()), FALSE);
$$;

CREATE OR REPLACE FUNCTION fn_eh_gestor_ativo()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND papel = 'gestor' AND ativo);
$$;

-- despesas
ALTER POLICY despesas_select_proprias ON despesas
    USING (usuario_id = auth.uid() AND fn_usuario_ativo());
ALTER POLICY despesas_insert_proprias ON despesas
    WITH CHECK (usuario_id = auth.uid() AND status = 'pendente' AND fn_usuario_ativo());
ALTER POLICY despesas_gestor_select ON despesas
    USING (fn_eh_gestor_ativo());
ALTER POLICY despesas_gestor_update ON despesas
    USING (fn_eh_gestor_ativo());

-- viagens
ALTER POLICY viagens_select ON viagens
    USING (
        fn_eh_gestor_ativo()
        OR (
            fn_usuario_ativo()
            AND EXISTS (SELECT 1 FROM viagem_participantes vp
                        WHERE vp.viagem_id = viagens.id AND vp.usuario_id = auth.uid())
        )
    );
ALTER POLICY viagens_insert_gestor ON viagens
    WITH CHECK (fn_eh_gestor_ativo());
ALTER POLICY viagens_update_gestor ON viagens
    USING (fn_eh_gestor_ativo());

-- viagem_participantes
ALTER POLICY participantes_select ON viagem_participantes
    USING (
        fn_eh_gestor_ativo()
        OR (usuario_id = auth.uid() AND fn_usuario_ativo())
    );
ALTER POLICY participantes_insert_gestor ON viagem_participantes
    WITH CHECK (fn_eh_gestor_ativo());
ALTER POLICY participantes_update_gestor ON viagem_participantes
    USING (fn_eh_gestor_ativo());

-- creditos_viagem
ALTER POLICY creditos_select ON creditos_viagem
    USING (
        (usuario_id = auth.uid() AND fn_usuario_ativo())
        OR fn_eh_gestor_ativo()
    );
ALTER POLICY creditos_insert_gestor ON creditos_viagem
    WITH CHECK (lancado_por = auth.uid() AND fn_eh_gestor_ativo());
ALTER POLICY creditos_update_gestor ON creditos_viagem
    USING (fn_eh_gestor_ativo());

-- RPCs que só checavam papel = 'gestor' passam a exigir gestor ATIVO também
CREATE OR REPLACE FUNCTION definir_status_colaborador(p_usuario_id UUID, p_ativo BOOLEAN)
RETURNS usuarios AS $$
DECLARE
    v_usuario usuarios;
BEGIN
    IF NOT fn_eh_gestor_ativo() THEN
        RAISE EXCEPTION 'Apenas gestores podem alterar o status de um funcionário';
    END IF;

    SELECT * INTO v_usuario FROM usuarios WHERE id = p_usuario_id;
    IF v_usuario.id IS NULL THEN
        RAISE EXCEPTION 'Funcionário não encontrado';
    END IF;
    IF v_usuario.papel = 'gestor' THEN
        RAISE EXCEPTION 'Não é possível desativar um gestor por aqui';
    END IF;

    UPDATE usuarios SET ativo = p_ativo WHERE id = p_usuario_id
    RETURNING * INTO v_usuario;

    RETURN v_usuario;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ---------- 4) Trava o bypass direto das RPCs de confirmação/fechamento ----------
-- As RPCs abaixo ligam uma flag válida só durante a própria transação
-- (set_config(..., is_local => true)) antes de gravar; as triggers só
-- deixam "confirmado"/"status" mudar quando essa flag está ligada —
-- ou seja, um UPDATE direto na tabela (fora da RPC) passa a ser
-- barrado mesmo que a policy de UPDATE do gestor permita a linha.

CREATE OR REPLACE FUNCTION fn_protege_confirmacao_credito()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.confirmado IS DISTINCT FROM OLD.confirmado
        OR NEW.confirmado_em IS DISTINCT FROM OLD.confirmado_em)
       AND current_setting('acerto.via_confirmar_credito', true) IS DISTINCT FROM 'on' THEN
        RAISE EXCEPTION 'confirmado só pode ser alterado pelo colaborador dono do crédito, via confirmar_credito()';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_creditos_protege_confirmacao ON creditos_viagem;
CREATE TRIGGER trg_creditos_protege_confirmacao
BEFORE UPDATE ON creditos_viagem
FOR EACH ROW EXECUTE FUNCTION fn_protege_confirmacao_credito();

CREATE OR REPLACE FUNCTION confirmar_credito(p_credito_id UUID, p_confirmado BOOLEAN)
RETURNS creditos_viagem AS $$
DECLARE
    v_credito creditos_viagem;
BEGIN
    IF NOT fn_usuario_ativo() THEN
        RAISE EXCEPTION 'Sua conta está desativada';
    END IF;

    SELECT * INTO v_credito FROM creditos_viagem WHERE id = p_credito_id;
    IF v_credito.id IS NULL THEN
        RAISE EXCEPTION 'Crédito não encontrado';
    END IF;
    IF v_credito.usuario_id <> auth.uid() THEN
        RAISE EXCEPTION 'Você só pode confirmar créditos lançados para você';
    END IF;

    PERFORM set_config('acerto.via_confirmar_credito', 'on', true);
    UPDATE creditos_viagem
    SET confirmado = p_confirmado, confirmado_em = now(), notificacao_lida = FALSE
    WHERE id = p_credito_id
    RETURNING * INTO v_credito;

    RETURN v_credito;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION fn_protege_fechamento_participante()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status IS DISTINCT FROM OLD.status
        OR NEW.fechado_por IS DISTINCT FROM OLD.fechado_por
        OR NEW.fechado_em IS DISTINCT FROM OLD.fechado_em)
       AND current_setting('acerto.via_fechar_participante', true) IS DISTINCT FROM 'on' THEN
        RAISE EXCEPTION 'o fechamento do acerto só pode ser feito via fechar_acerto_participante()';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_participantes_protege_fechamento ON viagem_participantes;
CREATE TRIGGER trg_participantes_protege_fechamento
BEFORE UPDATE ON viagem_participantes
FOR EACH ROW EXECUTE FUNCTION fn_protege_fechamento_participante();

CREATE OR REPLACE FUNCTION fechar_acerto_participante(p_viagem_id UUID, p_usuario_id UUID)
RETURNS viagem_participantes AS $$
DECLARE
    v_pendentes      INT;
    v_nao_confirmados INT;
    v_participante   viagem_participantes;
    v_total_part     INT;
    v_fechados       INT;
BEGIN
    IF NOT fn_eh_gestor_ativo() THEN
        RAISE EXCEPTION 'Apenas gestores podem fechar o acerto';
    END IF;

    SELECT COUNT(*) INTO v_pendentes
    FROM despesas
    WHERE viagem_id = p_viagem_id AND usuario_id = p_usuario_id AND status = 'pendente';
    IF v_pendentes > 0 THEN
        RAISE EXCEPTION 'Este colaborador ainda tem % despesa(s) pendente(s)', v_pendentes;
    END IF;

    SELECT COUNT(*) INTO v_nao_confirmados
    FROM creditos_viagem
    WHERE viagem_id = p_viagem_id AND usuario_id = p_usuario_id
      AND COALESCE(confirmado, FALSE) = FALSE;
    IF v_nao_confirmados > 0 THEN
        RAISE EXCEPTION 'Este colaborador ainda tem % crédito(s) não confirmado(s)', v_nao_confirmados;
    END IF;

    PERFORM set_config('acerto.via_fechar_participante', 'on', true);
    UPDATE viagem_participantes
    SET status = 'fechado', fechado_por = auth.uid(), fechado_em = now()
    WHERE viagem_id = p_viagem_id AND usuario_id = p_usuario_id
    RETURNING * INTO v_participante;

    IF v_participante.usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não é participante desta viagem';
    END IF;

    -- Quando todo mundo já fechou, marca a viagem inteira como fechada
    -- (isso é só um resumo visual — a verdade é sempre viagem_participantes).
    SELECT COUNT(*) INTO v_total_part FROM viagem_participantes WHERE viagem_id = p_viagem_id;
    SELECT COUNT(*) INTO v_fechados FROM viagem_participantes WHERE viagem_id = p_viagem_id AND status = 'fechado';
    IF v_total_part > 0 AND v_total_part = v_fechados THEN
        UPDATE viagens SET status = 'fechada', fechada_por = auth.uid(), fechada_em = now()
        WHERE id = p_viagem_id;
    END IF;

    RETURN v_participante;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
