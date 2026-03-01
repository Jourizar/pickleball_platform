import { useTranslations } from 'next-intl'
import Link from 'next/link'
import AnimateInView from '@/components/ui/AnimateInView'
import MembershipSection from '@/components/membership/MembershipSection'
import type { MembershipPlan } from '@/components/membership/MembershipCard'

const PLANS: Omit<MembershipPlan, 'locale'>[] = [
  {
    id: 'mini',
    name: 'Mini',
    age_range: 'Menores de 14 años',
    price: 1500,
    description: 'El plan ideal para jóvenes que quieren descubrir el pickleball. Diseñado para desarrollar habilidades fundamentales en un ambiente divertido y seguro.',
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
    ],
    court_hours: 'Lunes a Sábado, 8am – 5pm',
    classes_per_week: '2 clases grupales por semana',
    guests: 'No incluye invitados',
    tournaments: 'Pago de entrada requerido',
    not_included: [
      'Acceso los domingos',
      'Torneos gratuitos',
      'Invitados',
    ],
    badge_color: 'bg-accent-yellow',
    cta_label: 'Suscribirse',
  },
  {
    id: 'individual',
    name: 'Individual',
    age_range: '14 años en adelante',
    price: 3000,
    description: 'El paquete completo para el jugador comprometido. Acceso ilimitado, clases frecuentes y entrada gratuita a todos nuestros torneos oficiales.',
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
      'Torneos incluidos',
    ],
    court_hours: 'Lunes a Domingo, 7am – 9pm',
    classes_per_week: '4 clases grupales por semana',
    guests: '1 invitado por mes',
    tournaments: 'Entrada gratuita a todos los torneos',
    not_included: [
      'Reservaciones prioritarias',
      'Más de 1 invitado por mes',
    ],
    badge_color: 'bg-brand-green',
    cta_label: 'Suscribirse',
  },
  {
    id: 'familiar',
    name: 'Familiar',
    age_range: 'Hasta 4 miembros',
    price: 7500,
    description: 'Todo lo que la familia necesita para disfrutar del pickleball juntos. Reservaciones prioritarias, descuentos exclusivos y el mayor horario de acceso disponible.',
    benefits: [
      'Todo lo del plan Individual',
      'Hasta 4 miembros de familia',
      'Reservaciones prioritarias',
      'Descuento en torneos',
    ],
    court_hours: 'Lunes a Domingo, 6am – 10pm (acceso prioritario)',
    classes_per_week: 'Clases ilimitadas para todos los miembros',
    guests: '2 invitados por mes',
    tournaments: 'Entrada gratuita + 20% descuento en torneos externos',
    not_included: [],
    badge_color: 'bg-brand-vivid',
    cta_label: 'Suscribirse',
  },
]

// SVG pickleball ball
function PickleballSVG({ size = 220, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ball body */}
      <circle cx="60" cy="60" r="56" fill="#facc15" />
      <circle cx="60" cy="60" r="56" fill="url(#ballSheen)" />
      {/* Seam */}
      <path
        d="M8,50 Q35,30 60,50 Q85,70 112,50"
        fill="none"
        stroke="#d97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8,70 Q35,90 60,70 Q85,50 112,70"
        fill="none"
        stroke="#d97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Holes — arranged in ring pattern */}
      {[
        [60, 18], [82, 24], [98, 42], [104, 64], [96, 84],
        [78, 98], [58, 104], [36, 98], [20, 82], [14, 60],
        [22, 38], [40, 22],
        [60, 40], [76, 48], [80, 64], [70, 78], [54, 82],
        [40, 74], [36, 58], [46, 44],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#92400e" opacity="0.75" />
      ))}
      <defs>
        <radialGradient id="ballSheen" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const t = useTranslations('home')

  return (
    <>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-4rem)] bg-brand-black flex items-center overflow-hidden">

        {/* Looping background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/pickleball_video1.mp4"
        />

        {/* Overlay: starts fully opaque, slowly reveals the video underneath */}
        <div className="video-overlay absolute inset-0 bg-brand-black" />

        {/* Court-line grid pattern on top of video */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Bottom-left radial glow */}
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-brand-green opacity-10 blur-[120px] pointer-events-none" />
        {/* Top-right glow */}
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full bg-accent-yellow opacity-[0.07] blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 py-24 w-full">

          {/* Text */}
          <div className="z-10">
            <div className="hero-badge inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 text-brand-green px-4 py-1.5 rounded-full text-sm font-body font-medium mb-6 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              República Dominicana
            </div>

            <h1 className="hero-title font-display text-6xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight text-white mb-4">
              NELL<br />
              <span className="text-accent-yellow">PICKLEBALL</span><br />
              CLUB
            </h1>

            <p className="hero-sub font-body text-lg text-green-200/70 mb-8 max-w-md leading-relaxed">
              {t('hero_subtitle')}
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/signup`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-yellow text-brand-black font-display font-bold text-lg rounded-full hover:bg-accent-gold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                {t('cta_join')}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white font-display font-bold text-lg rounded-full hover:border-white/50 hover:bg-white/5 transition-all duration-200"
              >
                {t('cta_learn')}
              </Link>
            </div>

            {/* Stats strip */}
            <div className="hero-cta mt-12 flex gap-8 border-t border-white/10 pt-8">
              {[
                { value: '#1', label: 'Club en la RD' },
                { value: '3', label: 'Canchas' },
                { value: '12+', label: 'Torneos' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl font-bold text-accent-yellow">{value}</p>
                  <p className="font-body text-xs text-green-300/60 uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-body text-xs text-white tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          MEMBERSHIP PLANS
      ══════════════════════════════════════ */}
      <section className="py-24 bg-brand-black relative overflow-hidden" id="membership">
        {/* Section divider accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-green/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <AnimateInView className="text-center mb-14">
            <p className="font-body text-brand-green text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Membresías
            </p>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white">
              {t('membership_title')}
            </h2>
            <p className="font-body text-green-300/60 mt-3 text-lg">
              {t('membership_subtitle')}
            </p>
          </AnimateInView>

          {/* Cards — no AnimateInView wrapper: transform creates a stacking context that breaks the modal's position:fixed */}
          <MembershipSection plans={PLANS} locale={locale} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          MISSION / VISION
      ══════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: 'linear-gradient(160deg, #0d1a0f 0%, #050e07 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <AnimateInView variant="left">
            <div className="p-8 rounded-3xl border border-brand-green/10 bg-brand-dark/50 backdrop-blur-sm h-full">
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">{t('mission_title')}</h2>
              <p className="font-body text-green-200/60 leading-relaxed">
                Promover el pickleball en la República Dominicana creando una comunidad
                inclusiva donde personas de todas las edades puedan aprender, competir y
                disfrutar del deporte en un ambiente de excelencia.
              </p>
            </div>
          </AnimateInView>

          <AnimateInView variant="right" delay={120}>
            <div className="p-8 rounded-3xl border border-accent-yellow/10 bg-brand-dark/50 backdrop-blur-sm h-full">
              <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">{t('vision_title')}</h2>
              <p className="font-body text-green-200/60 leading-relaxed">
                Ser el club de pickleball de referencia del Caribe, reconocido por la
                calidad de sus instalaciones, programas de formación y torneos de alto nivel.
              </p>
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHATSAPP CTA
      ══════════════════════════════════════ */}
      <section className="py-20 bg-brand-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent" />
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-32 bg-brand-green opacity-[0.08] blur-[80px]" />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center">
          <AnimateInView>
            <PickleballSVG size={60} className="mx-auto mb-6 opacity-80" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
              {t('whatsapp_cta')}
            </h2>
            <p className="font-body text-green-300/50 mb-8">Nuestro equipo responde en minutos.</p>
            <a
              href="https://wa.me/18098000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white font-display font-bold text-xl rounded-full hover:bg-[#1ebe59] transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Escríbenos en WhatsApp
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </AnimateInView>
        </div>
      </section>
    </>
  )
}
