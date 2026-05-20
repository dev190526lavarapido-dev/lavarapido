-- Bucket público para assets da loja (logo, etc.)
insert into storage.buckets (id, name, public)
values ('loja', 'loja', true)
on conflict (id) do nothing;

-- Qualquer pessoa pode ler (bucket público)
create policy "Leitura publica bucket loja"
on storage.objects for select
using (bucket_id = 'loja');

-- Apenas usuários autenticados podem fazer upload
create policy "Upload autenticado bucket loja"
on storage.objects for insert
with check (
  bucket_id = 'loja'
  and auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem atualizar (upsert)
create policy "Update autenticado bucket loja"
on storage.objects for update
using (
  bucket_id = 'loja'
  and auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem deletar
create policy "Delete autenticado bucket loja"
on storage.objects for delete
using (
  bucket_id = 'loja'
  and auth.role() = 'authenticated'
);
