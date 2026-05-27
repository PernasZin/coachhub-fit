'use server'

// app/actions/leads.ts

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendNewLeadEmail, sendLeadConfirmationEmail } from '@/lib/email'

export interface LeadActionResult {
  error?: string
  success?: boolean
}

// ── submitInterestAction ───────────────────────────────
// Funciona para:
//   - Aluno logado  → student_user_id = user.id
//   - Visitante     → student_user_id = null
export async function submitInterestAction(
  _prev: LeadActionResult,
  formData: FormData,
): Promise<LeadActionResult> {
  const supabase = createClient()

  // Sessão — opcional para visitantes
  const { data: { user } } = await supabase.auth.getUser()

  // Coaches/admins logados não podem enviar interesse
  if (user) {
    const { data: userRow } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (userRow?.role === 'coach' || userRow?.role === 'admin') {
      return { error: 'Coaches e admins não podem enviar interesse como alunos.' }
    }
  }

  // Coleta campos
  const coachProfileId   = String(formData.get('coach_profile_id')   ?? '').trim()
  const coachPlanId      = String(formData.get('coach_plan_id')       ?? '').trim() || null
  const studentName      = String(formData.get('student_name')        ?? '').trim()
  const studentContact   = String(formData.get('student_contact')     ?? '').trim()
  const studentEmail     = String(formData.get('student_email')       ?? '').trim() || null
  const goal             = String(formData.get('goal')                ?? '').trim() || null
  const notes            = String(formData.get('notes')               ?? '').trim()
  const priceSnapshot    = String(formData.get('price_snapshot_brl')  ?? '').trim()
  const planNameSnapshot = String(formData.get('plan_name_snapshot')  ?? '').trim() || null

  // Validações
  if (!coachProfileId)             return { error: 'Coach inválido.' }
  if (!studentName)                return { error: 'Informe seu nome.' }
  if (studentName.length > 100)    return { error: 'Nome muito longo.' }
  if (!studentContact)             return { error: 'Informe seu WhatsApp ou @Instagram.' }
  if (studentContact.length > 120) return { error: 'Contato muito longo.' }
  if (notes.length > 600)          return { error: 'Mensagem muito longa (máx. 600 caracteres).' }
  if (studentEmail && studentEmail.length > 200) return { error: 'E-mail muito longo.' }

  const priceCents    = priceSnapshot ? parseInt(priceSnapshot, 10) : null
  const fullContact   = `${studentName} — ${studentContact}`
  const notesWithGoal = [goal ? `Objetivo: ${goal}` : '', notes].filter(Boolean).join('\n\n')

  // Anti-duplicata para aluno logado (por user_id)
  if (user) {
    const { data: existing } = await supabase
      .from('contracts')
      .select('id')
      .eq('coach_profile_id', coachProfileId)
      .eq('student_user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return { error: 'Você já tem um interesse pendente com este coach. Aguarde o retorno!' }
    }
  } else {
    // Anti-spam para visitante: mesmo contato + mesmo coach nas últimas 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('contracts')
      .select('id')
      .eq('coach_profile_id', coachProfileId)
      .is('student_user_id', null)
      .ilike('student_contact', `${studentName} — ${studentContact}%`)
      .gte('created_at', since)
      .maybeSingle()

    if (recent) {
      return { error: 'Já recebemos seu interesse. O coach entrará em contato em breve!' }
    }
  }

  // Salva lead
  const { error: dbError } = await supabase
    .from('contracts')
    .insert({
      coach_profile_id:   coachProfileId,
      student_user_id:    user?.id ?? null,
      coach_plan_id:      coachPlanId || null,
      status:             'pending',
      student_contact:    fullContact,
      notes:              notesWithGoal || null,
      price_snapshot_brl: Number.isFinite(priceCents) ? priceCents : null,
      plan_name_snapshot: planNameSnapshot,
    })

  if (dbError) {
    console.error('[submitInterest]', dbError.message)
    return { error: 'Erro ao enviar interesse. Tente novamente.' }
  }

  // Busca dados do coach para email
  const { data: coachData } = await supabase
    .from('coach_profiles')
    .select('id, users ( full_name, email )')
    .eq('id', coachProfileId)
    .single()

  if (coachData) {
    const coach = coachData as unknown as {
      id: string
      users: { full_name: string; email: string }
    }

    const emailJobs: Promise<void>[] = [
      sendNewLeadEmail({
        coachEmail:     coach.users.email,
        coachName:      coach.users.full_name,
        coachProfileId,
        studentName,
        studentContact,
        studentGoal:    goal,
        studentMessage: notes || null,
        planName:       planNameSnapshot,
        planPriceBrl:   Number.isFinite(priceCents) ? priceCents : null,
      }),
    ]

    // Email de confirmação: aluno logado usa email da conta; visitante usa campo opcional
    const confirmEmail = user?.email ?? studentEmail
    if (confirmEmail) {
      emailJobs.push(
        sendLeadConfirmationEmail({
          studentEmail:   confirmEmail,
          studentName,
          coachName:      coach.users.full_name,
          coachProfileId,
          planName:       planNameSnapshot,
        })
      )
    }

    await Promise.allSettled(emailJobs)
  }

  revalidatePath('/coach/leads')
  revalidatePath('/coach/dashboard')
  return { success: true }
}

// ── updateLeadStatusAction ─────────────────────────────
export async function updateLeadStatusAction(
  leadId: string,
  newStatus: 'active' | 'cancelled',
): Promise<LeadActionResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: cp } = await supabase
    .from('coach_profiles').select('id').eq('user_id', user.id).single()
  if (!cp) return { error: 'Acesso restrito a coaches.' }

  const { error: dbError } = await supabase
    .from('contracts')
    .update({ status: newStatus })
    .eq('id', leadId)
    .eq('coach_profile_id', cp.id)

  if (dbError) {
    console.error('[updateLeadStatus]', dbError.message)
    return { error: 'Erro ao atualizar status.' }
  }

  revalidatePath('/coach/leads')
  revalidatePath('/coach/dashboard')
  return { success: true }
}
