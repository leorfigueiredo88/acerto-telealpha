-- ============================================================
-- DESATIVAR / REATIVAR FUNCIONÁRIO
--
-- Não é possível apagar de verdade a conta de outra pessoa (auth.users)
-- sem a service role key, e mesmo que fosse possível, isso quebraria o
-- histórico de despesas/viagens/créditos já lançados por ela (FKs sem
-- ON DELETE CASCADE, de propósito — é auditoria financeira). Em vez
-- disso, o gestor desativa o colaborador: ele some das listas de
-- participantes e não consegue mais logar, mas todo o histórico dele
-- permanece intacto para relatórios antigos.
-- ============================================================

CREATE OR REPLACE FUNCTION definir_status_colaborador(p_usuario_id UUID, p_ativo BOOLEAN)
RETURNS usuarios AS $$
DECLARE
    v_usuario usuarios;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND papel = 'gestor') THEN
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
