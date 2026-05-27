import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Criar conta — CoachHub Fit',
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(57,255,122,0.04) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="w-full max-w-md h-96 rounded-2xl animate-pulse"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
        }>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}
