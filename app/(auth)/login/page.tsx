import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Entrar — CoachHub Fit',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(57,255,122,0.04) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  )
}
