-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — RLS completo revisado
-- Execute no Supabase → SQL Editor
-- Pode ser executado várias vezes (usa DROP IF EXISTS + CREATE)
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Habilitar RLS em todas as tabelas ──────────────────────────
alter table public.users              enable row level security;
alter table public.coach_profiles     enable row level security;
alter table public.student_profiles   enable row level security;
alter table public.coach_plans        enable row level security;
alter table public.contracts          enable row level security;
alter table public.checkins           enable row level security;
alter table public.messages           enable row level security;
alter table public.coach_results      enable row level security;

-- ══════════════════════════════════════════════════════════════════
-- 2. USERS
-- ══════════════════════════════════════════════════════════════════
drop policy if exists "users: leitura pública" on public.users;
create policy "users: leitura pública"
  on public.users for select
  using (true);

drop policy if exists "users: atualização própria" on public.users;
create policy "users: atualização própria"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "users: insert via trigger" on public.users;
create policy "users: insert via trigger"
  on public.users for insert
  with check (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════
-- 3. COACH_PROFILES
-- ══════════════════════════════════════════════════════════════════

-- Visitantes e alunos podem ler perfis aprovados
-- Coaches podem ler o próprio perfil mesmo se não aprovado
drop policy if exists "coach_profiles: leitura pública aprovados" on public.coach_profiles;
create policy "coach_profiles: leitura pública aprovados"
  on public.coach_profiles for select
  using (
    approved = true
    or user_id = auth.uid()
  );

-- Coach edita apenas o próprio perfil
drop policy if exists "coach_profiles: coach edita o próprio" on public.coach_profiles;
create policy "coach_profiles: coach edita o próprio"
  on public.coach_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Coach cria o próprio perfil (normalmente via trigger, mas por segurança)
drop policy if exists "coach_profiles: insert próprio" on public.coach_profiles;
create policy "coach_profiles: insert próprio"
  on public.coach_profiles for insert
  with check (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════
-- 4. COACH_PLANS
-- ══════════════════════════════════════════════════════════════════

-- Qualquer um pode ver planos ativos (incluindo visitantes não logados)
drop policy if exists "coach_plans: leitura pública" on public.coach_plans;
create policy "coach_plans: leitura pública"
  on public.coach_plans for select
  using (
    is_active = true
    -- Coach sempre vê os próprios, mesmo inativos
    or coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- Coach gerencia apenas os próprios planos
drop policy if exists "coach_plans: coach gerencia os próprios" on public.coach_plans;
create policy "coach_plans: coach gerencia os próprios"
  on public.coach_plans for all
  using (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  )
  with check (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════
-- 5. CONTRACTS (leads)
-- ══════════════════════════════════════════════════════════════════

-- Coach vê apenas leads dos seus planos
drop policy if exists "contracts: coach vê os seus" on public.contracts;
create policy "contracts: coach vê os seus"
  on public.contracts for select
  using (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- Aluno vê apenas os seus próprios leads
drop policy if exists "contracts: aluno vê os seus" on public.contracts;
create policy "contracts: aluno vê os seus"
  on public.contracts for select
  using (student_user_id = auth.uid());

-- Coach atualiza status do lead (pending → active | cancelled)
drop policy if exists "contracts: coach atualiza" on public.contracts;
create policy "contracts: coach atualiza"
  on public.contracts for update
  using (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  )
  with check (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- Aluno logado cria lead (não permite duplicata — lógica na app)
drop policy if exists "contracts: aluno cria" on public.contracts;
create policy "contracts: aluno cria"
  on public.contracts for insert
  with check (auth.uid() = student_user_id);

-- ══════════════════════════════════════════════════════════════════
-- 6. STUDENT_PROFILES
-- ══════════════════════════════════════════════════════════════════
drop policy if exists "student_profiles: aluno lê o próprio" on public.student_profiles;
create policy "student_profiles: aluno lê o próprio"
  on public.student_profiles for select
  using (user_id = auth.uid());

drop policy if exists "student_profiles: coach lê alunos vinculados" on public.student_profiles;
create policy "student_profiles: coach lê alunos vinculados"
  on public.student_profiles for select
  using (
    user_id in (
      select student_user_id from public.contracts
      where coach_profile_id in (
        select id from public.coach_profiles where user_id = auth.uid()
      )
      and status = 'active'
    )
  );

drop policy if exists "student_profiles: aluno atualiza o próprio" on public.student_profiles;
create policy "student_profiles: aluno atualiza o próprio"
  on public.student_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "student_profiles: insert próprio" on public.student_profiles;
create policy "student_profiles: insert próprio"
  on public.student_profiles for insert
  with check (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════
-- 7. CHECKINS
-- ══════════════════════════════════════════════════════════════════
drop policy if exists "checkins: aluno vê e cria os seus" on public.checkins;
create policy "checkins: aluno vê e cria os seus"
  on public.checkins for select
  using (student_user_id = auth.uid());

drop policy if exists "checkins: aluno insere" on public.checkins;
create policy "checkins: aluno insere"
  on public.checkins for insert
  with check (auth.uid() = student_user_id);

drop policy if exists "checkins: coach vê e responde os seus" on public.checkins;
create policy "checkins: coach vê e responde os seus"
  on public.checkins for all
  using (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════
-- 8. MESSAGES
-- ══════════════════════════════════════════════════════════════════
drop policy if exists "messages: participantes veem" on public.messages;
create policy "messages: participantes veem"
  on public.messages for select
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
  );

drop policy if exists "messages: usuário envia" on public.messages;
create policy "messages: usuário envia"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- ══════════════════════════════════════════════════════════════════
-- 9. COACH_RESULTS
-- ══════════════════════════════════════════════════════════════════
drop policy if exists "coach_results: leitura pública" on public.coach_results;
create policy "coach_results: leitura pública"
  on public.coach_results for select
  using (true);

drop policy if exists "coach_results: coach gerencia os seus" on public.coach_results;
create policy "coach_results: coach gerencia os seus"
  on public.coach_results for all
  using (
    coach_profile_id in (
      select id from public.coach_profiles where user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════
-- Fim do script RLS
-- ══════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════
-- 10. ADMIN — pode aprovar e gerenciar coaches
-- ══════════════════════════════════════════════════════════════════

-- Admin pode ler qualquer perfil de coach (inclusive não aprovados)
drop policy if exists "coach_profiles: admin lê todos" on public.coach_profiles;
create policy "coach_profiles: admin lê todos"
  on public.coach_profiles for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin pode atualizar qualquer coach (aprovação, destaque)
drop policy if exists "coach_profiles: admin atualiza" on public.coach_profiles;
create policy "coach_profiles: admin atualiza"
  on public.coach_profiles for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  )
  -- WITH CHECK obrigatório: sem ele, a política WITH CHECK do coach bloqueia
  -- atualizações do admin em perfis de outros coaches (user_id != auth.uid())
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin pode ler todos os contratos/leads
drop policy if exists "contracts: admin vê todos" on public.contracts;
create policy "contracts: admin vê todos"
  on public.contracts for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin pode ler todos os usuários
drop policy if exists "users: admin lê todos" on public.users;
create policy "users: admin lê todos"
  on public.users for select
  using (
    exists (
      select 1 from public.users u2
      where u2.id = auth.uid() and u2.role = 'admin'
    )
  );
