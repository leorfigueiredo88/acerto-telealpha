-- ============================================================
-- COLABORADOR: editar a própria despesa (corrigir dado errado)
--
-- Só é permitido enquanto ainda não foi decidida pelo gestor
-- ("pendente") ou depois de recusada ("recusado") — nesse segundo
-- caso, editar sempre reenvia pra "pendente" (o motivo da recusa
-- deixa de valer, some da tela, mas continua registrado no
-- histórico de despesa_eventos). Uma despesa já "aprovado" ou "pago"
-- não pode mais ser editada pelo colaborador — é decisão do gestor.
--
-- Não existe policy de UPDATE direta pra colaborador em "despesas"
-- (só a RPC abaixo, SECURITY DEFINER, mexe nisso) — assim garante que
-- toda edição passa pelas regras acima, sem brecha pra alterar
-- despesa já aprovada/paga via chamada direta à API.
-- ============================================================
CREATE OR REPLACE FUNCTION editar_despesa(
    p_despesa_id UUID,
    p_valor NUMERIC,
    p_categoria_id INT,
    p_data DATE,
    p_descricao TEXT,
    p_estabelecimento TEXT,
    p_comprovante_url TEXT
)
RETURNS despesas AS $$
DECLARE
    v_despesa despesas;
BEGIN
    IF NOT fn_usuario_ativo() THEN
        RAISE EXCEPTION 'Sua conta está desativada';
    END IF;

    SELECT * INTO v_despesa FROM despesas WHERE id = p_despesa_id;
    IF v_despesa.id IS NULL THEN
        RAISE EXCEPTION 'Despesa não encontrada';
    END IF;
    IF v_despesa.usuario_id <> auth.uid() THEN
        RAISE EXCEPTION 'Você só pode editar despesas lançadas por você';
    END IF;
    IF v_despesa.status NOT IN ('pendente', 'recusado') THEN
        RAISE EXCEPTION 'Só é possível editar despesas pendentes ou recusadas';
    END IF;
    IF p_valor IS NULL OR p_valor <= 0 THEN
        RAISE EXCEPTION 'Informe um valor válido';
    END IF;

    UPDATE despesas
    SET valor = p_valor,
        categoria_id = p_categoria_id,
        data_despesa = p_data,
        descricao = p_descricao,
        estabelecimento = p_estabelecimento,
        comprovante_url = COALESCE(p_comprovante_url, comprovante_url),
        status = 'pendente',
        motivo_recusa = NULL,
        aprovado_por = NULL,
        aprovado_em = NULL
    WHERE id = p_despesa_id
    RETURNING * INTO v_despesa;

    RETURN v_despesa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
