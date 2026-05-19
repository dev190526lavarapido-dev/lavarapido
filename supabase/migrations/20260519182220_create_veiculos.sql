create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  placa text not null,
  modelo text not null default '',
  cor text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_veiculos_user_id on public.veiculos(user_id);
create index idx_veiculos_cliente_id on public.veiculos(cliente_id);
