-- ============================================================
-- STORAGE: bucket "comprovantes" + policies de acesso
--
-- Até agora, o botão "Fotografar ou enviar recibo" no app web era
-- só uma simulação (preenchia dados de exemplo, sem anexar nenhuma
-- imagem de verdade) — por isso nunca precisou de bucket nem de
-- policy de Storage. Agora que o colaborador consegue anexar a foto
-- real da nota fiscal, o bucket precisa existir e ter regras de
-- acesso (por padrão, um bucket privado sem nenhuma policy nega
-- todo mundo — nem o próprio dono do arquivo consegue ler/gravar).
--
-- Convenção de caminho: "<usuario_id>/<arquivo>" — o primeiro nível
-- de pasta é sempre o id de quem enviou, e é isso que a policy usa
-- pra decidir quem pode ler/gravar cada objeto.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', false)
ON CONFLICT (id) DO NOTHING;

-- Colaborador só envia comprovante dentro da própria pasta
CREATE POLICY comprovantes_insert_proprio ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'comprovantes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Colaborador lê os próprios comprovantes; gestor lê todos
CREATE POLICY comprovantes_select_proprio_ou_gestor ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'comprovantes'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.papel = 'gestor')
        )
    );
