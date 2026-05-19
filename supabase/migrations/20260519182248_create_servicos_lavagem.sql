create table public.servicos_lavagem (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text not null default '',
  valor numeric(10,2) not null default 0,
  tempo_estimado_minutos integer,
  ativo boolean not null default true,
  ordem_exibicao integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_servicos_lavagem_user_id on public.servicos_lavagem(user_id);
