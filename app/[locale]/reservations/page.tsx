import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface ReservationsPageProps {
  params: { locale: string }
}

export default function ReservationsPage({ params: { locale } }: ReservationsPageProps) {
  const t = useTranslations('reservations')

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-green-800 mb-8">{t('title')}</h1>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-md mx-auto">
        <p className="text-gray-600 mb-6">
          Debes iniciar sesión para hacer reservaciones de canchas y torneos.
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  )
}
