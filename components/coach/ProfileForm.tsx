'use client'

// components/coach/ProfileForm.tsx

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { updateCoachProfileAction } from '@/app/actions/coach'
import type { UpdateProfileResult } from '@/app/actions/coach'
import type { DbCoachProfile } from '@/types/database'
import { ImageUpload } from './ImageUpload'

// ── Constantes ────────────────────────────────────────
const ALL_SPECIALTIES = [
  'Musculação', 'CrossFit', 'Corrida', 'Yoga', 'Pilates',
  'Natação', 'Nutrição', 'Emagrecimento', 'Hipertrofia',
  'Funcional', 'Boxe', 'Ciclismo',
]

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

const STATUS_OPTIONS = [
  { value: 'online',  label: 'Online',  dot: '#39FF7A', desc: 'Aceitando novos alunos' },
  { value: 'busy',    label: 'Ocupado', dot: '#FBBF24', desc: 'Vagas limitadas' },
  { value: 'offline', label: 'Offline', dot: '#555550', desc: 'Não aceitando no momento' },
]

// ── Types ─────────────────────────────────────────────
type ProfileData = Pick<
  DbCoachProfile,
  | 'bio' | 'short_bio'
  | 'specialties' | 'certifications'
  | 'location' | 'years_experience' | 'status'
  | 'instagram_handle' | 'youtube_handle' | 'linkedin_url'
  | 'cover_image_url'
>

interface Props {
  profile: ProfileData
  userId: string
  currentAvatarUrl: string | null
}

// ── Helpers ───────────────────────────────────────────
function parseLocation(loc: string) {
  const parts = loc.split(',').map(s => s.trim())
  return { city: parts[0] ?? '', state: parts[1] ?? '' }
}

// ── Sub-components ────────────────────────────────────
function SectionCard({ title, hint, children }: {
  title: string; hint?: string; children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display font-semibold text-base"
          style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {hint && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      </div>
      <div className="rounded-2xl p-5 flex flex-col gap-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </section>
  )
}

function Field({ id, name, label, hint, children }: {
  id?: string; name?: string; label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id ?? name} className="label-base">{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="btn-primary px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
      {pending ? (
        <>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Salvando…
        </>
      ) : 'Salvar perfil'}
    </button>
  )
}

// ── Main form ─────────────────────────────────────────
export function ProfileForm({ profile, userId, currentAvatarUrl }: Props) {
  const [state, action] = useFormState<UpdateProfileResult, FormData>(
    updateCoachProfileAction,
    {},
  )

  // URLs de imagem gerenciadas em state local
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? '')
  const [coverUrl, setCoverUrl]   = useState(profile.cover_image_url ?? '')

  // ── Estado controlado para chips e status ──────────
  const [selectedStatus, setSelectedStatus] = useState<string>(
    profile.status ?? 'offline'
  )
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(
    new Set(profile.specialties ?? [])
  )

  function toggleSpec(spec: string) {
    setSelectedSpecs(prev => {
      const next = new Set(prev)
      next.has(spec) ? next.delete(spec) : next.add(spec)
      return next
    })
  }

  const { city, state: uf } = parseLocation(profile.location)
  const certsText = (profile.certifications ?? []).join('\n')

  return (
    <form action={action} className="flex flex-col gap-7">

      {/* Campos ocultos para URLs de imagem (preenchidos pelos ImageUpload) */}
      <input type="hidden" name="avatar_url"       value={avatarUrl} />
      <input type="hidden" name="cover_image_url"  value={coverUrl}  />

      {/* Campo oculto para status controlado */}
      <input type="hidden" name="status" value={selectedStatus} />

      {/* Campos ocultos para especialidades controladas */}
      {Array.from(selectedSpecs).map(spec => (
        <input key={spec} type="hidden" name="specialties" value={spec} />
      ))}

      {/* Feedback global */}
      {state?.error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2.5"
          style={{ background: 'rgba(57,255,122,0.08)', border: '1px solid rgba(57,255,122,0.25)', color: 'var(--neon)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Perfil salvo. O perfil público foi atualizado.
        </div>
      )}

      {/* ── 1. Identidade ─────────────────────────────── */}
      <SectionCard title="Identidade"
        hint="Apresentação pública — aparece no seu card e no topo do perfil.">

        {/* Foto de perfil */}
        <ImageUpload
          bucket="avatars"
          storagePath={`${userId}/avatar`}
          currentUrl={currentAvatarUrl}
          aspectRatio="square"
          label="Foto de perfil"
          hint="Aparece no seu card na listagem e no topo do perfil. Quadrado, máx. 2 MB."
          onUploaded={setAvatarUrl}
        />

        <Field id="short_bio" label="Frase de destaque"
          hint="Uma linha que resume seu diferencial. Aparece como subtítulo no perfil. Máx. 160 caracteres.">
          <input id="short_bio" name="short_bio" type="text" maxLength={160}
            defaultValue={profile.short_bio ?? ''}
            placeholder="Ex: Especialista em emagrecimento feminino · 8 anos de experiência"
            className="input-base" />
        </Field>

        <Field id="bio" label="Bio completa"
          hint="Conte sua história, metodologia e resultados. Aparece na seção 'Sobre'. Máx. 1000 caracteres.">
          <textarea id="bio" name="bio" rows={6} maxLength={1000}
            defaultValue={profile.bio ?? ''}
            placeholder="Sou coach de musculação há 8 anos, especializado em transformação corporal feminina..."
            className="input-base resize-none"
            style={{ fontFamily: 'var(--font-body)' }} />
          <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
            máx. 1000 caracteres
          </p>
        </Field>

        {/* Status de disponibilidade — controlado via React state */}
        <div>
          <label className="label-base mb-2 block">Status de disponibilidade</label>
          <div className="flex flex-col sm:flex-row gap-2">
            {STATUS_OPTIONS.map(opt => {
              const isSelected = selectedStatus === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className="flex-1 text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                  style={{
                    background: isSelected ? 'var(--surface-2)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--border-hover)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: opt.dot,
                      boxShadow: isSelected ? `0 0 6px ${opt.dot}` : 'none',
                    }} />
                  <div>
                    <p className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Especialidades — controlado via React state ── */}
      <SectionCard title="Especialidades"
        hint="Aparece como chips no seu perfil e filtra sua aparição na busca.">
        <div>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map(spec => {
              const active = selectedSpecs.has(spec)
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
                  style={{
                    background: active ? 'var(--neon)' : 'var(--surface-2)',
                    border:     `1px solid ${active ? 'var(--neon)' : 'var(--border)'}`,
                    color:      active ? '#080808' : 'var(--text-secondary)',
                    cursor:     'pointer',
                  }}
                >
                  {spec}
                </button>
              )
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Clique para selecionar ou desmarcar. Selecionadas: {selectedSpecs.size}
          </p>
        </div>
      </SectionCard>

      {/* ── 3. Experiência ────────────────────────────── */}
      <SectionCard title="Experiência"
        hint="Credenciais que aumentam a confiança do aluno.">
        <Field id="experience_yrs" label="Anos de experiência">
          <input id="experience_yrs" name="experience_yrs" type="number"
            min={0} max={60}
            defaultValue={profile.years_experience ?? 0}
            className="input-base" style={{ maxWidth: '120px' }} />
        </Field>

        <Field id="certifications" label="Certificações e formações"
          hint="Uma por linha. Ex: CREF 123456-G/SP · Graduação em Ed. Física — USP">
          <textarea id="certifications" name="certifications" rows={4}
            defaultValue={certsText}
            placeholder={"CREF 123456-G/SP\nGraduação em Educação Física — USP\nCertificação Precision Nutrition (PN1)"}
            className="input-base resize-none"
            style={{ fontFamily: 'var(--font-body)' }} />
        </Field>
      </SectionCard>

      {/* ── 4. Presença ───────────────────────────────── */}
      <SectionCard title="Presença"
        hint="Localização, redes sociais e imagem de capa.">

        {/* Imagem de capa */}
        <ImageUpload
          bucket="covers"
          storagePath={`${userId}/cover`}
          currentUrl={profile.cover_image_url}
          aspectRatio="cover"
          label="Imagem de capa"
          hint="Aparece como fundo no topo do seu perfil. Paisagem, máx. 5 MB."
          onUploaded={setCoverUrl}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="city" label="Cidade">
            <input id="city" name="city" type="text"
              defaultValue={city} placeholder="São Paulo"
              maxLength={80} className="input-base" />
          </Field>
          <Field id="state" label="Estado">
            <select id="state" name="state" defaultValue={uf}
              className="input-base" style={{ cursor: 'pointer' }}>
              <option value="">Selecione…</option>
              {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="instagram" label="Instagram">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                style={{ color: 'var(--text-muted)' }}>@</span>
              <input id="instagram" name="instagram" type="text"
                defaultValue={profile.instagram_handle ?? ''}
                placeholder="seuhandle" maxLength={60}
                className="input-base pl-7" />
            </div>
          </Field>
          <Field id="youtube" label="YouTube" hint="Só o handle — ex: seucanal">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                style={{ color: 'var(--text-muted)' }}>@</span>
              <input id="youtube" name="youtube" type="text"
                defaultValue={profile.youtube_handle ?? ''}
                placeholder="seucanal" maxLength={80}
                className="input-base pl-7" />
            </div>
          </Field>
        </div>

        <Field id="linkedin" label="LinkedIn"
          hint="URL completa — ex: https://linkedin.com/in/seunome">
          <input id="linkedin" name="linkedin" type="url"
            defaultValue={profile.linkedin_url ?? ''}
            placeholder="https://linkedin.com/in/seunome"
            maxLength={200} className="input-base" />
        </Field>
      </SectionCard>

      {/* ── Submit ────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <a href="/coach/dashboard" className="btn-ghost text-sm">Cancelar</a>
        <SaveButton />
      </div>

    </form>
  )
}
