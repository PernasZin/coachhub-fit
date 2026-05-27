-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — Storage buckets + policies
-- Execute no Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Criar buckets públicos ─────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,           -- 2 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public            = true,
  file_size_limit   = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  5242880,           -- 5 MB
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public            = true,
  file_size_limit   = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- ── 2. Policies: avatars ──────────────────────────────────────────

-- Leitura pública (qualquer visitante pode ver avatares)
drop policy if exists "avatars: leitura pública" on storage.objects;
create policy "avatars: leitura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Upload: apenas o próprio usuário, dentro da pasta {uid}/
drop policy if exists "avatars: upload próprio" on storage.objects;
create policy "avatars: upload próprio"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Update: apenas o próprio usuário
drop policy if exists "avatars: update próprio" on storage.objects;
create policy "avatars: update próprio"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Delete: apenas o próprio usuário
drop policy if exists "avatars: delete próprio" on storage.objects;
create policy "avatars: delete próprio"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ── 3. Policies: covers ───────────────────────────────────────────

drop policy if exists "covers: leitura pública" on storage.objects;
create policy "covers: leitura pública"
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "covers: upload próprio" on storage.objects;
create policy "covers: upload próprio"
  on storage.objects for insert
  with check (
    bucket_id = 'covers'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "covers: update próprio" on storage.objects;
create policy "covers: update próprio"
  on storage.objects for update
  using (
    bucket_id = 'covers'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "covers: delete próprio" on storage.objects;
create policy "covers: delete próprio"
  on storage.objects for delete
  using (
    bucket_id = 'covers'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ══════════════════════════════════════════════════════════════════
-- Fim do script de Storage
-- ══════════════════════════════════════════════════════════════════
