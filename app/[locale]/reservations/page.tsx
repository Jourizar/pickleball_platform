import { useTranslations } from 'next-intl'
import Link from 'next/link'
import AnimateInView from '@/components/ui/AnimateInView'

interface ReservationsPageProps {
  params: { locale: string }
}

export default function ReservationsPage({ params: { locale } }: ReservationsPageProps) {
  const t = useTranslations('reservations')

  return (
    <div className="inner-page">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <AnimateInView className="mb-16">
          <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Reservaciones
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-none">
            {t('title')}
          </h1>
          <div className="mt-4 w-16 h-1 bg-yellow-400 rounded-full" />
        </AnimateInView>

        {/* Login gate */}
        <AnimateInView>
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
            {/* Court icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              Acceso de Miembros
            </h2>
            <p className="font-body text-green-100/50 mb-8 leading-relaxed">
              Inicia sesión para reservar canchas, ver tu historial y registrarte en torneos.
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-[#050e07] font-display font-bold rounded-full hover:bg-yellow-300 transition-colors"
            >
              Iniciar Sesión →
            </Link>
            <p className="font-body text-sm text-white/30 mt-5">
              ¿No tienes cuenta?{' '}
              <Link href={`/${locale}/signup`} className="text-green-400 hover:text-green-300 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </AnimateInView>

        {/* Tease of what's coming */}
        <AnimateInView delay={150} className="mt-20">
          <h2 className="font-display text-3xl font-bold text-white mb-8 text-center">
            {t('available_courts')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {['Cancha 1 — Norte', 'Cancha 2 — Sur', 'Cancha 3 — Este'].map((court) => (
              <div
                key={court}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="font-display font-bold text-white">{court}</p>
                <p className="font-body text-xs text-white/30 mt-1 uppercase tracking-widest">Disponible</p>
              </div>
            ))}
          </div>
          <p className="text-center font-body text-sm text-white/20 mt-6">
            Inicia sesión para ver horarios disponibles
          </p>
        </AnimateInView>

      </div>
    </div>
  )
}
