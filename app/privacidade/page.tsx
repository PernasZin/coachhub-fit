import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de privacidade — CoachHub Fit',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-neon transition-colors">Início</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Privacidade</span>
        </nav>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2"
          style={{ color: 'var(--text-primary)' }}>
          Política de privacidade
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Última atualização: junho de 2025
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              1. Dados coletados
            </h2>
            <p className="mb-3">Coletamos apenas os dados necessários para operar a plataforma:</p>
            <ul className="flex flex-col gap-1.5 ml-4">
              {[
                'Nome e e-mail ao criar conta',
                'Informações de perfil fornecidas pelo coach (bio, foto, especialidades)',
                'Dados de contato fornecidos pelo visitante ao enviar interesse (nome, WhatsApp/Instagram)',
                'Dados de uso anônimos para melhoria da plataforma',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--neon)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              2. Como usamos os dados
            </h2>
            <p className="mb-3">Os dados são usados exclusivamente para:</p>
            <ul className="flex flex-col gap-1.5 ml-4">
              {[
                'Operar a plataforma e conectar alunos a coaches',
                'Enviar notificações de leads por e-mail',
                'Exibir o perfil público do coach na vitrine',
                'Melhorar a experiência da plataforma',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--neon)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              3. Compartilhamento
            </h2>
            <p className="mb-3">
              Quando um visitante envia interesse em um coach, seus dados de contato
              (nome, WhatsApp ou Instagram e objetivo) são compartilhados com esse coach
              para que ele possa responder. Esses dados não são vendidos ou compartilhados
              com terceiros para fins comerciais.
            </p>
            <p>
              Utilizamos o Supabase para armazenamento e o Resend para envio de e-mails
              transacionais. Ambos seguem boas práticas de segurança e privacidade.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              4. Armazenamento e segurança
            </h2>
            <p>
              Os dados são armazenados em servidores seguros com criptografia em trânsito (HTTPS)
              e autenticação robusta. Senhas nunca são armazenadas em texto puro.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              5. Seus direitos
            </h2>
            <p className="mb-3">
              De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:
            </p>
            <ul className="flex flex-col gap-1.5 ml-4">
              {[
                'Acessar os dados que temos sobre você',
                'Corrigir dados incorretos',
                'Solicitar a exclusão da sua conta e dados',
                'Portabilidade dos seus dados',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--neon)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Para exercer esses direitos, entre em contato pelo WhatsApp disponível na plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              6. Cookies
            </h2>
            <p>
              Usamos cookies essenciais para autenticação e funcionamento da plataforma.
              Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
