'use client'

// components/coach/PlanForm.tsx
// Formulário compartilhado para criar e editar planos.
// Recebe a action via prop para funcionar tanto em /new quanto em /[id]/edit.

import { useFormState, useFormStatus } from 'react-dom'
import type { PlanActionResult } from '@/app/actions/plans'
import type { DbCoachPlan } from '@/types/database'

type PlanFormAction = (
  prev: PlanActionResult,
  formData: FormData,
) => Promise<PlanActionResult>

interface Props {
  action: PlanFormAction
  // Passado em modo edição; ausente em modo criação
  plan?: DbCoachPlan
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Salvando...' : label}
    </button>
  )
}

// Converte centavos → "297.00" para exibir no input
function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function PlanForm({ action, plan }: Props) {
  const isEdit = Boolean(plan)

  const [state, formAction] = useFormState<PlanActionResult, FormData>(
    action,
    {},
  )

  // features[] → uma por linha no textarea
  const featuresDefault = (plan?.features ?? []).join('\n')

  return (
    <form action={formAction} className="flex flex-col gap-8">

      {/* ID oculto em modo edição */}
      {plan && <input type="hidden" name="plan_id" value={plan.id} />}

      {/* Feedback */}
      {state?.error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(228,74,74,0.1)',
            border: '1px solid rgba(228,74,74,0.25)',
            color: '#F87171',
          }}
        >
          {state?.error}
        </div>
      )}

      {/* ── Identificação ──────────────────────────────────── */}
      <section>
        <h2
          className="font-display font-semibold text-base mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Identificação
        </h2>
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <label htmlFor="name" className="label-base">
              Nome do plano <span style={{ color: '#F87171' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={80}
              defaultValue={plan?.name ?? ''}
              placeholder="Ex: Essencial, Premium, Elite…"
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="description" className="label-base">Descrição</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={400}
              defaultValue={plan?.description ?? ''}
              placeholder="Descreva brevemente o que está incluso…"
              className="input-base resize-none"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        </div>
      </section>

      {/* ── Valor e duração ────────────────────────────────── */}
      <section>
        <h2
          className="font-display font-semibold text-base mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Valor e duração
        </h2>
        <div
          className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <label htmlFor="price_brl" className="label-base">
              Preço mensal (R$) <span style={{ color: '#F87171' }}>*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                R$
              </span>
              <input
                id="price_brl"
                name="price_brl"
                type="text"
                inputMode="decimal"
                required
                defaultValue={plan ? centsToDisplay(plan.price_brl) : ''}
                placeholder="297,00"
                className="input-base pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration_days" className="label-base">
              Duração (dias)
            </label>
            <input
              id="duration_days"
              name="duration_days"
              type="number"
              min={1}
              defaultValue={plan?.duration_days ?? ''}
              placeholder="Sem prazo fixo"
              className="input-base"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Deixe vazio para contínuo
            </p>
          </div>

          <div>
            <label htmlFor="update_freq" className="label-base">
              Frequência de atualização
            </label>
            <input
              id="update_freq"
              name="update_freq"
              type="text"
              maxLength={60}
              defaultValue={plan?.update_freq ?? ''}
              placeholder="Ex: Semanal, 2x por semana"
              className="input-base"
            />
          </div>
        </div>
      </section>

      {/* ── Benefícios ─────────────────────────────────────── */}
      <section>
        <h2
          className="font-display font-semibold text-base mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Benefícios inclusos
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <label htmlFor="features" className="label-base">
            Lista de benefícios
          </label>
          <textarea
            id="features"
            name="features"
            rows={6}
            defaultValue={featuresDefault}
            placeholder={
              'Treino personalizado\nAjustes semanais\nSupporte via chat\nCheck-in quinzenal'
            }
            className="input-base resize-none"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Um benefício por linha. Cada linha vira um item na listagem pública.
          </p>
        </div>
      </section>

      {/* ── Status ─────────────────────────────────────────── */}
      <section>
        <h2
          className="font-display font-semibold text-base mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Visibilidade
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="hidden"
              name="is_active"
              value="false"
            />
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={plan ? plan.is_active : true}
              className="w-4 h-4 rounded accent-[#39FF7A]"
              // O checkbox "true" sobrescreve o hidden "false" quando marcado
              // Quando desmarcado, só o hidden "false" é enviado
              onClick={(e) => {
                const cb = e.currentTarget
                const hidden = cb.form?.querySelector<HTMLInputElement>(
                  'input[type="hidden"][name="is_active"]',
                )
                if (hidden) hidden.disabled = cb.checked
              }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Plano ativo
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Planos ativos aparecem no seu perfil público para novos alunos.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <a href="/coach/plans" className="btn-ghost text-sm">
          Cancelar
        </a>
        <SaveButton label={isEdit ? 'Salvar alterações' : 'Criar plano'} />
      </div>

    </form>
  )
}
