'use client'

// components/coaches/InterestButton.tsx

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitInterestAction } from '@/app/actions/leads'
import type { LeadActionResult } from '@/app/actions/leads'

interface Props {
  coachProfileId: string
  coachName: string
  planId?: string
  planName?: string
  planPriceCents?: number
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  label?: string
  // Passado pelo Server Component pai — undefined quando não há sessão
  isLoggedIn?: boolean
}

function SubmitBtn({ label }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200
        flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: pending ? 'rgba(57,255,122,0.7)' : 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)' }}>
      {pending ? (
        <>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Enviando…
        </>
      ) : (label ?? 'Enviar interesse')}
    </button>
  )
}

export function InterestButton({
  coachProfileId, coachName,
  planId, planName, planPriceCents,
  variant = 'primary', fullWidth = false, label,
  isLoggedIn = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [state, formAction] = useFormState<LeadActionResult, FormData>(submitInterestAction, {})

  const firstName = coachName.split(' ')[0]
  const buttonLabel = label ?? (planName ? 'Tenho interesse' : `Falar com ${firstName}`)
  const btnClass = variant === 'primary' ? 'btn-primary text-sm' : 'btn-secondary text-sm'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleClose() {
    setOpen(false)
    // Increment key so the form remounts on next open, resetting useFormState
    setFormKey(k => k + 1)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`${btnClass}${fullWidth ? ' w-full justify-center' : ''}`}>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              maxHeight: '92vh', boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}>

            {/* ── Sucesso */}
            {state?.success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(57,255,122,0.1)', border: '1px solid rgba(57,255,122,0.25)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" style={{ color: 'var(--neon)' }}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                  Interesse enviado! 🎉
                </h3>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <strong>{firstName}</strong> recebeu seu contato e vai te responder em breve.
                </p>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                  Fique de olho no WhatsApp ou Instagram que você informou.
                </p>
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm w-full">
                  Fechar
                </button>
              </div>
            ) : (
              <>
                {/* ── Header */}
                <div className="flex items-start justify-between p-5 pb-4"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      Entrar em contato
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      com <span style={{ color: 'var(--text-secondary)' }}>{coachName}</span>
                      {planName && (
                        <> · <span style={{ color: 'var(--neon)' }}>
                          {planName}
                          {planPriceCents && (
                            <> · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                              .format(planPriceCents / 100)}/mês</>
                          )}
                        </span></>
                      )}
                    </p>
                  </div>
                  <button type="button" onClick={handleClose} aria-label="Fechar"
                    className="p-1.5 rounded-lg flex-shrink-0 ml-3"
                    style={{ color: 'var(--text-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* ── Form */}
                <div className="overflow-y-auto">
                  <form key={formKey} action={formAction} className="flex flex-col gap-4 p-5">

                    {/* Campos ocultos */}
                    <input type="hidden" name="coach_profile_id" value={coachProfileId} />
                    {planId          && <input type="hidden" name="coach_plan_id"        value={planId} />}
                    {planPriceCents != null && <input type="hidden" name="price_snapshot_brl" value={planPriceCents} />}
                    {planName        && <input type="hidden" name="plan_name_snapshot"   value={planName} />}

                    {/* Badge visitante */}
                    {!isLoggedIn && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Enviando como visitante.{' '}
                          <a href="/login" style={{ color: 'var(--neon)', textDecoration: 'underline' }}>
                            Entrar
                          </a>
                          {' '}para acompanhar seus leads.
                        </span>
                      </div>
                    )}

                    {/* Erro */}
                    {state?.error && (
                      <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" className="mt-0.5 flex-shrink-0">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {state.error}
                      </div>
                    )}

                    {/* Nome */}
                    <div>
                      <label htmlFor="student_name" className="label-base">
                        Seu nome <span style={{ color: '#F87171' }}>*</span>
                      </label>
                      <input id="student_name" name="student_name" type="text"
                        required maxLength={100}
                        placeholder="Como você se chama?"
                        autoComplete="name" className="input-base" />
                    </div>

                    {/* Contato */}
                    <div>
                      <label htmlFor="student_contact" className="label-base">
                        WhatsApp ou @Instagram <span style={{ color: '#F87171' }}>*</span>
                      </label>
                      <input id="student_contact" name="student_contact" type="text"
                        required maxLength={120}
                        placeholder="(11) 99999-9999 ou @seuinstagram"
                        autoComplete="off" className="input-base" />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {firstName} usará esse contato para responder.
                      </p>
                    </div>

                    {/* E-mail opcional — só para visitantes */}
                    {!isLoggedIn && (
                      <div>
                        <label htmlFor="student_email" className="label-base">
                          E-mail{' '}
                          <span style={{ color: 'var(--text-muted)' }}>(opcional — para receber confirmação)</span>
                        </label>
                        <input id="student_email" name="student_email" type="email"
                          maxLength={200}
                          placeholder="seu@email.com"
                          autoComplete="email" className="input-base" />
                      </div>
                    )}

                    {/* Objetivo */}
                    <div>
                      <label htmlFor="goal" className="label-base">
                        Qual é seu objetivo? <span style={{ color: '#F87171' }}>*</span>
                      </label>
                      <select id="goal" name="goal" required className="input-base"
                        style={{ fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                        defaultValue="">
                        <option value="" disabled>Selecione seu objetivo principal</option>
                        <option value="Emagrecer">Emagrecer</option>
                        <option value="Ganhar massa muscular">Ganhar massa muscular</option>
                        <option value="Melhorar condicionamento">Melhorar condicionamento</option>
                        <option value="Saúde e qualidade de vida">Saúde e qualidade de vida</option>
                        <option value="Preparação esportiva">Preparação esportiva</option>
                        <option value="Reabilitação">Reabilitação</option>
                        <option value="Nutrição">Nutrição</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label htmlFor="notes" className="label-base">
                        Mensagem <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                      </label>
                      <textarea id="notes" name="notes" rows={3} maxLength={600}
                        placeholder={`Ex: Tenho disponibilidade pela manhã, pratico atividade há 2 anos…`}
                        className="input-base resize-none"
                        style={{ fontFamily: 'var(--font-body)', lineHeight: '1.5' }} />
                    </div>

                    <SubmitBtn label={`Enviar para ${firstName}`} />

                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      🔒 Seus dados são compartilhados apenas com {firstName}.
                    </p>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
