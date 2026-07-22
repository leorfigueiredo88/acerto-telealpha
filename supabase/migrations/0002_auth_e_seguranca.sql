-- ============================================================
-- AUTENTICAÇÃO REAL + RLS COMPLETA + AJUSTES DE SCHEMA
-- Rode este arquivo no SQL Editor DEPOIS do 0001_schema_inicial.sql
-- ============================================================

-- ---------- USUÁRIOS PASSA A SER ESPELHO DE auth.users ----------
-- id deixa de ter default próprio: passa a ser sempre o id do auth.users,
-- preenchido automaticamente pelo trigger abaixo no momento do cadastro.
ALTER TABLE usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE usuarios
    ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Cria automaticamente a linha em "usuarios" quando alguém é cadastrado
-- em Authentication (papel inicial sempre 'colaborador'; promova a
-- 'gestor' manualmente via SQL — veja instruções no README).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nome, email, papel)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
        NEW.email,
        'colaborador'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- CAMPO QUE FALTAVA EM DESPESAS ----------
-- Nome do estabelecimento (usado no comprovante e no relatório de acerto).
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS estabelecimento TEXT;

-- ---------- ENDURECE fechar_acerto_viagem ----------
-- A versão original era SECURITY DEFINER sem checar o papel do chamador:
-- qualquer usuário autenticado conseguiria fechar o acerto de qualquer
-- viagem. Adiciona a checagem de gestor.
CREATE OR REPLACE FUNCTION fechar_acerto_viagem(p_viagem_id UUID)
RETURNS viagens AS $$
DECLARE
    v_pendentes INT;
    v_viagem viagens;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND papel = 'gestor') THEN
        RAISE EXCEPTION 'Apenas gestores podem fechar o acerto';
    END IF;

    SELECT COUNT(*) INTO v_pendentes
    FROM despesas WHERE viagem_id = p_viagem_id AND status = 'pendente';

    IF v_pendentes > 0 THEN
        RAISE EXCEPTION 'Acerto não pode ser fechado: % despesa(s) pendente(s)', v_pendentes;
    END IF;

    UPDATE viagens
    SET status = 'fechada', fechada_por = auth.uid(), fechada_em = now()
    WHERE id = p_viagem_id
    RETURNING * INTO v_viagem;

    RETURN v_viagem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------- RLS NAS DEMAIS TABELAS ----------
-- O 0001 só protegia "despesas". Sem RLS, qualquer usuário com a anon key
-- conseguiria ler/gravar essas tabelas livremente pela API do PostgREST.

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorias_select ON categorias
    FOR SELECT TO authenticated USING (true);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY usuarios_select ON usuarios
    FOR SELECT TO authenticated USING (true);

ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY viagens_select ON viagens
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
        OR EXISTS (SELECT 1 FROM viagem_participantes vp
                   WHERE vp.viagem_id = viagens.id AND vp.usuario_id = auth.uid())
    );
CREATE POLICY viagens_insert_gestor ON viagens
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );
CREATE POLICY viagens_update_gestor ON viagens
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );

ALTER TABLE viagem_participantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY participantes_select ON viagem_participantes
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
        OR usuario_id = auth.uid()
    );
CREATE POLICY participantes_insert_gestor ON viagem_participantes
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );
