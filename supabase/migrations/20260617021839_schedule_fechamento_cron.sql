-- =============================================================
-- Fase 1.3 -- Agendamento do fechamento diario via pg_cron
-- =============================================================
-- Iteracao: docs/iteracoes/2026-06-16_fechamento-diario
--
-- pg_cron roda em UTC. 03:00 UTC = 00:00 America/Sao_Paulo
-- (Brasil sem horario de verao desde 2019). A funcao calcula a
-- data-alvo com timezone('America/Sao_Paulo', now()), entao o
-- dia consolidado fica correto mesmo se o DST voltar.

create extension if not exists pg_cron;

-- Fecha o dia que acabou: (agora em Brasilia)::date - 1.
-- cron.schedule com o mesmo nome substitui o job -> reaplicar e idempotente.
select cron.schedule(
  'fechar-dia-diario',
  '0 3 * * *',
  $cron$ select public.fechar_dia((timezone('America/Sao_Paulo', now()))::date - 1) $cron$
);
