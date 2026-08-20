-- ============================================================
-- GESTOR: excluir viagem (em cascata) + editar valor de crédito já
-- confirmado (reabre a confirmação do colaborador)
-- ============================================================

-- ---------- 1) Excluir viagem apaga despesas/créditos junto ----------
-- Os FKs de despesas/creditos_viagem para viagens não tinham ON DELETE
-- CASCADE (só viagem_participantes tinha, desde a migration 0001) —
-- por padrão isso bloqueava o DELETE com erro de FK sempre que a
-- viagem já tivesse qualquer despesa ou crédito lançado.
DO $$
DECLARE
    v_nome text;
BEGIN
    SELECT conname INTO v_nome FROM pg_constraint
    WHERE conrelid = 'despesas'::regclass AND confrelid = 'viagens'::regclass AND contype = 'f';
    EXECUTE format('ALTER TABLE despesas DROP CONSTRAINT %I', v_nome);
END $$;
ALTER TABLE despesas
    ADD CONSTRAINT despesas_viagem_id_fkey FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;

DO $$
DECLARE
    v_nome text;
BEGIN
    SELECT conname INTO v_nome FROM pg_constraint
    WHERE conrelid = 'creditos_viagem'::regclass AND confrelid = 'viagens'::regclass AND contype = 'f';
    EXECUTE format('ALTER TABLE creditos_viagem DROP CONSTRAINT %I', v_nome);
END $$;
ALTER TABLE creditos_viagem
    ADD CONSTRAINT creditos_viagem_viagem_id_fkey FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;

-- despesa_eventos já cascateia a partir de despesas (ON DELETE CASCADE
-- desde a migration 0001), então não precisa de ajuste aqui.

CREATE POLICY viagens_delete_gestor ON viagens
    FOR DELETE TO authenticated USING (fn_eh_gestor_ativo());

-- Nota: isso NÃO apaga os arquivos de comprovante já enviados ao
-- Storage (bucket "comprovantes") — eles ficam órfãos. Removê-los
-- exigiria uma rotina à parte; não é feito aqui.


-- ---------- 2) Gestor edita valor/descrição de um crédito já lançado
--              — mesmo depois de confirmado, e mesmo com o acerto do
--              colaborador já fechado. Isso sempre reabre a
--              confirmação (o colaborador precisa aprovar de novo) e,
--              se o acerto dele já estava fechado, reabre também o
--              fechamento (as pré-condições de fechar exigiam todo
--              crédito confirmado — deixaram de valer). ----------
CREATE OR REPLACE FUNCTION editar_credito(p_credito_id UUID, p_valor NUMERIC, p_descricao TEXT)
RETURNS creditos_viagem AS $$
DECLARE
    v_credito creditos_viagem;
BEGIN
    IF NOT fn_eh_gestor_ativo() THEN
        RAISE EXCEPTION 'Apenas gestores podem alterar um crédito';
    END IF;
    IF p_valor IS NULL OR p_valor <= 0 THEN
        RAISE EXCEPTION 'Informe um valor válido';
    END IF;

    SELECT * INTO v_credito FROM creditos_viagem WHERE id = p_credito_id;
    IF v_credito.id IS NULL THEN
        RAISE EXCEPTION 'Crédito não encontrado';
    END IF;

    PERFORM set_config('acerto.via_confirmar_credito', 'on', true);
    UPDATE creditos_viagem
    SET valor = p_valor, descricao = p_descricao,
        confirmado = NULL, confirmado_em = NULL, notificacao_lida = TRUE
    WHERE id = p_credito_id
    RETURNING * INTO v_credito;

    PERFORM set_config('acerto.via_fechar_participante', 'on', true);
    UPDATE viagem_participantes
    SET status = 'aberto', fechado_por = NULL, fechado_em = NULL
    WHERE viagem_id = v_credito.viagem_id AND usuario_id = v_credito.usuario_id AND status = 'fechado';

    UPDATE viagens SET status = 'aberta', fechada_por = NULL, fechada_em = NULL
    WHERE id = v_credito.viagem_id AND status = 'fechada';

    RETURN v_credito;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
