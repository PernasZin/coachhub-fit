// app/coach/leads/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { updateLeadStatusAction } from '@/app/actions/leads'

export const metadata: Metadata = {
  title: 'Leads — CoachHub Fit',
}

function formatRelativeDate(iso: string): string {
  const d   = new Date(iso)
  const now = new Date()
  const diffMs  = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH   = Math.floor(diffMin / 60)
  const diffD   = Math.floor(diffH / 24)
  if (diffMin < 1)  return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffH   < 24) return `${diffH}h atrás`
  if (diffD   < 7)  return `${diffD}d atrás`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function looksLikePhone(s: string): boolean {
  const d = s.replace(/\D/g, '')
  return d.length >= 10 && d.length <= 15
}

function buildWhatsAppLink(s: string): string {
  const d = s.replace(/\D/g, '')
  const n = d.startsWith('55') ? d : `55${d}`
  return `https://wa.me/${n}`
}

function looksLikeInstagram(s: string): boolean {
  const h = s.startsWith('@') ? s.slice(1) : s
  return /^[a-zA-Z0-9_.]{1,30}$/.test(h)
}

function buildInstagramLink(s: string): string {
  const handle = s.replace(/^@/, '').split('/')[0]
  return `https://instagram.com/${handle}`
}

function parseNotes(raw: string | null): { goal: string | null; message: string | null } {
  if (!raw) return { goal: null, message: null }
  const idx = raw.indexOf('Objetivo:')
  if (idx !== 0) return { goal: null, message: raw.trim() || null }
  const afterGoal = raw.slice('Objetivo:'.length)
  const nlnl = afterGoal.indexOf('\n\n')
  if (nlnl === -1) return { goal: afterGoal.trim() || null, message: null }
  return {
    goal: afterGoal.slice(0, nlnl).trim() || null,
    message: afterGoal.slice(nlnl + 2).trim() || null,
  }
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const STATUS: Record<string, { label: string; dot: string; textColor: string; bg: string; border: string }> = {
  pending:   { label: 'Novo lead',    dot: '#39FF7A', textColor: '#39FF7A',  bg: 'rgba(57,255,122,0.08)',   border: 'rgba(57,255,122,0.25)' },
  active:    { label: 'Conectado',    dot: '#60A5FA', textColor: '#60A5FA',  bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.25)' },
  cancelled: { label: 'Descartado',   dot: '#555550', textColor: '#555550',  bg: 'transparent',             border: 'transparent' },
  paused:    { label: 'Pausado',      dot: '#FBBF24', textColor: '#FBBF24',  bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)' },
}

type Lead = {
  id: string
  status: string
  student_contact: string
  notes: string | null
  plan_name_snapshot: string | null
  price_snapshot_brl: number | null
  created_at: string
  users: { full_name: string; email: string } | null  // null for guest leads
  coach_plans: { name: string; price_brl: number } | null
}

export default async function CoachLeadsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userRow?.role !== 'coach' && userRow?.role !== 'admin') redirect('/student/dashboard')

  const { data: cp } = await supabase.from('coach_profiles').select('id').eq('user_id', user.id).single()
  if (!cp) redirect('/coach/dashboard')

  const { data: raw } = await supabase
    .from('contracts')
    .select(`
      id, status, student_contact, notes,
      plan_name_snapshot, price_snapshot_brl, created_at,
      users!contracts_student_user_id_fkey ( full_name, email ),
      coach_plans ( name, price_brl )
    `)
    .eq('coach_profile_id', cp.id)
    .order('created_at', { ascending: false })

  const leads = (raw ?? []) as unknown as Lead[]
  const pending   = leads.filter(l => l.status === 'pending')
  const active    = leads.filter(l => l.status === 'active')
  const archived  = leads.filter(l => l.status === 'cancelled' || l.status === 'paused')
  const visible   = leads.filter(l => l.status !== 'cancelled')

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors duration-150">Dashboard</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'var(--text-secondary)' }}>Leads</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              Leads recebidos
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {leads.length === 0
                ? 'Nenhum lead ainda. Compartilhe seu perfil para receber os primeiros.'
                : `${leads.length} lead${leads.length !== 1 ? 's' : ''} no total`}
            </p>
          </div>

          {/* KPIs compactos */}
          {leads.length > 0 && (
            <div className="flex gap-2">
              {[
                { value: pending.length, label: 'Novos',      color: '#39FF7A', alert: pending.length > 0 },
                { value: active.length,  label: 'Conectados', color: '#60A5FA', alert: false },
                { value: leads.length,   label: 'Total',      color: 'var(--text-muted)', alert: false },
              ].map(k => (
                <div key={k.label}
                  className="text-center px-4 py-3 rounded-xl"
                  style={{
                    background: k.alert ? 'rgba(57,255,122,0.06)' : 'var(--surface)',
                    border: k.alert ? '1px solid rgba(57,255,122,0.3)' : '1px solid var(--border)',
                    minWidth: '64px',
                  }}
                >
                  <p className="font-display font-black text-2xl leading-none" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado vazio */}
        {leads.length === 0 && (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--surface-2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
              </svg>
            </div>
            <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Sua caixa de entrada está vazia
            </p>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Quando alunos clicarem em "Tenho interesse" no seu perfil, os leads aparecerão aqui.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/coach/profile" className="btn-secondary text-sm">Completar perfil</Link>
              <Link href="/coach/plans/new" className="btn-primary text-sm">Criar um pacote</Link>
            </div>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Dica: compartilhe o link do seu perfil nas redes sociais para receber os primeiros leads.
            </p>
          </div>
        )}

        {/* Lista de leads ativos/pendentes */}
        {visible.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {visible.map(lead => {
              const s         = STATUS[lead.status] ?? STATUS.pending
              const planName  = lead.coach_plans?.name ?? lead.plan_name_snapshot
              const planPrice = lead.coach_plans?.price_brl ?? lead.price_snapshot_brl
              // student_contact may be "Name — phone" or just "phone/@handle"
              const rawContact = lead.student_contact.includes(' — ')
                ? lead.student_contact.split(' — ')[1]
                : lead.student_contact
              const isPhone       = looksLikePhone(rawContact)
              const isInstagram   = !isPhone && looksLikeInstagram(rawContact)
              const isPending     = lead.status === 'pending'
              const isActive      = lead.status === 'active'
              const { goal: leadGoal, message: leadMessage } = parseNotes(lead.notes)
              // Guest leads have no users row — parse name from student_contact
              const displayName = lead.users?.full_name ?? lead.student_contact.split(' — ')[0] ?? 'Visitante'
              const initials    = getInitials(displayName)

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${isPending ? 'rgba(57,255,122,0.2)' : 'var(--border)'}`,
                  }}
                >
                  {/* Top accent */}
                  {isPending && (
                    <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.5), transparent)' }} />
                  )}

                  <div className="p-5">
                    {/* Row 1: avatar + name + badge + time */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar iniciais */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                        style={{
                          background: isPending ? 'rgba(57,255,122,0.12)' : isActive ? 'rgba(96,165,250,0.1)' : 'var(--surface-2)',
                          color: isPending ? 'var(--neon)' : isActive ? '#60A5FA' : 'var(--text-muted)',
                          border: `1px solid ${isPending ? 'rgba(57,255,122,0.25)' : isActive ? 'rgba(96,165,250,0.2)' : 'var(--border)'}`,
                          fontSize: '13px',
                        }}
                      >
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {displayName}
                          </span>
                          {/* Status badge */}
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.textColor } as CSSProperties}
                          >
                            <span className="w-1 h-1 rounded-full" style={{ background: s.dot }} />
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {lead.users ? (
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {lead.users.email}
                            </p>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              Visitante
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatRelativeDate(lead.created_at)}
                      </span>
                    </div>

                    {/* Row 2: contact + plan chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Contato — pode ter formato "Nome — contato" */}
                      {(() => {
                        const parts = lead.student_contact.split(' — ')
                        const displayContact = parts.length > 1 ? parts[1] : parts[0]
                        return (
                          <div
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                          >
                            {isPhone ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                              </svg>
                            )}
                            <span style={{ color: 'var(--text-secondary)' }}>{displayContact}</span>
                          </div>
                        )
                      })()}

                      {/* Plano */}
                      {planName && (
                        <div
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                          </svg>
                          <span style={{ color: 'var(--text-secondary)' }}>{planName}</span>
                          {planPrice && (
                            <span style={{ color: 'var(--neon)' }}>{formatPrice(planPrice)}/mês</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Objetivo + Mensagem separados */}
                    {(leadGoal || leadMessage) && (
                      <div className="flex flex-col gap-2 mb-4">
                        {leadGoal && (
                          <div>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(57,255,122,0.08)', border: '1px solid rgba(57,255,122,0.2)', color: 'var(--neon)' }}>
                              {leadGoal}
                            </span>
                          </div>
                        )}
                        {leadMessage && (
                          <div
                            className="text-sm px-4 py-3 rounded-xl leading-relaxed"
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              borderLeft: '2px solid rgba(57,255,122,0.3)',
                            }}
                          >
                            {leadMessage}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      {isPhone && (
                        <a
                          href={buildWhatsAppLink(rawContact)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm flex items-center gap-2 px-4 py-2"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.857L.057 23.882l6.182-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.5-5.065-1.371l-.364-.215-3.77.989 1.007-3.672-.236-.378A9.943 9.943 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}

                      {isInstagram && (
                        <a
                          href={buildInstagramLink(rawContact)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm flex items-center gap-2 px-4 py-2"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="2" y="2" width="20" height="20" rx="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                          </svg>
                          Instagram
                        </a>
                      )}

                      {isPending && (
                        <form action={async () => { 'use server'; await updateLeadStatusAction(lead.id, 'active') }}>
                          <button type="submit" className="btn-secondary text-xs flex items-center gap-1.5"
                            style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60A5FA' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Marcar como conectado
                          </button>
                        </form>
                      )}

                      {(isPending || isActive) && (
                        <form action={async () => { 'use server'; await updateLeadStatusAction(lead.id, 'cancelled') }}>
                          <button type="submit" className="btn-ghost text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                            Arquivar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Leads arquivados — colapsado */}
        {archived.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="divider-gradient flex-1" />
              <p className="text-xs font-medium uppercase tracking-widest px-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Arquivados · {archived.length}
              </p>
              <div className="divider-gradient flex-1" />
            </div>
            <div className="flex flex-col gap-2">
              {archived.map(lead => {
                const planName = lead.coach_plans?.name ?? lead.plan_name_snapshot
                return (
                  <div key={lead.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.45 }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-black"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                      {getInitials(lead.users?.full_name ?? lead.student_contact.split(' — ')[0] ?? 'V')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                        {lead.users?.full_name ?? lead.student_contact.split(' — ')[0] ?? 'Visitante'}
                      </span>
                      {planName && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>· {planName}</span>}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeDate(lead.created_at)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
