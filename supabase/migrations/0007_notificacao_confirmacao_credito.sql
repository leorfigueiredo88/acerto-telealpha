-- ============================================================
-- NOTIFICAÇÃO IN-APP: GESTOR VÊ QUANDO UM CRÉDITO É CONFIRMADO
--
-- Sem e-mail nem push — só um sinal dentro do próprio banco. Toda vez
-- que o colaborador confirma (ou contesta) um crédito, a linha fica
-- marcada como "não lida"; o app do gestor mostra um indicador
-- enquanto isso, e marca como lida quando ele abre a viagem.
-- ============================================================

ALTER TABLE creditos_viagem ADD COLUMN notificacao_lida BOOLEAN NOT NULL DEFAULT TRUE;

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
    SET confirmado = p_confirmado, confirmado_em = now(), notificacao_lida = FALSE
    WHERE id = p_credito_id
    RETURNING * INTO v_credito;

    RETURN v_credito;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
