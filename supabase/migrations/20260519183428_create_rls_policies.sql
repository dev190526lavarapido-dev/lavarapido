-- ============================================================
-- RLS Policies — MVP Lava Rápido
-- Slice 2.3
-- ============================================================

-- 1. Habilitar RLS em todas as tabelas
alter table public.configuracoes_loja enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.servicos_lavagem enable row level security;
alter table public.lavagens enable row level security;
alter table public.eventos_lavagem enable row level security;
alter table public.mensagens_whatsapp enable row level security;

-- ============================================================
-- 2. Policies do gestor (auth.uid() = user_id)
-- ============================================================

-- configuracoes_loja
create policy "Gestor pode ver seus dados" on public.configuracoes_loja
  for select using (auth.uid() = user_id);

create policy "Gestor pode inserir seus dados" on public.configuracoes_loja
  for insert with check (auth.uid() = user_id);

create policy "Gestor pode atualizar seus dados" on public.configuracoes_loja
  for update using (auth.uid() = user_id);

create policy "Gestor pode deletar seus dados" on public.configuracoes_loja
  for delete using (auth.uid() = user_id);

-- clientes
create policy "Gestor pode ver seus dados" on public.clientes
  for select using (auth.uid() = user_id);

create policy "Gestor pode inserir seus dados" on public.clientes
  for insert with check (auth.uid() = user_id);

create policy "Gestor pode atualizar seus dados" on public.clientes
  for update using (auth.uid() = user_id);

create policy "Gestor pode deletar seus dados" on public.clientes
  for delete using (auth.uid() = user_id);

-- veiculos
create policy "Gestor pode ver seus dados" on public.veiculos
  for select using (auth.uid() = user_id);

create policy "Gestor pode inserir seus dados" on public.veiculos
  for insert with check (auth.uid() = user_id);

create policy "Gestor pode atualizar seus dados" on public.veiculos
  for update using (auth.uid() = user_id);

create policy "Gestor pode deletar seus dados" on public.veiculos
  for delete using (auth.uid() = user_id);

-- servicos_lavagem
create policy "Gestor pode ver seus dados" on public.servicos_lavagem
  for select using (auth.uid() = user_id);

create policy "Gestor pode inserir seus dados" on public.servicos_lavagem
  for insert with check (auth.uid() = user_id);

create policy "Gestor pode atualizar seus dados" on public.servicos_lavagem
  for update using (auth.uid() = user_id);

create policy "Gestor pode deletar seus dados" on public.servicos_lavagem
  for delete using (auth.uid() = user_id);

-- lavagens
create policy "Gestor pode ver seus dados" on public.lavagens
  for select using (auth.uid() = user_id);

create policy "Gestor pode inserir seus dados" on public.lavagens
  for insert with check (auth.uid() = user_id);

create policy "Gestor pode atualizar seus dados" on public.lavagens
  for update using (auth.uid() = user_id);

create policy "Gestor pode deletar seus dados" on public.lavagens
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 3. Policies de eventos_lavagem e mensagens_whatsapp (via join)
-- ============================================================

-- eventos_lavagem
create policy "Gestor ve eventos das suas lavagens" on public.eventos_lavagem
  for select using (
    exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid())
  );

create policy "Gestor insere eventos nas suas lavagens" on public.eventos_lavagem
  for insert with check (
    exists (select 1 from public.lavagens where lavagens.id = eventos_lavagem.lavagem_id and lavagens.user_id = auth.uid())
  );

-- mensagens_whatsapp
create policy "Gestor ve mensagens das suas lavagens" on public.mensagens_whatsapp
  for select using (
    exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid())
  );

create policy "Gestor insere mensagens nas suas lavagens" on public.mensagens_whatsapp
  for insert with check (
    exists (select 1 from public.lavagens where lavagens.id = mensagens_whatsapp.lavagem_id and lavagens.user_id = auth.uid())
  );

-- ============================================================
-- 4. Policies públicas (vitrine e acompanhamento)
-- ============================================================

-- Qualquer um pode ver config da loja (vitrine pública)
create policy "Publico pode ver config da loja" on public.configuracoes_loja
  for select using (true);

-- Qualquer um pode ver serviços ativos (vitrine pública)
create policy "Publico pode ver servicos ativos" on public.servicos_lavagem
  for select using (ativo = true);

-- Qualquer um pode ver lavagem por token (acompanhamento público)
-- Nota: a filtragem por token é feita na query, não no RLS
create policy "Publico pode ver lavagem por token" on public.lavagens
  for select using (true);

-- Qualquer um pode ver eventos de lavagem (acompanhamento público)
create policy "Publico pode ver eventos de lavagem" on public.eventos_lavagem
  for select using (true);

-- ============================================================
-- 5. Storage bucket público para logos
-- ============================================================

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Qualquer um pode ver logos
create policy "Logos são públicas" on storage.objects
  for select using (bucket_id = 'logos');

-- Gestor autenticado pode fazer upload
create policy "Gestor pode fazer upload de logo" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');

-- Gestor pode atualizar logo
create policy "Gestor pode atualizar logo" on storage.objects
  for update using (bucket_id = 'logos' and auth.role() = 'authenticated');

-- Gestor pode deletar logo
create policy "Gestor pode deletar logo" on storage.objects
  for delete using (bucket_id = 'logos' and auth.role() = 'authenticated');
