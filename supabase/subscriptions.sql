-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — Assinaturas de visibilidade (Mercado Pago)
-- Execute no Supabase → SQL Editor
-- Idempotente: seguro para executar mais de uma vez.
-- ══════════════════════════════════════════════════════════════════


-- ── 0. Extensão UUID (mesmo padrão do schema.sql do projeto) ─────
create extension if not exists "uuid-ossp";


-- ── 1. Tabela principal ───────────────────────────────────────────
create table if not exists public.coach_subscriptions (
  id                    uuid primary key default uuid_generate_v4(),

  -- Relacionamentos
  coach_profile_id      uuid not null
    references public.coach_profiles(id) on delete cascade,
  user_id               uuid not null
    references public.users(id) on delete cascade,

  -- Dados do Mercado Pago
  mp_subscription_id    text unique,   -- preapproval.id retornado pelo MP
  mp_plan_id            text,          -- preapproval_plan_id (plano fixo no MP)
  mp_payer_id           text,          -- payer.id do MP

  -- Plano contratado — apenas planos pagos são permitidos
  -- 'free' não é assinatura: coach sem assinatura ativa simplesmente não tem linha aqui
  plan_tier             visibility_tier not null
    check (plan_tier in ('featured', 'premium')),

  value_brl             numeric(10,2) not null
    check (value_brl > 0),

  -- Status da assinatura
  -- pending   → criada, aguardando pagamento inicial
  -- active    → paga e vigente
  -- paused    → pausada pelo usuário ou inadimplência temporária
  -- suspended → suspensa por inadimplência (termo do MP)
  -- cancelled → cancelada definitivamente
  -- expired   → período encerrado sem renovação
  status text not null default 'pending'
    check (status in (
      'pending', 'active', 'paused', 'suspended', 'cancelled', 'expired'
    )),

  -- Período de vigência atual (preenchido pelo webhook)
  current_period_start  timestamptz,
  current_period_end    timestamptz,

  -- true quando o coach cancelou mas ainda tem acesso até fim do período
  cancel_at_period_end  boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ── 2. Índices ────────────────────────────────────────────────────

-- Busca por coach (página de billing)
create index if not exists idx_coach_subscriptions_coach_profile
  on public.coach_subscriptions (coach_profile_id);

-- Busca por usuário logado
create index if not exists idx_coach_subscriptions_user
  on public.coach_subscriptions (user_id);

-- Busca pelo ID da assinatura no MP (usado pelo webhook)
create index if not exists idx_coach_subscriptions_mp_id
  on public.coach_subscriptions (mp_subscription_id);

-- Busca por status (útil para jobs de expiração futuros)
create index if not exists idx_coach_subscriptions_status
  on public.coach_subscriptions (status);

-- Índice único parcial: impede múltiplas assinaturas "abertas" para o mesmo coach.
-- Um coach só pode ter uma assinatura nos status ativos/pendentes por vez.
-- Assinaturas cancelled/expired ficam de fora — são históricas e podem existir N.
create unique index if not exists idx_coach_subscriptions_one_active
  on public.coach_subscriptions (coach_profile_id)
  where status in ('pending', 'active', 'paused', 'suspended');


-- ── 3. RLS ────────────────────────────────────────────────────────
alter table public.coach_subscriptions enable row level security;

-- Coach lê apenas a própria assinatura
drop policy if exists "subscriptions: coach lê a própria" on public.coach_subscriptions;
create policy "subscriptions: coach lê a própria"
  on public.coach_subscriptions for select
  using (user_id = auth.uid());

-- Sem policies de insert/update/delete para usuários comuns.
-- O webhook usará SUPABASE_SERVICE_ROLE_KEY, que bypassa RLS automaticamente.


-- ── 4. Trigger: updated_at automático ────────────────────────────
-- Reutiliza a função set_updated_at() se já existir (criada em outros migrations),
-- ou cria aqui caso este seja o primeiro uso.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_coach_subscriptions_updated_at
  on public.coach_subscriptions;

create trigger set_coach_subscriptions_updated_at
  before update on public.coach_subscriptions
  for each row
  execute function public.set_updated_at();


-- ══════════════════════════════════════════════════════════════════
-- Verificação: rode cada query abaixo após executar o script.
-- ══════════════════════════════════════════════════════════════════
--
-- 1. Colunas criadas:
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'coach_subscriptions'
-- order by ordinal_position;
--
-- 2. Índices (deve ter 5: pk + 4 criados acima):
-- select indexname, indexdef
-- from pg_indexes
-- where tablename = 'coach_subscriptions';
--
-- 3. Policy de RLS (deve ter 1):
-- select policyname, cmd, qual
-- from pg_policies
-- where tablename = 'coach_subscriptions';
--
-- 4. Testar constraint plan_tier — deve dar erro:
-- insert into public.coach_subscriptions
--   (coach_profile_id, user_id, plan_tier, value_brl)
-- values
--   (gen_random_uuid(), gen_random_uuid(), 'free', 0);
-- → ERROR: new row violates check constraint "coach_subscriptions_plan_tier_check"
--
-- 5. Testar índice único parcial — deve dar erro na segunda inserção:
-- (use IDs reais de coach_profiles e users do seu banco)
-- insert into public.coach_subscriptions
--   (coach_profile_id, user_id, plan_tier, value_brl, status)
-- values
--   ('uuid-real-coach', 'uuid-real-user', 'featured', 14.90, 'active');
-- -- repetir com mesmo coach_profile_id e status 'active' → deve falhar com:
-- → ERROR: duplicate key value violates unique constraint "idx_coach_subscriptions_one_active"
--
-- ══════════════════════════════════════════════════════════════════
