-- ============================================================
-- GESTOR: excluir um crédito lançado (ex.: lançou errado)
--
-- Não existia nenhuma policy de DELETE em "creditos_viagem" — nem
-- gestor conseguia apagar. Agora o gestor pode excluir qualquer
-- crédito, independente de já ter sido confirmado pelo colaborador.
--
-- Continua sem policy de DELETE pro colaborador — ele só confirma ou
-- contesta (RPC confirmar_credito, migration 0004), nunca apaga.
-- ============================================================
CREATE POLICY creditos_delete_gestor ON creditos_viagem
    FOR DELETE TO authenticated USING (fn_eh_gestor_ativo());
