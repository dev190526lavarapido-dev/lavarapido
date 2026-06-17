-- =============================================================
-- Fase 1.1 -- Tabela de fechamentos diarios (snapshot do turno)
-- =============================================================
-- Iteracao: docs/iteracoes/2026-06-16_fechamento-diario
-- PRD ref: consolidado diario (total de lavagens, faturamento,
-- novos clientes) + detalhe imutavel da lista de lavagens do dia.

create table public.fechamentos_diarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  total_lavagens integer not null default 0,
  faturamento numeric(10,2) not null default 0,
  novos_clientes integer not null default 0,
  detalhe jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, data)
);

create index idx_fechamentos_diarios_user_data
  on public.fechamentos_diarios(user_id, data desc);

-- updated_at automatico (reusa a trigger function existente)
create trigger set_updated_at before update on public.fechamentos_diarios
  for each row execute function public.handle_updated_at();

-- RLS: gestor le apenas os seus fechamentos.
-- Escrita NAO tem policy: a tabela so e gravada pela funcao
-- public.fechar_dia (SECURITY DEFINER), nunca por acesso direto.
alter table public.fechamentos_diarios enable row level security;

create policy "Gestor pode ver seus fechamentos" on public.fechamentos_diarios
  for select using (auth.uid() = user_id);
