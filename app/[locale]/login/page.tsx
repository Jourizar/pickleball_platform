import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface LoginPageProps {
  params: { locale: string }
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  const t = useTranslations('auth')

  return (
    <div className="inner-page flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="text-center mb-10">
          <p className="font-display font-bold text-3xl tracking-tight">
            <span className="text-white">NELL </span>
            <span className="text-yellow-400">PBC</span>
          </p>
          <h1 className="font-display text-4xl font-bold text-white mt-4">{t('login_title')}</h1>
          <p className="font-body text-sm text-white/40 mt-2">Bienvenido de vuelta</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-white/70 mb-1.5">
              {t('email')}
            </label>
            <input
              type="email"
              className="input-dark"
              placeholder="tu@email.com"
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
            />
          </div>
          <div className="flex justify-end">
            <a href="#" className="font-body text-xs text-green-400 hover:text-green-300 transition-colors">
              {t('forgot_password')}
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-full font-display font-bold text-lg text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-colors hover:shadow-lg hover:shadow-yellow-400/20"
          >
            {t('login_title')} →
          </button>
        </form>

        <p className="mt-8 text-center font-body text-sm text-white/30">
          {t('no_account')}{' '}
          <Link
            href={`/${locale}/signup`}
            className="text-green-400 font-medium hover:text-green-300 transition-colors"
          >
            {t('signup_title')}
          </Link>
        </p>

      </div>
    </div>
  )
}
