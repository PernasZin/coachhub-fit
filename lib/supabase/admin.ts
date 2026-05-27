// lib/supabase/admin.ts
// Supabase client with service role key — bypasses RLS.
// Use ONLY in server-side admin actions. Never expose to client.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada. ' +
      'Adicione em Supabase → Settings → API → service_role (secret) → Vercel env vars.'
    )
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
