-- Configurações da loja (single-tenant no MVP)
create table public.configuracoes_loja (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_loja text not null default '',
  descricao text not null default '',
  telefone text not null default '',
  whatsapp text not null default '',
  endereco_texto text not null default '',
  maps_url text not null default '',
  horario_funcionamento text not null default '',
  instagram_url text not null default '',
  mensagem_whatsapp_padrao text not null default '',
  logo_url text,
  tema text not null default 'claro' check (tema in ('claro', 'escuro')),
  cor_primaria text not null default '#FF6B47',
  mensagens_etapas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice pra busca por user_id
create index idx_configuracoes_loja_user_id on public.configuracoes_loja(user_id);
