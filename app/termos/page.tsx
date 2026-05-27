import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de uso — CoachHub Fit',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-neon transition-colors">Início</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Termos de uso</span>
        </nav>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2"
          style={{ color: 'var(--text-primary)' }}>
          Termos de uso
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Última atualização: junho de 2025
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              1. Sobre a plataforma
            </h2>
            <p>
              O CoachHub Fit é uma vitrine digital que conecta alunos a coaches e treinadores físicos.
              Não somos uma plataforma de gestão de treinos, dietas ou acompanhamento — nossa função
              é facilitar o primeiro contato entre aluno e coach.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              2. Cadastro e uso
            </h2>
            <p className="mb-3">
              Para criar um perfil de coach, você precisa fornecer informações verdadeiras e
              atualizadas. Perfis com informações falsas ou enganosas serão removidos.
            </p>
            <p>
              Coaches passam por aprovação manual antes de aparecer na vitrine. Reservamo-nos o
              direito de reprovar ou remover perfis que não atendam nossos critérios de qualidade.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              3. Responsabilidades
            </h2>
            <p className="mb-3">
              O CoachHub Fit atua como intermediário na conexão entre alunos e coaches.
              Não somos responsáveis pela qualidade dos serviços prestados pelos coaches nem
              pelo resultado do trabalho contratado entre as partes.
            </p>
            <p>
              A negociação de valores, prazos e forma de trabalho é feita diretamente entre
              aluno e coach, fora da plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              4. Dados pessoais
            </h2>
            <p>
              Os dados fornecidos pelos usuários são usados exclusivamente para
              operação da plataforma. Consulte nossa{' '}
              <Link href="/privacidade" className="hover:text-neon transition-colors"
                style={{ color: 'var(--neon)' }}>
                Política de Privacidade
              </Link>
              {' '}para mais detalhes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              5. Planos de visibilidade
            </h2>
            <p>
              Os planos pagos (Destaque e Premium) controlam o posicionamento do coach na
              vitrine. Não garantimos número mínimo de leads ou contatos. O cancelamento
              pode ser solicitado a qualquer momento pelo WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              6. Alterações
            </h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento. Continuando a usar a
              plataforma após alterações, você concorda com os novos termos.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              7. Contato
            </h2>
            <p>
              Dúvidas sobre estes termos? Entre em contato pelo WhatsApp disponível
              na plataforma ou pelo e-mail da equipe.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
