-- ============================================================
-- ATUALIZA AS CATEGORIAS DE DESPESA
-- De: Combustível, Alimentação, Hospedagem, Outros
-- Para: Alimentação, Lavanderia, Material, Outros
--
-- Usa UPDATE (não DELETE + INSERT) para preservar os ids das
-- categorias — se já existirem despesas lançadas referenciando
-- essas categorias (categoria_id), elas continuam íntegras e só
-- passam a exibir o novo nome/ícone.
-- ============================================================
UPDATE categorias SET nome = 'Alimentação', icone = 'utensils'   WHERE nome = 'Alimentação';
UPDATE categorias SET nome = 'Lavanderia',  icone = 'lavanderia' WHERE nome = 'Combustível';
UPDATE categorias SET nome = 'Material',    icone = 'material'   WHERE nome = 'Hospedagem';
UPDATE categorias SET nome = 'Outros',      icone = 'receipt'    WHERE nome = 'Outros';
