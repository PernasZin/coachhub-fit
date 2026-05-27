'use server'

// app/actions/admin.ts
// Admin actions — usa service role key para bypassar RLS em operações administrativas.
// assertAdmin() verifica a sessão do usuário ANTES de usar o client admin.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface AdminResult { error?: string; success?: boolean }

// Verifica se o usuário autenticado é admin usando o client normal (respeitando sessão)
async function assertAdmin(): Promise<{ error: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }
  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Acesso negado.' }
  return null
}

export async function approveCoachAction(coachProfileId: string): Promise<AdminResult> {
  const authErr = await assertAdmin()
  if (authErr) return authErr

  // Usa admin client (service role) para bypassar RLS
  const admin = createAdminClient()
  const { error } = await admin
    .from('coach_profiles')
    .update({ approved: true })
    .eq('id', coachProfileId)

  if (error) {
    console.error('[approveCoachAction]', error.message)
    return { error: `Erro ao aprovar coach: ${error.message}` }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/coaches')
  revalidatePath('/')
  return { success: true }
}

export async function rejectCoachAction(coachProfileId: string): Promise<AdminResult> {
  const authErr = await assertAdmin()
  if (authErr) return authErr

  // Usa admin client (service role) para bypassar RLS
  const admin = createAdminClient()
  const { error } = await admin
    .from('coach_profiles')
    .update({ approved: false })
    .eq('id', coachProfileId)

  if (error) {
    console.error('[rejectCoachAction]', error.message)
    return { error: `Erro ao reprovar coach: ${error.message}` }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/coaches')
  revalidatePath('/')
  return { success: true }
}

export async function revokeApprovalAction(coachProfileId: string): Promise<AdminResult> {
  return rejectCoachAction(coachProfileId)
}

export async function setVisibilityTierAction(
  coachProfileId: string,
  tier: 'free' | 'featured' | 'premium',
): Promise<AdminResult> {
  const authErr = await assertAdmin()
  if (authErr) return authErr

  const admin = createAdminClient()
  const { error } = await admin
    .from('coach_profiles')
    .update({
      visibility_tier: tier,
      featured: tier !== 'free',
    })
    .eq('id', coachProfileId)

  if (error) {
    console.error('[setVisibilityTierAction]', error.message)
    return { error: `Erro ao atualizar visibilidade: ${error.message}` }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/coaches')
  revalidatePath('/')
  return { success: true }
}
