'use server'

// app/actions/coach.ts

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateProfileResult {
  error?: string
  success?: boolean
}

const VALID_SPECIALTIES = [
  'Musculação', 'CrossFit', 'Corrida', 'Yoga', 'Pilates',
  'Natação', 'Nutrição', 'Emagrecimento', 'Hipertrofia',
  'Funcional', 'Boxe', 'Ciclismo',
]

const VALID_STATUS = ['online', 'offline', 'busy'] as const

export async function updateCoachProfileAction(
  _prev: UpdateProfileResult,
  formData: FormData,
): Promise<UpdateProfileResult> {
  const supabase = createClient()

  // 1. Sessão
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  // 2. Confirma role
  const { data: userRow } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (userRow?.role === 'student') return { error: 'Acesso restrito a coaches.' }
  if (userRow?.role === 'admin') {
    // Admin com coach_profile pode editar seu próprio perfil de coach
    const { data: adminCp } = await supabase
      .from('coach_profiles').select('id').eq('user_id', user.id).single()
    if (!adminCp) return { error: 'Nenhum perfil de coach vinculado a esta conta.' }
  }

  // 3. Coleta campos
  const bio        = String(formData.get('bio')              ?? '').trim()
  const shortBio   = String(formData.get('short_bio')        ?? '').trim()
  const city       = String(formData.get('city')             ?? '').trim()
  const uf         = String(formData.get('state')            ?? '').trim()
  const instagram  = String(formData.get('instagram')        ?? '').trim().replace(/^@/, '')
  const youtube    = String(formData.get('youtube')          ?? '').trim().replace(/^@/, '')
  const linkedin   = String(formData.get('linkedin')         ?? '').trim()
  const coverUrl   = String(formData.get('cover_image_url')  ?? '').trim()
  const avatarUrl  = String(formData.get('avatar_url')       ?? '').trim()
  const expRaw     = String(formData.get('experience_yrs')   ?? '0')
  const statusRaw  = String(formData.get('status')           ?? 'offline')
  const certsRaw   = String(formData.get('certifications')   ?? '').trim()
  const specialties = formData.getAll('specialties') as string[]

  // 4. Validações
  if (bio.length > 1000)     return { error: 'Bio deve ter no máximo 1000 caracteres.' }
  if (shortBio.length > 160) return { error: 'Frase curta deve ter no máximo 160 caracteres.' }

  const experience = parseInt(expRaw, 10)
  if (isNaN(experience) || experience < 0 || experience > 60)
    return { error: 'Anos de experiência inválido (0–60).' }

  const status = VALID_STATUS.includes(statusRaw as typeof VALID_STATUS[number])
    ? (statusRaw as typeof VALID_STATUS[number])
    : 'offline' as const

  const validatedSpecialties = specialties.filter(s => VALID_SPECIALTIES.includes(s))

  const certifications = certsRaw
    .split('\n')
    .map(c => c.trim())
    .filter(Boolean)

  const location = [city, uf].filter(Boolean).join(', ')

  const instagramHandle = instagram
    .replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/?/, '')
    .replace(/\/$/, '') || null

  const youtubeHandle = youtube
    .replace(/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?/, '')
    .replace(/\/$/, '') || null

  const linkedinUrl = linkedin || null

  // cover: vem do campo oculto preenchido pelo ImageUpload (já é URL do Storage ou URL manual)
  let coverImageUrl: string | null = null
  if (coverUrl) {
    try { new URL(coverUrl); coverImageUrl = coverUrl }
    catch { return { error: 'URL da imagem de capa inválida.' } }
  }

  // 5. Update coach_profiles
  const { error: profileError } = await supabase
    .from('coach_profiles')
    .update({
      bio,
      short_bio:        shortBio,
      location,
      years_experience: experience,
      status,
      specialties:      validatedSpecialties,
      certifications,
      instagram_handle: instagramHandle,
      youtube_handle:   youtubeHandle,
      linkedin_url:     linkedinUrl,
      cover_image_url:  coverImageUrl,
    })
    .eq('user_id', user.id)

  if (profileError) {
    console.error('[updateCoachProfile]', profileError.message)
    return { error: 'Erro ao salvar perfil. Tente novamente.' }
  }

  // 6. Update avatar em users (se foi enviado pelo ImageUpload)
  if (avatarUrl) {
    try { new URL(avatarUrl) } catch {
      return { error: 'URL do avatar inválida.' }
    }
    const { error: avatarError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (avatarError) {
      console.error('[updateCoachProfile] avatar:', avatarError.message)
      // Não cancela — o resto do perfil já foi salvo
    }
  }

  // 7. Revalida caches
  const { data: cp } = await supabase
    .from('coach_profiles').select('id').eq('user_id', user.id).single()

  revalidatePath('/coach/profile')
  revalidatePath('/coach/dashboard')
  revalidatePath('/coaches')
  if (cp?.id) revalidatePath(`/coaches/${cp.id}`)

  return { success: true }
}
