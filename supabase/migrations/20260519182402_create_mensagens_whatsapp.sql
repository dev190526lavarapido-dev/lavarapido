create table public.mensagens_whatsapp (
  id uuid primary key default gen_random_uuid(),
  lavagem_id uuid not null references public.lavagens(id) on delete cascade,
  tipo text not null,
  mensagem text not null default '',
  link text not null default '',
  created_at timestamptz not null default now()
);

create index idx_mensagens_whatsapp_lavagem_id on public.mensagens_whatsapp(lavagem_id);
