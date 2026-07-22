-- ============================================================
-- TROCA DE SENHA OBRIGATÓRIA NO PRIMEIRO LOGIN
--
-- Toda conta nova nasce com senha_provisoria = true (é sempre o gestor
-- quem define a senha inicial, na aba "Equipe"). O app mostra uma tela
-- bloqueante pedindo pra trocar a senha enquanto essa flag for true.
-- ============================================================

ALTER TABLE usuarios ADD COLUMN senha_provisoria BOOLEAN NOT NULL DEFAULT TRUE;

-- Contas que já existiam antes desta migration não devem ser
-- surpreendidas com essa tela — só as criadas a partir de agora.
UPDATE usuarios SET senha_provisoria = FALSE;

-- Colaborador troca a própria senha (auth) e depois chama esta RPC pra
-- derrubar a flag. SECURITY DEFINER porque não há policy de UPDATE em
-- "usuarios" para colaboradores — e nem deveria haver uma genérica.
CREATE OR REPLACE FUNCTION marcar_senha_trocada()
RETURNS void AS $$
BEGIN
    UPDATE usuarios SET senha_provisoria = FALSE WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
