-- ============================================================
-- CoachHub Fit — Schema completo
-- Execute inteiro no SQL Editor do Supabase (projeto limpo).
-- Ordem: extensions → enums → tabelas → indexes →
--        functions → triggers → RLS → policies
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";  -- usada em handle_new_user()


-- ============================================================
-- 2. ENUMS
-- ============================================================
create type user_role       as enum ('student', 'coach', 'admin');
create type coach_status    as enum ('online', 'offline', 'busy');
create type plan_interval   as enum ('monthly', 'quarterly', 'yearly');
create type contract_status as enum ('pending', 'active', 'paused', 'cancelled');
create type checkin_type    as enum ('weekly', 'biweekly', 'monthly');
create type message_sender  as enum ('coach', 'student');


-- ============================================================
-- 3. TABELAS
-- ============================================================

-- ── users ────────────────────────────────────────────────────
-- Espelho de auth.users. Criado automaticamente pelo trigger.
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  avatar_url  text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is
  'Perfil público vinculado a auth.users. Uma linha por usuário.';


-- ── coach_profiles ───────────────────────────────────────────
create table public.coach_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  slug              text not null unique,
  bio               text not null default '',
  short_bio         text not null default '',
  specialties       text[] not null default '{}',
  certifications    text[] not null default '{}',
  location          text not null default '',
  years_experience  integer not null default 0,
  status            coach_status not null default 'offline',
  cover_image_url   text,
  instagram_handle  text,
  youtube_handle    text,
  linkedin_url      text,
  featured          boolean not null default false,
  approved          boolean not null default false,
  students_count    integer not null default 0,  -- desnormalizado, mantido por trigger
  rating_avg        numeric(3,2) not null default 0.00,
  rating_count      integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.coach_profiles is
  'Perfil estendido do coach. Uma linha por usuário com role=coach.';


-- ── student_profiles ─────────────────────────────────────────
create table public.student_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  date_of_birth   date,
  weight_kg       numeric(5,2),
  height_cm       integer,
  goal            text,
  health_notes    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.student_profiles is
  'Perfil estendido do aluno. Uma linha por usuário com role=student.';


-- ── coach_plans ──────────────────────────────────────────────
-- Preço em centavos (ex: 29700 = R$297,00).
create table public.coach_plans (
  id               uuid primary key default uuid_generate_v4(),
  coach_profile_id uuid not null references public.coach_profiles(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  price_brl        integer not null,
  interval         plan_interval not null default 'monthly',
  features         text[] not null default '{}',
  max_students     integer not null default 10,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  duration_days    integer,           -- null = sem prazo fixo
  update_freq      text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.coach_plans is
  'Planos de atendimento definidos pelo coach. Preço em centavos.';


-- ── contracts ────────────────────────────────────────────────
create table public.contracts (
  id                 uuid primary key default uuid_generate_v4(),
  coach_profile_id   uuid not null references public.coach_profiles(id),
  student_user_id    uuid not null references public.users(id),
  coach_plan_id      uuid references public.coach_plans(id),
  status             contract_status not null default 'pending',
  started_at         timestamptz,
  ended_at           timestamptz,
  price_snapshot_brl integer,
  plan_name_snapshot text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (coach_profile_id, student_user_id, status)
);

comment on table public.contracts is
  'Contrato ativo entre aluno e coach. Histórico de status.';


-- ── checkins ─────────────────────────────────────────────────
create table public.checkins (
  id                uuid primary key default uuid_generate_v4(),
  contract_id       uuid not null references public.contracts(id) on delete cascade,
  student_user_id   uuid not null references public.users(id),
  coach_profile_id  uuid not null references public.coach_profiles(id),
  type              checkin_type not null default 'weekly',
  weight_kg         numeric(5,2),
  body_fat_pct      numeric(4,2),
  energy_level      integer check (energy_level between 1 and 10),
  sleep_hours       numeric(3,1),
  notes             text,
  photo_urls        text[] not null default '{}',
  coach_feedback    text,
  feedback_at       timestamptz,
  created_at        timestamptz not null default now()
);

comment on table public.checkins is
  'Check-in periódico do aluno. Coach responde com feedback.';


-- ── messages ─────────────────────────────────────────────────
create table public.messages (
  id               uuid primary key default uuid_generate_v4(),
  contract_id      uuid not null references public.contracts(id) on delete cascade,
  sender_role      message_sender not null,
  sender_user_id   uuid not null references public.users(id),
  content          text not null,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

comment on table public.messages is
  'Mensagens trocadas dentro de um contrato ativo.';


-- ── coach_results ────────────────────────────────────────────
create table public.coach_results (
  id               uuid primary key default uuid_generate_v4(),
  coach_profile_id uuid not null references public.coach_profiles(id) on delete cascade,
  title            text not null,
  description      text not null default '',
  before_photo_url text,
  after_photo_url  text,
  duration_weeks   integer,
  specialty        text,
  published        boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.coach_results is
  'Cases de sucesso publicados pelo coach no seu perfil público.';


-- ============================================================
-- 4. INDEXES
-- ============================================================
create index on public.coach_profiles (slug);
create index on public.coach_profiles using gin(specialties);
create index on public.coach_profiles (featured, rating_avg desc);
create index on public.coach_profiles (approved);

create index on public.coach_plans (coach_profile_id, is_active);

create index on public.contracts (coach_profile_id, status);
create index on public.contracts (student_user_id, status);

create index on public.checkins (contract_id, created_at desc);
create index on public.checkins (coach_profile_id, created_at desc);

create index on public.messages (contract_id, created_at asc);
create index on public.messages (sender_user_id);

create index on public.coach_results (coach_profile_id, published, sort_order);


-- ============================================================
-- 5. FUNCTIONS
-- ============================================================

-- ── set_updated_at ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ── handle_new_user ──────────────────────────────────────────
-- Disparado após insert em auth.users.
-- Lê role e full_name dos metadados do signUp() e cria o perfil correto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role      user_role;
  v_full_name text;
  v_slug      text;
begin
  v_role := coalesce(
    (new.raw_user_meta_data->>'role')::user_role,
    'student'
  );

  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, v_full_name, v_role);

  if v_role = 'student' then
    insert into public.student_profiles (user_id)
    values (new.id);

  elsif v_role = 'coach' then
    v_slug := lower(
      regexp_replace(
        unaccent(v_full_name),
        '[^a-z0-9]+', '-', 'g'
      )
    );
    v_slug := v_slug || '-' || substr(new.id::text, 1, 8);

    insert into public.coach_profiles (user_id, slug)
    values (new.id, v_slug);
  end if;

  return new;
end;
$$;


-- ── update_coach_students_count ──────────────────────────────
create or replace function public.update_coach_students_count()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.coach_profiles
  set students_count = (
    select count(*)
    from public.contracts
    where coach_profile_id = coalesce(new.coach_profile_id, old.coach_profile_id)
      and status = 'active'
  )
  where id = coalesce(new.coach_profile_id, old.coach_profile_id);
  return coalesce(new, old);
end;
$$;


-- ============================================================
-- 6. TRIGGERS
-- ============================================================

-- updated_at em todas as tabelas com esse campo
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_coach_profiles_updated_at
  before update on public.coach_profiles
  for each row execute function public.set_updated_at();

create trigger trg_student_profiles_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

create trigger trg_coach_plans_updated_at
  before update on public.coach_plans
  for each row execute function public.set_updated_at();

create trigger trg_contracts_updated_at
  before update on public.contracts
  for each row execute function public.set_updated_at();

create trigger trg_coach_results_updated_at
  before update on public.coach_results
  for each row execute function public.set_updated_at();

-- handle_new_user: dispara para todo novo cadastro no Auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- contagem de alunos ativos por coach
create trigger trg_contracts_students_count
  after insert or update of status or delete on public.contracts
  for each row execute function public.update_coach_students_count();


-- ============================================================
-- 7. HABILITAR RLS
-- ============================================================
alter table public.users           enable row level security;
alter table public.coach_profiles  enable row level security;
alter table public.student_profiles enable row level security;
alter table public.coach_plans     enable row level security;
alter table public.contracts       enable row level security;
alter table public.checkins        enable row level security;
alter table public.messages        enable row level security;
alter table public.coach_results   enable row level security;


-- ============================================================
-- 8. POLICIES
-- ============================================================

-- ── users ────────────────────────────────────────────────────
create policy "users: leitura pública"
  on public.users for select
  using (true);

create policy "users: atualização própria"
  on public.users for update
  using (auth.uid() = id);

create policy "users: insert via trigger"
  on public.users for insert
  with check (auth.uid() = id);


-- ── coach_profiles ───────────────────────────────────────────
-- Leitura pública: só coaches aprovados; coach sempre vê o próprio
create policy "coach_profiles: leitura pública aprovados"
  on public.coach_profiles for select
  using (
    approved = true
    or user_id = auth.uid()
  );

create policy "coach_profiles: coach edita o próprio"
  on public.coach_profiles for update
  using (auth.uid() = user_id);

create policy "coach_profiles: insert próprio"
  on public.coach_profiles for insert
  with check (auth.uid() = user_id);


-- ── student_profiles ─────────────────────────────────────────
-- Tabela contracts já existe aqui, então a policy é segura
create policy "student_profiles: aluno lê o próprio"
  on public.student_profiles for select
  using (auth.uid() = user_id);

create policy "student_profiles: coach lê alunos vinculados"
  on public.student_profiles for select
  using (
    exists (
      select 1 from public.contracts c
      join public.coach_profiles cp on cp.id = c.coach_profile_id
      where c.student_user_id = student_profiles.user_id
        and cp.user_id = auth.uid()
        and c.status = 'active'
    )
  );

create policy "student_profiles: aluno atualiza o próprio"
  on public.student_profiles for update
  using (auth.uid() = user_id);

create policy "student_profiles: insert próprio"
  on public.student_profiles for insert
  with check (auth.uid() = user_id);


-- ── coach_plans ──────────────────────────────────────────────
create policy "coach_plans: leitura pública"
  on public.coach_plans for select
  using (is_active = true);

create policy "coach_plans: coach gerencia os próprios"
  on public.coach_plans for all
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = coach_plans.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );


-- ── contracts ────────────────────────────────────────────────
create policy "contracts: coach vê os seus"
  on public.contracts for select
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = contracts.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );

create policy "contracts: aluno vê os seus"
  on public.contracts for select
  using (auth.uid() = student_user_id);

create policy "contracts: coach atualiza"
  on public.contracts for update
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = contracts.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );

create policy "contracts: aluno cria"
  on public.contracts for insert
  with check (auth.uid() = student_user_id);


-- ── checkins ─────────────────────────────────────────────────
create policy "checkins: aluno vê e cria os seus"
  on public.checkins for select
  using (auth.uid() = student_user_id);

create policy "checkins: aluno insere"
  on public.checkins for insert
  with check (auth.uid() = student_user_id);

create policy "checkins: coach vê e responde os seus"
  on public.checkins for select
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = checkins.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );

create policy "checkins: coach atualiza feedback"
  on public.checkins for update
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = checkins.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );


-- ── messages ─────────────────────────────────────────────────
create policy "messages: participantes leem"
  on public.messages for select
  using (
    exists (
      select 1 from public.contracts c
      join public.coach_profiles cp on cp.id = c.coach_profile_id
      where c.id = messages.contract_id
        and (c.student_user_id = auth.uid() or cp.user_id = auth.uid())
    )
  );

create policy "messages: participantes enviam"
  on public.messages for insert
  with check (
    auth.uid() = sender_user_id
    and exists (
      select 1 from public.contracts c
      join public.coach_profiles cp on cp.id = c.coach_profile_id
      where c.id = messages.contract_id
        and c.status = 'active'
        and (c.student_user_id = auth.uid() or cp.user_id = auth.uid())
    )
  );


-- ── coach_results ────────────────────────────────────────────
create policy "coach_results: leitura pública de publicados"
  on public.coach_results for select
  using (published = true);

create policy "coach_results: coach gerencia os seus"
  on public.coach_results for all
  using (
    exists (
      select 1 from public.coach_profiles cp
      where cp.id = coach_results.coach_profile_id
        and cp.user_id = auth.uid()
    )
  );
