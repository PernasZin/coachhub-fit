-- supabase/add_approved.sql
-- Adiciona campo `approved` à coach_profiles e ajusta a RLS pública.
-- Execute no SQL Editor do Supabase Dashboard.

-- 1. Coluna
alter table public.coach_profiles
  add column if not exists approved boolean not null default false;

-- 2. Atualiza a policy pública: só mostra coaches aprovados
drop policy if exists "coach_profiles: leitura pública" on public.coach_profiles;

create policy "coach_profiles: leitura pública aprovados"
  on public.coach_profiles for select
  using (
    approved = true
    or user_id = auth.uid()   -- coach sempre vê o próprio perfil
  );

-- 3. Para testar sem processo de aprovação, aprove manualmente:
--    update public.coach_profiles set approved = true where user_id = '<seu-user-id>';
-- Ou aprove todos:
--    update public.coach_profiles set approved = true;
