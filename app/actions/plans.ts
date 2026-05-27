'use server'

// app/actions/plans.ts
// CRUD de planos do coach via Server Actions.
// Segurança em duas camadas: verificação explícita de role + RLS do Supabase.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface PlanActionResult {
  error?: string
  success?: boolean
}

// ── Helper: busca coach_profile_id do usuário autenticado ──────────────────
// Retorna null se não for coach ou se o perfil não existir.
async function getCoachProfileId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<string | null> {
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (userRow?.role !== 'coach' && userRow?.role !== 'admin') return null

  const { data: cp } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return cp?.id ?? null
}

// ── Helper: parse seguro de formData ──────────────────────────────────────
function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? '').trim()
}

// ── Criar plano ────────────────────────────────────────────────────────────
export async function createPlanAction(
  _prev: PlanActionResult,
  formData: FormData,
): Promise<PlanActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const coachProfileId = await getCoachProfileId(supabase, user.id)
  if (!coachProfileId) return { error: 'Acesso restrito a coaches.' }

  const parsed = parsePlanForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  // Calcula sort_order como último + 1
  const { count } = await supabase
    .from('coach_plans')
    .select('id', { count: 'exact', head: true })
    .eq('coach_profile_id', coachProfileId)

  const { error: dbError } = await supabase
    .from('coach_plans')
    .insert({
      coach_profile_id: coachProfileId,
      sort_order: (count ?? 0) + 1,
      ...parsed.data,
    })

  if (dbError) {
    console.error('[createPlan]', dbError.message)
    return { error: 'Erro ao criar plano. Tente novamente.' }
  }

  revalidatePath('/coach/plans')
  redirect('/coach/plans')
}

// ── Atualizar plano ────────────────────────────────────────────────────────
export async function updatePlanAction(
  _prev: PlanActionResult,
  formData: FormData,
): Promise<PlanActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const coachProfileId = await getCoachProfileId(supabase, user.id)
  if (!coachProfileId) return { error: 'Acesso restrito a coaches.' }

  const planId = str(formData, 'plan_id')
  if (!planId) return { error: 'ID do plano ausente.' }

  // Confirma que o plano pertence a este coach (além da RLS)
  const { data: existing } = await supabase
    .from('coach_plans')
    .select('id')
    .eq('id', planId)
    .eq('coach_profile_id', coachProfileId)
    .single()

  if (!existing) return { error: 'Plano não encontrado.' }

  const parsed = parsePlanForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { error: dbError } = await supabase
    .from('coach_plans')
    .update(parsed.data)
    .eq('id', planId)
    .eq('coach_profile_id', coachProfileId) // cláusula extra por segurança

  if (dbError) {
    console.error('[updatePlan]', dbError.message)
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  revalidatePath('/coach/plans')
  redirect('/coach/plans')
}

// ── Alternar ativo/inativo ─────────────────────────────────────────────────
export async function togglePlanActiveAction(
  planId: string,
  currentValue: boolean,
): Promise<PlanActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const coachProfileId = await getCoachProfileId(supabase, user.id)
  if (!coachProfileId) return { error: 'Acesso restrito a coaches.' }

  const { error: dbError } = await supabase
    .from('coach_plans')
    .update({ is_active: !currentValue })
    .eq('id', planId)
    .eq('coach_profile_id', coachProfileId)

  if (dbError) {
    console.error('[togglePlan]', dbError.message)
    return { error: 'Erro ao alterar status.' }
  }

  revalidatePath('/coach/plans')
  return { success: true }
}

// ── Excluir plano ──────────────────────────────────────────────────────────
export async function deletePlanAction(
  planId: string,
): Promise<PlanActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const coachProfileId = await getCoachProfileId(supabase, user.id)
  if (!coachProfileId) return { error: 'Acesso restrito a coaches.' }

  // Impede exclusão se houver contratos ativos vinculados
  const { count } = await supabase
    .from('contracts')
    .select('id', { count: 'exact', head: true })
    .eq('coach_plan_id', planId)
    .eq('status', 'active')

  if ((count ?? 0) > 0) {
    return { error: 'Não é possível excluir um plano com contratos ativos.' }
  }

  const { error: dbError } = await supabase
    .from('coach_plans')
    .delete()
    .eq('id', planId)
    .eq('coach_profile_id', coachProfileId)

  if (dbError) {
    console.error('[deletePlan]', dbError.message)
    return { error: 'Erro ao excluir plano.' }
  }

  revalidatePath('/coach/plans')
  return { success: true }
}

// ── Parser compartilhado de formulário ────────────────────────────────────
type ParsedPlan = {
  name: string
  description: string
  price_brl: number
  features: string[]
  is_active: boolean
  duration_days: number | null
  update_freq: string
}

function parsePlanForm(
  formData: FormData,
): { data: ParsedPlan } | { error: string } {
  const name        = str(formData, 'name')
  const description = str(formData, 'description')
  const priceRaw    = str(formData, 'price_brl')
  const durationRaw = str(formData, 'duration_days')
  const update_freq = str(formData, 'update_freq')
  const isActiveRaw = str(formData, 'is_active')
  // features chegam como linhas de um textarea, uma por linha
  const featuresRaw = str(formData, 'features')

  if (!name) return { error: 'Nome do plano é obrigatório.' }
  if (name.length > 80) return { error: 'Nome deve ter no máximo 80 caracteres.' }

  // Preço em reais no formulário → centavos no banco
  const priceReais = parseFloat(priceRaw.replace(',', '.'))
  if (isNaN(priceReais) || priceReais < 0) {
    return { error: 'Preço inválido.' }
  }
  const price_brl = Math.round(priceReais * 100)

  const duration_days =
    durationRaw === '' ? null : parseInt(durationRaw, 10)
  if (duration_days !== null && (isNaN(duration_days) || duration_days < 1)) {
    return { error: 'Duração deve ser um número positivo de dias.' }
  }

  const features = featuresRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const is_active = isActiveRaw !== 'false'

  return {
    data: {
      name,
      description,
      price_brl,
      features,
      is_active,
      duration_days,
      update_freq,
    },
  }
}
