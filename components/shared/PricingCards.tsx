import Link from 'next/link'

interface VisibilityPlan {
  name: string
  price: number | null
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
  ctaHref: string
  badge?: string
}

const plans: VisibilityPlan[] = [
  {
    name: 'Gratuito',
    price: 0,
    description: 'Para coaches que querem começar a aparecer na vitrine.',
    features: [
      'Perfil público completo',
      'Aparece na listagem de coaches',
      'Recebe leads de alunos',
      'Foto de perfil e capa',
      'Aprovação manual pela equipe',
    ],
    cta: 'Criar perfil grátis',
    ctaHref: '/cadastro?role=coach',
  },
  {
    name: 'Destaque',
    price: 14.90,
    description: 'Para coaches que querem mais visibilidade e leads.',
    features: [
      'Tudo do Gratuito',
      'Aparece antes dos coaches básicos',
      'Badge "Destaque" no perfil',
      'Prioridade na busca por especialidade',
      'Suporte por email',
    ],
    highlighted: true,
    badge: 'Mais popular',
    cta: 'Quero mais visibilidade',
    ctaHref: '/cadastro?role=coach&plan=destaque',
  },
  {
    name: 'Premium',
    price: 29.90,
    description: 'Para coaches que querem dominar o marketplace.',
    features: [
      'Tudo do Destaque',
      'Aparece na página inicial',
      'Selo Premium no perfil',
      'Primeiros resultados na busca',
      'Suporte prioritário',
    ],
    badge: 'Máximo alcance',
    cta: 'Quero ser Premium',
    ctaHref: '/cadastro?role=coach&plan=premium',
  },
]

export function PricingCards() {
  return (
    <section id="planos" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-tag mb-4 inline-flex">Visibilidade</span>
          <h2
            className="font-display font-extrabold text-3xl sm:text-4xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Seja encontrado pelos alunos certos
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Escolha o nível de visibilidade ideal para o seu momento. Mude quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                background: plan.highlighted ? 'var(--surface-2)' : 'var(--surface)',
                border: plan.highlighted
                  ? '1px solid rgba(57, 255, 122, 0.3)'
                  : '1px solid var(--border)',
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="section-tag text-xs px-4">{plan.badge}</span>
                </div>
              )}

              <div className="mb-6">
                <p
                  className="font-display font-bold text-lg mb-1"
                  style={{ color: plan.highlighted ? 'var(--neon)' : 'var(--text-primary)' }}
                >
                  {plan.name}
                </p>
                <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>
                      Grátis
                    </span>
                  ) : (
                    <>
                      <span className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>
                        R${plan.price!.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mês</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon)' }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={plan.highlighted ? 'btn-primary text-sm text-center' : 'btn-secondary text-sm text-center'}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
