-- ============================================================
-- ADICIONA A CATEGORIA "HOSPEDAGEM"
--
-- As categorias atuais são Alimentação, Lavanderia, Material, Outros
-- (migration 0003 tinha renomeado a antiga "Hospedagem" pra
-- "Material"). Agora volta como categoria própria, sem mexer nas
-- existentes nem nas despesas já lançadas.
-- ============================================================
INSERT INTO categorias (nome, icone)
VALUES ('Hospedagem', 'hospedagem')
ON CONFLICT (nome) DO NOTHING;
