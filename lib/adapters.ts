// lib/adapters.ts
// Converte linhas do banco Supabase para as interfaces usadas pelos componentes de UI.
// Centraliza a lógica de mapeamento para não duplicar em cada página.

import type { DbCoachProfile, DbUser, DbCoachPlan } from '@/types/database'
import type { Coach, CoachPlan } from '@/types'

// Dados que vêm do join coach_profiles + users
export type DbCoachWithUser = DbCoachProfile & {
  users: Pick<DbUser, 'full_name' | 'avatar_url'>
}

// Converte um plano do banco para o tipo CoachPlan do mock
function dbPlanToCoachPlan(plan: DbCoachPlan): CoachPlan {
  return {
    name: plan.name,
    price: plan.price_brl / 100,   // centavos → reais
    features: plan.features,
    maxStudents: plan.max_students,
  }
}

// Converte coach_profile + user → interface Coach (usada por CoachCard / CoachGrid)
// Para coaches reais, `slug` recebe o `id` (uuid) para que os links
// apontem para /coaches/[id] em vez de /coaches/[slug].
export function dbCoachToCoach(
  row: DbCoachWithUser,
  plans: DbCoachPlan[] = [],
): Coach {
  const activePlans = plans.filter((p) => p.is_active)

  return {
    id: row.id,
    slug: row.id,                            // links → /coaches/{id}
    name: row.users.full_name,
    avatar: row.users.avatar_url ?? '',
    coverImage: row.cover_image_url ?? undefined,
    bio: row.bio,
    shortBio: row.short_bio || truncate(row.bio, 120),
    specialties: row.specialties as Coach['specialties'],
    status: row.status,
    location: row.location,
    yearsExperience: row.years_experience,
    studentsCount: row.students_count,
    rating: Number(row.rating_avg),
    reviewsCount: row.rating_count,
    certifications: row.certifications,
    socialLinks: {
      instagram: row.instagram_handle ?? undefined,
      youtube: row.youtube_handle ?? undefined,
      linkedin: row.linkedin_url ?? undefined,
    },
    plans: activePlans.length > 0
      ? activePlans.map(dbPlanToCoachPlan)
      : [],
    visibilityTier: (row.visibility_tier ?? 'free') as 'free' | 'featured' | 'premium',
    createdAt: row.created_at,
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}
