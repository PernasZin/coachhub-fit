-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — visibility_tier
-- Adiciona três níveis de visibilidade para coaches na vitrine.
--
-- Execute no Supabase → SQL Editor
-- Idempotente: seguro para executar mais de uma vez.
-- ══════════════════════════════════════════════════════════════════


-- ── 1. Criar enum (ignora se já existir) ─────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'visibility_tier'
  ) then
    create type visibility_tier as enum ('free', 'featured', 'premium');
  end if;
end
$$;


-- ── 2. Adicionar coluna (ignora se já existir) ───────────────────
alter table public.coach_profiles
  add column if not exists
    visibility_tier visibility_tier not null default 'free';


-- ── 3. Migrar dados: featured=true → tier='featured' ─────────────
--    Coaches que já eram featured ficam como featured no novo campo.
--    Coaches que já eram false ficam como free (já é o default).
update public.coach_profiles
  set visibility_tier = 'featured'
  where featured = true
    and visibility_tier = 'free';  -- evita sobrescrever se já foi migrado


-- ── 4. Índice para ordenação eficiente ───────────────────────────
--    Postgres ordena enums pela ordem de declaração do tipo:
--    free(0) < featured(1) < premium(2)
--    ORDER BY visibility_tier DESC → premium primeiro, free por último.
create index if not exists
  idx_coach_profiles_tier_rating
  on public.coach_profiles (visibility_tier desc, rating_avg desc);


-- ══════════════════════════════════════════════════════════════════
-- Verificação: rode esta query para confirmar o resultado.
-- ══════════════════════════════════════════════════════════════════
--
-- select
--   id,
--   slug,
--   approved,
--   featured,
--   visibility_tier
-- from public.coach_profiles
-- order by visibility_tier desc, rating_avg desc;
--
-- ══════════════════════════════════════════════════════════════════
