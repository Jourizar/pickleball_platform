'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SignupPageProps {
  params: { locale: string }
}

export default function SignupPage({ params: { locale } }: SignupPageProps) {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    router.refresh()
  }

  function handleContinue() {
    const redirect = searchParams.get('redirect')
    const destination = redirect && redirect.startsWith('/') ? redirect : `/${locale}`
    router.push(destination)
  }

  return (
    <div className="inner-page flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Success screen */}
        {success && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">¡Bienvenido/a!</h2>
            <p className="font-body text-white/50 mb-2">
              Tu cuenta ha sido creada exitosamente.
            </p>
            <p className="font-body text-sm text-white/30 mb-8">{fullName || email}</p>
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-full font-display font-bold text-lg text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-colors"
            >
              Ir al inicio →
            </button>
          </div>
        )}

        {/* Signup form */}
        {!success && <>

        {/* Logo mark */}
        <div className="text-center mb-10">
          <p className="font-display font-bold text-3xl tracking-tight">
            <span className="text-white">NELL </span>
            <span className="text-yellow-400">PBC</span>
          </p>
          <h1 className="font-display text-4xl font-bold text-white mt-4">{t('signup_title')}</h1>
          <p className="font-body text-sm text-white/40 mt-2">Únete al club</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-body text-sm font-medium text-white/70 mb-1.5">
              {t('full_name')}
            </label>
            <input
              type="text"
              className="input-dark"
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-white/70 mb-1.5">
              {t('email')}
            </label>
            <input
              type="email"
              className="input-dark"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-white/70 mb-1.5">
              {t('phone')}
            </label>
            <input
              type="tel"
              className="input-dark"
              placeholder="+1 809 000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-white/70 mb-1.5">
              {t('password')}
            </label>
            <input
              type="password"
              className="input-dark"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full font-display font-bold text-lg text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-colors hover:shadow-lg hover:shadow-yellow-400/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : `${t('signup_title')} →`}
          </button>
        </form>

        <p className="mt-8 text-center font-body text-sm text-white/30">
          {t('have_account')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-green-400 font-medium hover:text-green-300 transition-colors"
          >
            {t('login_title')}
          </Link>
        </p>

        </>}

      </div>
    </div>
  )
}
