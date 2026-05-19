-- Enum pra status da lavagem
create type public.lavagem_status as enum (
  'aguardando_lavagem',
  'lavando',
  'lavagem_concluida',
  'ocorrencia',
  'retirado'
);

create table public.lavagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  servico_id uuid not null references public.servicos_lavagem(id) on delete restrict,
  token_publico text not null unique default ('lr_' || substr(md5(random()::text), 1, 12)),
  status_atual public.lavagem_status not null default 'aguardando_lavagem',
  ativa boolean not null default true,
  valor numeric(10,2) not null default 0,
  observacao text not null default '',
  ocorrencia_descricao text not null default '',
  entrada_em timestamptz not null default now(),
  retirada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_lavagens_user_id on public.lavagens(user_id);
create index idx_lavagens_token_publico on public.lavagens(token_publico);
create index idx_lavagens_status_atual on public.lavagens(status_atual);
create index idx_lavagens_ativa on public.lavagens(ativa) where ativa = true;
