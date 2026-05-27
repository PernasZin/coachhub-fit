-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — Leads de visitantes (sem login)
-- Execute no Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- 1. Tornar student_user_id nullable
alter table public.contracts
  alter column student_user_id drop not null;

-- 2. Remover unique constraint original (inclui NULLs de forma imprevisível)
alter table public.contracts
  drop constraint if exists contracts_coach_profile_id_student_user_id_status_key;

-- 3. Recriar unique constraint só para linhas com user_id preenchido
--    Postgres ignora NULLs em unique parcial — correto para visitantes
create unique index if not exists
  contracts_unique_user_lead
  on public.contracts (coach_profile_id, student_user_id, status)
  where student_user_id is not null;

-- 4. Nova RLS policy: visitante sem login pode inserir
--    (student_user_id IS NULL e auth.uid() IS NULL)
drop policy if exists "contracts: visitante cria" on public.contracts;
create policy "contracts: visitante cria"
  on public.contracts for insert
  with check (
    student_user_id is null
    and auth.uid() is null
  );

-- ══════════════════════════════════════════════════════════════════
-- Fim
-- ══════════════════════════════════════════════════════════════════
