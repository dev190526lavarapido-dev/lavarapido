-- ============================================================
-- SETUP COMPLETO PARA SUPABASE PROD
-- Rodar no SQL Editor do Supabase Dashboard (jlcjguchifzvhkczveie)
-- IMPORTANTE: Criar o usuario gestor ANTES no Auth > Users > Add User
-- ============================================================

-- pgcrypto: necessario para gen_random_bytes (token_publico forte)
create extension if not exists pgcrypto;

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
  token_publico text not null unique default encode(gen_random_bytes(16), 'hex'),
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
drop policy if exists "Gestor pode ver seus dados" on public.configuracoes_loja;
create policy "Gestor pode ver seus dados" on public.configuracoes_loja for select using (auth.uid() = user_id);
drop policy if exists "Gestor pode inserir seus dados" on public.configuracoes_loja;
create policy "Gestor pode inserir seus dados" on public.configuracoes_loja for insert with check (auth.uid() = user_id);
drop policy if exists "Gestor pode atualizar seus dados" on public.configuracoes_loja;
create policy "Gestor pode atualizar seus dados" on public.configuracoes_loja for update using (auth.uid() = user_id);
drop policy if exists "Gestor pode deletar seus dados" on public.configuracoes_loja;
create policy "Gestor pode deletar seus dados" on public.configuracoes_loja for delete using (auth.uid() = user_id);
drop policy if exists "Publico pode ver config da loja" on public.configuracoes_loja;
create policy "Publico pode ver config da loja" on public.configuracoes_loja for select using (true);

-- clientes
drop policy if exists "Gestor pode ver seus dados" on public.clientes;
create policy "Gestor pode ver seus dados" on public.clientes for select using (auth.uid() = user_id);
drop policy if exists "Gestor pode inserir seus dados" on public.clientes;
create policy "Gestor pode inserir seus dados" on public.clientes for insert with check (auth.uid() = user_id);
drop policy if exists "Gestor pode atualizar seus dados" on public.clientes;
create policy "Gestor pode atualizar seus dados" on public.clientes for update using (auth.uid() = user_id);
drop policy if exists "Gestor pode deletar seus dados" on public.clientes;
create policy "Gestor pode deletar seus dados" on public.clientes for delete using (auth.uid() = user_id);

-- veiculos
drop policy if exists "Gestor pode ver seus dados" on public.veiculos;
create policy "Gestor pode ver seus dados" on public.veiculos for select using (auth.uid() = user_id);
drop policy if exists "Gestor pode inserir seus dados" on public.veiculos;
create policy "Gestor pode inserir seus dados" on public.veiculos for insert with check (auth.uid() = user_id);
drop policy if exists "Gestor pode atualizar seus dados" on public.veiculos;
create policy "Gestor pode atualizar seus dados" on public.veiculos for update using (auth.uid() = user_id);
drop policy if exists "Gestor pode deletar seus dados" on public.veiculos;
create policy "Gestor pode deletar seus dados" on public.veiculos for delete using (auth.uid() = user_id);

-- servicos_lavagem
drop policy if exists "Gestor pode ver seus dados" on public.servicos_lavagem;
create policy "Gestor pode ver seus dados" on public.servicos_lavagem for select using (auth.uid() = user_id);
drop policy if exists "Gestor pode inserir seus dados" on public.servicos_lavagem;
create policy "Gestor pode inserir seus dados" on public.servicos_lavagem for insert with check (auth.uid() = user_id);
drop policy if exists "Gestor pode atualizar seus dados" on public.servicos_lavagem;
create policy "Gestor pode atualizar seus dados" on public.servicos_lavagem for update using (auth.uid() = user_id);
drop policy if exists "Gestor pode deletar seus dados" on public.servicos_lavagem;
create policy "Gestor pode deletar seus dados" on public.servicos_lavagem for delete using (auth.uid() = user_id);
drop policy if exists "Publico pode ver servicos ativos" on public.servicos_lavagem;
create policy "Publico pode ver servicos ativos" on public.servicos_lavagem for select using (ativo = true);

-- lavagens
drop policy if exists "Gestor pode ver seus dados" on public.lavagens;
create policy "Gestor pode ver seus dados" on public.lavagens for select using (auth.uid() = user_id);
drop policy if exists "Gestor pode inserir seus dados" on public.lavagens;
create policy "Gestor pode inserir seus dados" on public.lavagens for insert with check (auth.uid() = user_id);
drop policy if exists "Gestor pode atualizar seus dados" on public.lavagens;
create policy "Gestor pode atualizar seus dados" on public.lavagens for update using (auth.uid() = user_id);
drop policy if exists "Gestor pode deletar seus dados" on public.lavagens;
create policy "Gestor pode deletar seus dados" on public.lavagens for delete using (auth.uid() = user_id);
-- "Publico pode ver lavagem por token" removida (using(true) vazava todas as
-- lavagens via anon key). Acesso publico agora so via RPC get_lavagem_publica.
drop policy if exists "Publico pode ver lavagem por token" on public.lavagens;

-- eventos_lavagem
drop policy if exists "Gestor ve eventos das suas lavagens" on public.eventos_lavagem;
create policy "Gestor ve eventos das suas lavagens" on public.eventos_lavagem for select using (exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid()));
drop policy if exists "Gestor insere eventos nas suas lavagens" on public.eventos_lavagem;
create policy "Gestor insere eventos nas suas lavagens" on public.eventos_lavagem for insert with check (exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid()));
-- "Publico pode ver eventos de lavagem" removida (using(true) vazava todos os
-- eventos via anon key). Acesso publico agora so via RPC get_lavagem_publica.
drop policy if exists "Publico pode ver eventos de lavagem" on public.eventos_lavagem;

-- mensagens_whatsapp
drop policy if exists "Gestor ve mensagens das suas lavagens" on public.mensagens_whatsapp;
create policy "Gestor ve mensagens das suas lavagens" on public.mensagens_whatsapp for select using (exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid()));
drop policy if exists "Gestor insere mensagens nas suas lavagens" on public.mensagens_whatsapp;
create policy "Gestor insere mensagens nas suas lavagens" on public.mensagens_whatsapp for insert with check (exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid()));

-- ============================================================
-- 4. RPC PUBLICA DE ACOMPANHAMENTO POR TOKEN
-- (espelha migration 20260603010243_harden_acompanhamento_publico)
-- ============================================================

-- RPC publica: retorna a lavagem do token (e somente ela) como jsonb
-- com cliente/veiculo/servico aninhados + eventos. Substitui as policies
-- inseguras `using(true)` removidas acima.
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

-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================

-- Bucket logos (da migration original de RLS)
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;
drop policy if exists "Logos sao publicas" on storage.objects;
create policy "Logos sao publicas" on storage.objects for select using (bucket_id = 'logos');
drop policy if exists "Gestor pode fazer upload de logo" on storage.objects;
create policy "Gestor pode fazer upload de logo" on storage.objects for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');
drop policy if exists "Gestor pode atualizar logo" on storage.objects;
create policy "Gestor pode atualizar logo" on storage.objects for update using (bucket_id = 'logos' and auth.role() = 'authenticated');
drop policy if exists "Gestor pode deletar logo" on storage.objects;
create policy "Gestor pode deletar logo" on storage.objects for delete using (bucket_id = 'logos' and auth.role() = 'authenticated');

-- Bucket loja (logo upload novo)
insert into storage.buckets (id, name, public) values ('loja', 'loja', true) on conflict (id) do nothing;
drop policy if exists "Leitura publica bucket loja" on storage.objects;
create policy "Leitura publica bucket loja" on storage.objects for select using (bucket_id = 'loja');
drop policy if exists "Upload autenticado bucket loja" on storage.objects;
create policy "Upload autenticado bucket loja" on storage.objects for insert with check (bucket_id = 'loja' and auth.role() = 'authenticated');
drop policy if exists "Update autenticado bucket loja" on storage.objects;
create policy "Update autenticado bucket loja" on storage.objects for update using (bucket_id = 'loja' and auth.role() = 'authenticated');
drop policy if exists "Delete autenticado bucket loja" on storage.objects;
create policy "Delete autenticado bucket loja" on storage.objects for delete using (bucket_id = 'loja' and auth.role() = 'authenticated');

-- ============================================================
-- FIM — Agora crie o usuario gestor em Auth > Users > Add User
-- e rode o seed_gestor.sql com o UUID gerado
-- ============================================================
