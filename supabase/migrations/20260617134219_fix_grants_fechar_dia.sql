-- =============================================================
-- Fix de seguranca -- grants das funcoes de fechamento
-- =============================================================
-- Iteracao: docs/iteracoes/2026-06-16_fechamento-diario
--
-- O `revoke all ... from public` da migration 20260617021739 NAO
-- foi suficiente: o Supabase tem DEFAULT PRIVILEGES que concedem
-- EXECUTE em funcoes novas do schema public DIRETAMENTE a anon,
-- authenticated e service_role. Como esses grants sao diretos (nao
-- via PUBLIC), o revoke from public nao os removeu — e um anonimo
-- conseguia chamar fechar_dia(date,uuid)/fechar_dia(date) e, sendo
-- SECURITY DEFINER, sobrescrever o fechamento de qualquer usuario.
--
-- Correcao: revogar EXECUTE de anon/authenticated nas funcoes que
-- nao devem ser chamadas pela API. Somente fechar_dia_atual fica
-- acessivel a authenticated. O cron roda como postgres (owner).

-- Core e wrapper do cron: ninguem da API chama (so cron/owner).
revoke execute on function public.fechar_dia(date, uuid) from anon, authenticated;
revoke execute on function public.fechar_dia(date)       from anon, authenticated;

-- RPC manual: só gestor autenticado. Tira anon, mantem authenticated.
revoke execute on function public.fechar_dia_atual() from anon;
grant  execute on function public.fechar_dia_atual() to authenticated;
