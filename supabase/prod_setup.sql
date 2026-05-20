-- ============================================================
-- SETUP COMPLETO PARA SUPABASE PROD
-- Rodar no SQL Editor do Supabase Dashboard (jlcjguchifzvhkczveie)
-- IMPORTANTE: Criar o usuario gestor ANTES no Auth > Users > Add User
-- ============================================================

-- ============================================================
-- 1. TABELAS
-- ============================================================

-- configuracoes_loja
create table if not exists public.configuracoes_loja (
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
  cor_primaria text not null default '#11A37F',
  paleta text not null default 'esmeralda' check (paleta in ('esmeralda', 'oceano', 'sol-coral', 'lavanda', 'asfalto')),
  mensagens_etapas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_configuracoes_loja_user_id on public.configuracoes_loja(user_id);

-- clientes
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_clientes_user_id on public.clientes(user_id);

-- veiculos
create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  placa text not null,
  modelo text not null default '',
  cor text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_veiculos_user_id on public.veiculos(user_id);
create index if not exists idx_veiculos_cliente_id on public.veiculos(cliente_id);

-- servicos_lavagem
create table if not exists public.servicos_lavagem (
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
create index if not exists idx_servicos_lavagem_user_id on public.servicos_lavagem(user_id);

-- lavagens
do $$ begin
  create type public.lavagem_status as enum (
    'aguardando_lavagem', 'lavando', 'lavagem_concluida', 'ocorrencia', 'retirado'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.lavagens (
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
create index if not exists idx_lavagens_user_id on public.lavagens(user_id);
create index if not exists idx_lavagens_token_publico on public.lavagens(token_publico);
create index if not exists idx_lavagens_status_atual on public.lavagens(status_atual);
create index if not exists idx_lavagens_ativa on public.lavagens(ativa) where ativa = true;

-- eventos_lavagem
create table if not exists public.eventos_lavagem (
  id uuid primary key default gen_random_uuid(),
  lavagem_id uuid not null references public.lavagens(id) on delete cascade,
  status text not null,
  descricao text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_eventos_lavagem_lavagem_id on public.eventos_lavagem(lavagem_id);

-- mensagens_whatsapp
create table if not exists public.mensagens_whatsapp (
  id uuid primary key default gen_random_uuid(),
  lavagem_id uuid not null references public.lavagens(id) on delete cascade,
  tipo text not null,
  mensagem text not null default '',
  link text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_mensagens_whatsapp_lavagem_id on public.mensagens_whatsapp(lavagem_id);

-- ============================================================
-- 2. TRIGGER updated_at
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger set_updated_at before update on public.configuracoes_loja for each row execute function public.handle_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger set_updated_at before update on public.clientes for each row execute function public.handle_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger set_updated_at before update on public.veiculos for each row execute function public.handle_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger set_updated_at before update on public.servicos_lavagem for each row execute function public.handle_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger set_updated_at before update on public.lavagens for each row execute function public.handle_updated_at();
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

alter table public.configuracoes_loja enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.servicos_lavagem enable row level security;
alter table public.lavagens enable row level security;
alter table public.eventos_lavagem enable row level security;
alter table public.mensagens_whatsapp enable row level security;

-- configuracoes_loja
create policy "Gestor pode ver seus dados" on public.configuracoes_loja for select using (auth.uid() = user_id);
create policy "Gestor pode inserir seus dados" on public.configuracoes_loja for insert with check (auth.uid() = user_id);
create policy "Gestor pode atualizar seus dados" on public.configuracoes_loja for update using (auth.uid() = user_id);
create policy "Gestor pode deletar seus dados" on public.configuracoes_loja for delete using (auth.uid() = user_id);
create policy "Publico pode ver config da loja" on public.configuracoes_loja for select using (true);

-- clientes
create policy "Gestor pode ver seus dados" on public.clientes for select using (auth.uid() = user_id);
create policy "Gestor pode inserir seus dados" on public.clientes for insert with check (auth.uid() = user_id);
create policy "Gestor pode atualizar seus dados" on public.clientes for update using (auth.uid() = user_id);
create policy "Gestor pode deletar seus dados" on public.clientes for delete using (auth.uid() = user_id);

-- veiculos
create policy "Gestor pode ver seus dados" on public.veiculos for select using (auth.uid() = user_id);
create policy "Gestor pode inserir seus dados" on public.veiculos for insert with check (auth.uid() = user_id);
create policy "Gestor pode atualizar seus dados" on public.veiculos for update using (auth.uid() = user_id);
create policy "Gestor pode deletar seus dados" on public.veiculos for delete using (auth.uid() = user_id);

-- servicos_lavagem
create policy "Gestor pode ver seus dados" on public.servicos_lavagem for select using (auth.uid() = user_id);
create policy "Gestor pode inserir seus dados" on public.servicos_lavagem for insert with check (auth.uid() = user_id);
create policy "Gestor pode atualizar seus dados" on public.servicos_lavagem for update using (auth.uid() = user_id);
create policy "Gestor pode deletar seus dados" on public.servicos_lavagem for delete using (auth.uid() = user_id);
create policy "Publico pode ver servicos ativos" on public.servicos_lavagem for select using (ativo = true);

-- lavagens
create policy "Gestor pode ver seus dados" on public.lavagens for select using (auth.uid() = user_id);
create policy "Gestor pode inserir seus dados" on public.lavagens for insert with check (auth.uid() = user_id);
create policy "Gestor pode atualizar seus dados" on public.lavagens for update using (auth.uid() = user_id);
create policy "Gestor pode deletar seus dados" on public.lavagens for delete using (auth.uid() = user_id);
create policy "Publico pode ver lavagem por token" on public.lavagens for select using (true);

-- eventos_lavagem
create policy "Gestor ve eventos das suas lavagens" on public.eventos_lavagem for select using (exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid()));
create policy "Gestor insere eventos nas suas lavagens" on public.eventos_lavagem for insert with check (exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid()));
create policy "Publico pode ver eventos de lavagem" on public.eventos_lavagem for select using (true);

-- mensagens_whatsapp
create policy "Gestor ve mensagens das suas lavagens" on public.mensagens_whatsapp for select using (exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid()));
create policy "Gestor insere mensagens nas suas lavagens" on public.mensagens_whatsapp for insert with check (exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid()));

-- ============================================================
-- 4. STORAGE BUCKETS
-- ============================================================

-- Bucket logos (da migration original de RLS)
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;
create policy "Logos sao publicas" on storage.objects for select using (bucket_id = 'logos');
create policy "Gestor pode fazer upload de logo" on storage.objects for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "Gestor pode atualizar logo" on storage.objects for update using (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "Gestor pode deletar logo" on storage.objects for delete using (bucket_id = 'logos' and auth.role() = 'authenticated');

-- Bucket loja (logo upload novo)
insert into storage.buckets (id, name, public) values ('loja', 'loja', true) on conflict (id) do nothing;
create policy "Leitura publica bucket loja" on storage.objects for select using (bucket_id = 'loja');
create policy "Upload autenticado bucket loja" on storage.objects for insert with check (bucket_id = 'loja' and auth.role() = 'authenticated');
create policy "Update autenticado bucket loja" on storage.objects for update using (bucket_id = 'loja' and auth.role() = 'authenticated');
create policy "Delete autenticado bucket loja" on storage.objects for delete using (bucket_id = 'loja' and auth.role() = 'authenticated');

-- ============================================================
-- FIM — Agora crie o usuario gestor em Auth > Users > Add User
-- e rode o seed_gestor.sql com o UUID gerado
-- ============================================================
