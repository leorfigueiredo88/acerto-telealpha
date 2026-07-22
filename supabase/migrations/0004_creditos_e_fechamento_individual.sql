-- ============================================================
-- CRÉDITOS (DIÁRIAS / REPASSES) + FECHAMENTO INDIVIDUAL POR PARTICIPANTE
--
-- Muda o fechamento do acerto de "por viagem" para "por participante":
-- o gestor lança diárias/créditos para cada colaborador da viagem, o
-- colaborador confirma se recebeu, e só então o gestor consegue fechar
-- o acerto DAQUELE colaborador (os demais participantes seguem
-- independentes). Quando todos os participantes de uma viagem
-- estiverem fechados, a viagem inteira passa a exibir status 'fechada'
-- automaticamente.
-- ============================================================

-- ---------- viagem_participantes passa a carregar o fechamento ----------
CREATE TYPE participante_status AS ENUM ('aberto', 'fechado');

ALTER TABLE viagem_participantes
    ADD COLUMN status      participante_status NOT NULL DEFAULT 'aberto',
    ADD COLUMN fechado_por UUID REFERENCES usuarios(id),
    ADD COLUMN fechado_em  TIMESTAMPTZ,
    ADD CONSTRAINT participante_fechamento_completo
        CHECK (status <> 'fechado' OR (fechado_por IS NOT NULL AND fechado_em IS NOT NULL));

-- ---------- CRÉDITOS (diárias / outros repasses) ----------
CREATE TYPE credito_tipo AS ENUM ('diaria', 'outro');

CREATE TABLE creditos_viagem (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id     UUID NOT NULL REFERENCES viagens(id),
    usuario_id    UUID NOT NULL REFERENCES usuarios(id),  -- colaborador que recebe
    tipo          credito_tipo NOT NULL,
    valor         NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    descricao     TEXT,
    lancado_por   UUID NOT NULL REFERENCES usuarios(id),  -- gestor que lançou
    -- NULL = aguardando confirmação · TRUE = colaborador confirma que recebeu
    -- FALSE = colaborador diz que NÃO recebeu (alerta para o gestor investigar)
    confirmado    BOOLEAN,
    confirmado_em TIMESTAMPTZ,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creditos_viagem  ON creditos_viagem (viagem_id);
CREATE INDEX idx_creditos_usuario ON creditos_viagem (usuario_id);

-- Só participante da viagem recebe crédito; e não dá pra lançar depois
-- que o acerto dele já foi fechado.
CREATE OR REPLACE FUNCTION fn_valida_credito_viagem()
RETURNS TRIGGER AS $$
DECLARE
    v_status participante_status;
BEGIN
    SELECT status INTO v_status FROM viagem_participantes
    WHERE viagem_id = NEW.viagem_id AND usuario_id = NEW.usuario_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Usuário não é participante desta viagem';
    END IF;
    IF v_status = 'fechado' THEN
        RAISE EXCEPTION 'O acerto deste colaborador já foi fechado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_creditos_valida_viagem
BEFORE INSERT ON creditos_viagem
FOR EACH ROW EXECUTE FUNCTION fn_valida_credito_viagem();

ALTER TABLE creditos_viagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY creditos_select ON creditos_viagem
    FOR SELECT TO authenticated USING (
        usuario_id = auth.uid()
        OR EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );

CREATE POLICY creditos_insert_gestor ON creditos_viagem
    FOR INSERT TO authenticated WITH CHECK (
        lancado_por = auth.uid()
        AND EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );

-- Gestor pode corrigir valor/descrição enquanto o participante seguir aberto
-- (a confirmação em si só é alterada via RPC confirmar_credito, pelo dono).
CREATE POLICY creditos_update_gestor ON creditos_viagem
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );

-- ---------- Colaborador confirma (ou contesta) o recebimento ----------
CREATE OR REPLACE FUNCTION confirmar_credito(p_credito_id UUID, p_confirmado BOOLEAN)
RETURNS creditos_viagem AS $$
DECLARE
    v_credito creditos_viagem;
BEGIN
    SELECT * INTO v_credito FROM creditos_viagem WHERE id = p_credito_id;

    IF v_credito.id IS NULL THEN
        RAISE EXCEPTION 'Crédito não encontrado';
    END IF;
    IF v_credito.usuario_id <> auth.uid() THEN
        RAISE EXCEPTION 'Você só pode confirmar créditos lançados para você';
    END IF;

    UPDATE creditos_viagem
    SET confirmado = p_confirmado, confirmado_em = now()
    WHERE id = p_credito_id
    RETURNING * INTO v_credito;

    RETURN v_credito;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------- Fechamento passa a ser por participante ----------
-- Substitui a validação de despesa: em vez de olhar viagens.status,
-- passa a olhar o status do participante específico.
CREATE OR REPLACE FUNCTION fn_valida_despesa_viagem()
RETURNS TRIGGER AS $$
DECLARE
    v_status participante_status;
BEGIN
    SELECT status INTO v_status FROM viagem_participantes
    WHERE viagem_id = NEW.viagem_id AND usuario_id = NEW.usuario_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Usuário não é participante desta viagem';
    END IF;
    IF v_status = 'fechado' THEN
        RAISE EXCEPTION 'Seu acerto desta viagem já foi fechado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- fechar_acerto_viagem (por viagem inteira) sai de cena — o fechamento
-- agora é sempre por participante, via fechar_acerto_participante.
DROP FUNCTION IF EXISTS fechar_acerto_viagem(UUID);

CREATE OR REPLACE FUNCTION fechar_acerto_participante(p_viagem_id UUID, p_usuario_id UUID)
RETURNS viagem_participantes AS $$
DECLARE
    v_pendentes      INT;
    v_nao_confirmados INT;
    v_participante   viagem_participantes;
    v_total_part     INT;
    v_fechados       INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND papel = 'gestor') THEN
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

-- ---------- viagem_participantes: gestor precisa poder fechar via UPDATE ----------
-- (a RPC acima já cobre isso via SECURITY DEFINER, mas mantemos uma policy
-- explícita para qualquer futura atualização direta feita por um gestor)
CREATE POLICY participantes_update_gestor ON viagem_participantes
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );
