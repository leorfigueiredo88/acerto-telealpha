-- ============================================================
-- GESTOR: reabrir o fechamento do acerto de um colaborador
--
-- Caso o colaborador tenha esquecido algo ou errado um lançamento
-- depois que o gestor já fechou o acerto dele, o gestor consegue
-- reabrir — volta pra "aberto", o colaborador pode lançar novas
-- despesas/créditos de novo. Se a viagem inteira já estava marcada
-- como "fechada" (todo mundo tinha fechado), volta pra "aberta"
-- também, já que deixou de ser verdade.
-- ============================================================
CREATE OR REPLACE FUNCTION reabrir_acerto_participante(p_viagem_id UUID, p_usuario_id UUID)
RETURNS viagem_participantes AS $$
DECLARE
    v_participante viagem_participantes;
BEGIN
    IF NOT fn_eh_gestor_ativo() THEN
        RAISE EXCEPTION 'Apenas gestores podem reabrir o acerto';
    END IF;

    SELECT * INTO v_participante FROM viagem_participantes
    WHERE viagem_id = p_viagem_id AND usuario_id = p_usuario_id;
    IF v_participante.usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não é participante desta viagem';
    END IF;
    IF v_participante.status <> 'fechado' THEN
        RAISE EXCEPTION 'Este acerto já está aberto';
    END IF;

    PERFORM set_config('acerto.via_fechar_participante', 'on', true);
    UPDATE viagem_participantes
    SET status = 'aberto', fechado_por = NULL, fechado_em = NULL
    WHERE viagem_id = p_viagem_id AND usuario_id = p_usuario_id
    RETURNING * INTO v_participante;

    UPDATE viagens SET status = 'aberta', fechada_por = NULL, fechada_em = NULL
    WHERE id = p_viagem_id AND status = 'fechada';

    RETURN v_participante;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
