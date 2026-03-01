// app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import MembershipCard, { type MembershipPlan } from '@/components/membership/MembershipCard'

// Static placeholder membership plans
const PLANS: Omit<MembershipPlan, 'locale'>[] = [
  {
    id: 'mini',
    name: 'Mini',
    age_range: 'Menores de 14 años',
    price: 1500,
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
    ],
    badge_color: 'bg-yellow-500',
    cta_label: 'Suscribirse',
  },
  {
    id: 'individual',
    name: 'Individual',
    age_range: '14 años en adelante',
    price: 3000,
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
      'Acceso a torneos',
    ],
    badge_color: 'bg-green-600',
    cta_label: 'Suscribirse',
  },
  {
    id: 'familiar',
    name: 'Familiar',
    age_range: 'Hasta 4 miembros',
    price: 7500,
    benefits: [
      'Todo lo del plan Individual',
      'Hasta 4 miembros de familia',
      'Reservaciones prioritarias',
      'Descuento en torneos',
    ],
    badge_color: 'bg-green-800',
    cta_label: 'Suscribirse',
  },
]

interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const t = useTranslations('home')

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            {t('hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/signup`}
              className="px-8 py-4 bg-white text-green-800 font-bold rounded-full hover:bg-green-50 transition-colors text-center"
            >
              {t('cta_join')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors text-center"
            >
              {t('cta_learn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Membership Plans ── */}
      <section className="py-16 bg-gray-50" id="membership">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {t('membership_title')}
          </h2>
          <p className="text-center text-gray-500 mb-10">
            {t('membership_subtitle')}
          </p>
          {/* Mobile: snap-scroll row | Desktop: 3-col grid */}
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {PLANS.map((plan) => (
              <div key={plan.id} className="snap-start">
                <MembershipCard {...plan} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission / Vision ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">
              {t('mission_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Promover el pickleball en la República Dominicana creando una comunidad
              inclusiva donde personas de todas las edades puedan aprender, competir y
              disfrutar del deporte en un ambiente de excelencia.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">
              {t('vision_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ser el club de pickleball de referencia del Caribe, reconocido por la
              calidad de sus instalaciones, programas de formación y torneos de alto nivel.
            </p>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="bg-green-600 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-white text-xl font-semibold">
              {t('whatsapp_cta')}
            </p>
          </div>
          <a
            href="https://wa.me/18098000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-600" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
