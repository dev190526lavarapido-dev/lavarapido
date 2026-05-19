create table public.eventos_lavagem (
  id uuid primary key default gen_random_uuid(),
  lavagem_id uuid not null references public.lavagens(id) on delete cascade,
  status text not null,
  descricao text not null default '',
  created_at timestamptz not null default now()
);

create index idx_eventos_lavagem_lavagem_id on public.eventos_lavagem(lavagem_id);
