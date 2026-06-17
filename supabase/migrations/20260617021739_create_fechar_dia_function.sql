-- =============================================================
-- Fase 1.2 -- Funcao de fechamento do dia + RPC manual
-- =============================================================
-- Iteracao: docs/iteracoes/2026-06-16_fechamento-diario
--
-- Janela do dia calculada em America/Sao_Paulo via timezone() —
-- robusto a horario de verao (mesmo o Brasil nao tendo DST hoje).
-- Idempotente: upsert por (user_id, data). Pode refazer a vontade.

-- -------------------------------------------------------------
-- 1. Core: fecha o dia p_data de UM usuario (upsert).
--    SECURITY DEFINER pra gravar mesmo sem policy de escrita.
--    NAO recebe grant pra authenticated/anon (so cron e a RPC
--    fechar_dia_atual chamam, sempre com user_id controlado).
-- -------------------------------------------------------------
create or replace function public.fechar_dia(p_data date, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inicio timestamptz := timezone('America/Sao_Paulo', p_data::timestamp);
  v_fim    timestamptz := timezone('America/Sao_Paulo', (p_data + 1)::timestamp);
  v_total_lavagens integer;
  v_faturamento    numeric(10,2);
  v_novos_clientes integer;
  v_detalhe        jsonb;
begin
  -- agregados de lavagens (por entrada_em na janela do dia)
  select count(*), coalesce(sum(l.valor), 0)
    into v_total_lavagens, v_faturamento
  from public.lavagens l
  where l.user_id = p_user_id
    and l.entrada_em >= v_inicio
    and l.entrada_em <  v_fim;

  -- novos clientes cadastrados no dia
  select count(*)
    into v_novos_clientes
  from public.clientes c
  where c.user_id = p_user_id
    and c.created_at >= v_inicio
    and c.created_at <  v_fim;

  -- detalhe imutavel: lista das lavagens do dia
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',         l.id,
        'cliente',    c.nome,
        'placa',      v.placa,
        'modelo',     v.modelo,
        'servico',    s.nome,
        'valor',      l.valor,
        'status',     l.status_atual,
        'entrada_em', l.entrada_em
      )
      order by l.entrada_em asc
    ),
    '[]'::jsonb
  )
    into v_detalhe
  from public.lavagens l
  join public.clientes c        on c.id = l.cliente_id
  join public.veiculos v        on v.id = l.veiculo_id
  join public.servicos_lavagem s on s.id = l.servico_id
  where l.user_id = p_user_id
    and l.entrada_em >= v_inicio
    and l.entrada_em <  v_fim;

  insert into public.fechamentos_diarios
    (user_id, data, total_lavagens, faturamento, novos_clientes, detalhe)
  values
    (p_user_id, p_data, v_total_lavagens, v_faturamento, v_novos_clientes, v_detalhe)
  on conflict (user_id, data) do update set
    total_lavagens = excluded.total_lavagens,
    faturamento    = excluded.faturamento,
    novos_clientes = excluded.novos_clientes,
    detalhe        = excluded.detalhe,
    updated_at     = now();
end;
$$;

-- -------------------------------------------------------------
-- 2. Wrapper do cron: fecha p_data pra todos os usuarios com
--    atividade no dia (lavagens OU clientes novos).
-- -------------------------------------------------------------
create or replace function public.fechar_dia(p_data date)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user   uuid;
  v_inicio timestamptz := timezone('America/Sao_Paulo', p_data::timestamp);
  v_fim    timestamptz := timezone('America/Sao_Paulo', (p_data + 1)::timestamp);
begin
  for v_user in
    select user_id from public.lavagens
      where entrada_em >= v_inicio and entrada_em < v_fim
    union
    select user_id from public.clientes
      where created_at >= v_inicio and created_at < v_fim
  loop
    perform public.fechar_dia(p_data, v_user);
  end loop;
end;
$$;

-- -------------------------------------------------------------
-- 3. RPC manual: o gestor autenticado fecha/refecha o dia
--    corrente (Brasilia).
--    SECURITY DEFINER porque chama fechar_dia(date,uuid), que nao
--    tem grant pra authenticated. Continua seguro: o usuario vem
--    sempre de auth.uid(), nunca de parametro -> o gestor so
--    consegue fechar o proprio dia.
-- -------------------------------------------------------------
create or replace function public.fechar_dia_atual()
returns date
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
begin
  if v_uid is null then
    raise exception 'nao autenticado';
  end if;
  perform public.fechar_dia(v_hoje, v_uid);
  return v_hoje;
end;
$$;

-- -------------------------------------------------------------
-- 4. Privilegios: so a RPC manual e exposta ao gestor.
--    O cron roda como postgres (owner) e nao precisa de grant.
-- -------------------------------------------------------------
revoke all on function public.fechar_dia(date, uuid) from public;
revoke all on function public.fechar_dia(date)       from public;
revoke all on function public.fechar_dia_atual()     from public;
grant execute on function public.fechar_dia_atual()  to authenticated;
