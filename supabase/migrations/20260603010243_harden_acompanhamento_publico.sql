-- =============================================================
-- Fase 1 -- Hardening do acompanhamento publico por token
-- =============================================================
-- Iteracao: docs/iteracoes/2026-06-02_hardening-pos-analise
-- Achado #1: policies `for select using (true)` em lavagens e
-- eventos_lavagem vazavam TODAS as linhas via anon key.
-- Solucao: RPC SECURITY DEFINER que retorna apenas a lavagem do
-- token + remocao das policies inseguras + token mais forte.

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- 1. RPC publica: retorna a lavagem do token (e somente ela)
--    como jsonb com cliente/veiculo/servico aninhados + eventos.
-- -------------------------------------------------------------
create or replace function public.get_lavagem_publica(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  select
    to_jsonb(l)
    || jsonb_build_object(
         'cliente', to_jsonb(c),
         'veiculo', to_jsonb(v),
         'servico', to_jsonb(s),
         'eventos', coalesce(
           (
             select jsonb_agg(to_jsonb(e) order by e.created_at asc)
             from public.eventos_lavagem e
             where e.lavagem_id = l.id
           ),
           '[]'::jsonb
         )
       )
  into v_result
  from public.lavagens l
  join public.clientes c on c.id = l.cliente_id
  join public.veiculos v on v.id = l.veiculo_id
  join public.servicos_lavagem s on s.id = l.servico_id
  where l.token_publico = p_token;

  return v_result; -- null quando o token nao existe
end;
$$;

-- Apenas execucao via RPC; sem acesso direto as tabelas.
revoke all on function public.get_lavagem_publica(text) from public;
grant execute on function public.get_lavagem_publica(text) to anon, authenticated;

-- -------------------------------------------------------------
-- 2. Remover policies inseguras (using(true))
-- -------------------------------------------------------------
drop policy if exists "Publico pode ver lavagem por token" on public.lavagens;
drop policy if exists "Publico pode ver eventos de lavagem" on public.eventos_lavagem;

-- -------------------------------------------------------------
-- 3. Reforcar token publico (128 bits) para novas lavagens.
--    Nao altera tokens existentes.
-- -------------------------------------------------------------
alter table public.lavagens
  alter column token_publico set default encode(gen_random_bytes(16), 'hex');
