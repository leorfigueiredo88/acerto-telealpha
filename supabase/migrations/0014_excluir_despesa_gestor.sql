-- ============================================================
-- GESTOR: excluir uma despesa (ex.: aprovou sem querer)
--
-- Não existia nenhuma policy de DELETE em "despesas" — nem gestor
-- conseguia apagar. Agora o gestor pode excluir qualquer despesa,
-- independente do status (pendente, aprovada, recusada ou paga).
-- despesa_eventos (auditoria) já cascateia a partir de despesas
-- (ON DELETE CASCADE desde a migration 0001), então some junto.
--
-- Continua sem policy de DELETE pra colaborador — ele só edita (RPC
-- editar_despesa, migration 0012), nunca apaga.
-- ============================================================
CREATE POLICY despesas_delete_gestor ON despesas
    FOR DELETE TO authenticated USING (fn_eh_gestor_ativo());
