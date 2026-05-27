# CoachHub Fit — Setup Supabase (Etapa 3)

## Pré-requisitos
- Conta no [supabase.com](https://supabase.com)
- Node.js 18+
- Projeto Next.js da Etapa 1/2 configurado

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New project**
3. Escolha a organização, dê um nome (ex: `coachhub-fit`) e defina a senha do banco
4. Aguarde o projeto provisionar (~2 min)

---

## Passo 2 — Executar o schema SQL

1. No dashboard do projeto, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique no **Table Editor** que as tabelas foram criadas:
   - `users`, `coach_profiles`, `student_profiles`
   - `coach_plans`, `contracts`, `checkins`, `messages`, `coach_results`

---

## Passo 3 — Configurar variáveis de ambiente

```bash
# Copie o exemplo
cp .env.local.example .env.local
```

Preencha no `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → anon public
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service_role secret
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` (dev) ou seu domínio

---

## Passo 4 — Configurar Auth no Supabase

### Email/senha (já funciona por padrão)
Em **Authentication → Providers → Email**, confirme que está habilitado.

### Confirmação de e-mail
Em **Authentication → Email Templates**, configure o template de confirmação.
O redirect URL deve ser: `http://localhost:3000/auth/callback`

### Google OAuth (opcional)
1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Crie credenciais OAuth 2.0 (Web application)
3. Adicione `https://SEU_PROJECT.supabase.co/auth/v1/callback` como redirect URI
4. No Supabase: **Authentication → Providers → Google** → cole Client ID e Secret

### URLs permitidas
Em **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

---

## Passo 5 — Instalar dependências e rodar

```bash
npm install
npm run dev
```

---

## Passo 6 — Testar o fluxo

1. Acesse http://localhost:3000/cadastro
2. Selecione **Sou coach** ou **Sou aluno**
3. Preencha e cadastre
4. Verifique o e-mail de confirmação (ou desabilite confirmação em Auth Settings para dev)
5. Após confirmar, login redireciona para:
   - Coach → `/coach/dashboard`
   - Aluno → `/student/dashboard`

### Verificar no Supabase
- **Authentication → Users** — usuário criado
- **Table Editor → users** — linha criada pelo trigger
- **Table Editor → coach_profiles** ou **student_profiles** — perfil criado automaticamente

---

## Passo 7 — Gerar tipos TypeScript atualizados (opcional)

Após qualquer alteração no schema, regenere os tipos:

```bash
npm run db:types
# ou diretamente:
npx supabase gen types typescript --linked > types/database.ts
```

Isso requer `supabase login` e `supabase link --project-ref SEU_PROJECT_ID` primeiro.

---

## Estrutura de arquivos adicionados nesta etapa

```
coachhub-fit/
├── supabase/
│   └── schema.sql              ← Execute no SQL Editor do Supabase
├── lib/supabase/
│   ├── client.ts               ← Browser client (componentes 'use client')
│   ├── server.ts               ← Server client (Server Components, Actions)
│   └── middleware.ts           ← Middleware client (atualiza sessão)
├── middleware.ts               ← Proteção de rotas + redirecionamento por role
├── app/
│   ├── actions/
│   │   └── auth.ts             ← loginAction, signUpAction, logoutAction
│   ├── auth/
│   │   └── callback/route.ts   ← OAuth + email confirmation callback
│   ├── cadastro/
│   │   └── confirmar-email/    ← Tela pós-cadastro
│   ├── student/dashboard/      ← Dashboard do aluno (placeholder)
│   ├── coach/dashboard/        ← Dashboard do coach (placeholder)
│   └── admin/dashboard/        ← Dashboard admin (placeholder)
├── components/auth/
│   ├── LoginForm.tsx           ← Formulário com Server Action
│   └── SignUpForm.tsx          ← Formulário com seleção de role
└── types/
    └── database.ts             ← Tipos TypeScript do banco
```

---

## Troubleshooting

**Erro: "relation public.users does not exist"**
→ O schema não foi executado. Rode `supabase/schema.sql` no SQL Editor.

**Trigger não criou o perfil**
→ Verifique se a extensão `unaccent` foi criada. Execute:
```sql
create extension if not exists unaccent;
```

**Loop de redirecionamento no /login**
→ Verifique se as variáveis de ambiente estão corretas no `.env.local`.

**Erro de CORS no OAuth**
→ Adicione a URL correta em Authentication → URL Configuration no Supabase.
