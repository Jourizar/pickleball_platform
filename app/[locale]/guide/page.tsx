import { useTranslations } from 'next-intl'
import AnimateInView from '@/components/ui/AnimateInView'
import { ExternalLink, Play } from 'lucide-react'

export default function GuidePage() {
  const t = useTranslations('guide')

  const faqs = [
    {
      q: '¿Qué es el pickleball?',
      a: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping-pong. Se juega en una cancha más pequeña (13.4 × 6.1 m) con una red similar a la del bádminton y es ideal para todas las edades y niveles de condición física.',
    },
    {
      q: '¿Qué equipo necesito para empezar?',
      a: 'Necesitas tres cosas: una paleta de pickleball (más corta y sólida que una raqueta de tenis), una pelota perforada similar a una pelota wiffle, y calzado deportivo con buena tracción lateral. En Nell PBC prestamos equipo a todos los miembros.',
    },
    {
      q: '¿Cuáles son las reglas básicas del juego?',
      a: 'El juego comienza con un saque diagonal desde detrás de la línea de servicio. El equipo que saca es el único que puede anotar puntos. Los partidos se juegan a 11 puntos (ganar por 2). La regla más importante es la "zona de no-voleo" (la cocina): no puedes golpear la pelota en el aire si estás parado dentro de esa zona.',
    },
    {
      q: '¿Qué es la zona de no-voleo o "la cocina"?',
      a: 'La cocina es la zona de 2.1 metros a cada lado de la red. Puedes entrar a ella, pero no puedes golpear la pelota en el aire (volear) mientras estés dentro. Esta regla previene que los jugadores dominen la red y hace el juego más estratégico y accesible para todos.',
    },
    {
      q: '¿Cuántos jugadores se necesitan para jugar?',
      a: 'Lo más común es jugar en dobles (2 vs 2), aunque también se puede jugar en singles (1 vs 1). Los dobles son el formato más popular porque hace el juego más social y es más fácil para principiantes cubrir la cancha.',
    },
    {
      q: '¿Cuánto dura un partido típico?',
      a: 'Un juego de dobles a 11 puntos dura entre 15 y 25 minutos. Los torneos suelen jugar al mejor de 3 o al mejor de 5 juegos. La duración corta es una de las razones por las que el pickleball es tan popular — se pueden jugar varios partidos en una sola sesión.',
    },
    {
      q: '¿Cómo reservo una cancha?',
      a: 'Puedes reservar una cancha desde la sección de Reservaciones una vez que tengas una membresía activa. Las reservaciones se pueden hacer hasta 7 días de anticipación. Los miembros Familiar tienen acceso prioritario.',
    },
    {
      q: '¿Hay clases para principiantes?',
      a: 'Sí, ofrecemos clases grupales para todos los niveles incluidas en tu membresía. También hay clínicas especiales los fines de semana. Si nunca has jugado, recomendamos empezar con nuestra clase "Pickleball 101" que cubre las reglas básicas, técnica de servicio y posicionamiento en cancha.',
    },
    {
      q: '¿Puedo traer invitados al club?',
      a: 'Sí. El plan Individual incluye 1 invitado por mes y el plan Familiar incluye 2. Los invitados adicionales pagan una tarifa de acceso diario. Los invitados deben estar acompañados por el miembro en todo momento.',
    },
    {
      q: '¿Cómo se calcula el nivel o ranking de un jugador?',
      a: 'El sistema de clasificación más usado globalmente es el DUPR (Dynamic Universal Pickleball Rating), que va del 2.0 (principiante absoluto) al 8.0 (profesional). Nell PBC usa DUPR para organizar torneos internos por niveles. Puedes registrarte gratis en mydupr.com.',
    },
  ]

  const videos = [
    {
      title: 'Pickleball 101 — Reglas completas',
      channel: 'USA Pickleball (Oficial)',
      description: 'El canal oficial de la Asociación de Pickleball de los EE.UU. con tutoriales para todos los niveles, desde reglas básicas hasta técnicas avanzadas.',
      href: 'https://www.youtube.com/@USAPickleball',
      tag: 'Canal Oficial',
    },
    {
      title: 'Técnica y estrategia para principiantes',
      channel: 'PrimeTime Pickleball',
      description: 'Uno de los canales instructivos más completos de YouTube. Cubre dinks, tercera bola, voleos y estrategia de dobles con demostraciones claras.',
      href: 'https://www.youtube.com/@primetimepickleball',
      tag: 'Instructivo',
    },
    {
      title: 'Domina el juego en la cocina',
      channel: 'Pickleball Kitchen',
      description: 'Especializado en la zona de no-voleo: dinks, resets, drops y cómo controlar el punto desde la red. Ideal para jugadores que quieren subir de nivel.',
      href: 'https://www.youtube.com/@PickleballKitchen',
      tag: 'Avanzado',
    },
    {
      title: 'Torneos y competencia profesional',
      channel: 'Major League Pickleball',
      description: 'Sigue la liga profesional más importante del mundo. Ver a los mejores jugadores del planeta en acción acelera enormemente el aprendizaje.',
      href: 'https://www.youtube.com/@MajorLeaguePickleball',
      tag: 'Pro',
    },
  ]

  const resources = [
    {
      name: 'USA Pickleball',
      url: 'https://usapickleball.org',
      description: 'Organismo oficial que rige el deporte en EE.UU. Reglamento oficial, torneos y certificación de árbitros.',
      tag: 'Reglamento',
    },
    {
      name: 'DUPR — Rating Global',
      url: 'https://mydupr.com',
      description: 'El sistema de clasificación de jugadores más usado mundialmente. Crea tu perfil gratis y registra tus partidas para obtener tu rating DUPR.',
      tag: 'Clasificación',
    },
    {
      name: 'APP Tour',
      url: 'https://www.apptour.org',
      description: 'Association of Pickleball Players — Tour profesional de América con calendarios de torneos, rankings y transmisiones en vivo.',
      tag: 'Tour Pro',
    },
    {
      name: 'Pickleball Central',
      url: 'https://www.pickleballcentral.com',
      description: 'El retailer especializado más grande del mundo. Guías de compra de paletas, pelotas y equipamiento para todos los presupuestos.',
      tag: 'Equipamiento',
    },
  ]

  return (
    <div className="inner-page">
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <AnimateInView className="mb-16">
          <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Aprende
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-none">
            {t('title')}
          </h1>
          <p className="font-body text-green-100/50 mt-4 text-lg">{t('subtitle')}</p>
          <div className="mt-5 w-16 h-1 bg-yellow-400 rounded-full" />
        </AnimateInView>

        {/* FAQ */}
        <AnimateInView className="mb-20">
          <h2 className="font-display text-3xl font-bold text-white mb-8">{t('faq_title')}</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:border-green-400/30 transition-colors"
              >
                <summary className="font-body font-medium text-white/90 cursor-pointer px-6 py-5 flex justify-between items-center select-none hover:text-white transition-colors list-none">
                  {faq.q}
                  <span className="text-green-400 text-xl ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 border-t border-white/5">
                  <p className="font-body text-green-100/60 leading-relaxed pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </AnimateInView>

        {/* Video resources */}
        <AnimateInView className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <Play size={18} className="text-yellow-400" aria-hidden="true" />
            <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase">
              Videos
            </p>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">Aprende con los mejores</h2>
          <p className="font-body text-white/40 text-sm mb-8">Canales de YouTube recomendados por instructores del club</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {videos.map((v) => (
              <a
                key={v.title}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-green-400/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                {/* Tag + icon row */}
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-block font-body text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
                    {v.tag}
                  </span>
                  <ExternalLink size={14} className="text-white/20 group-hover:text-green-400 transition-colors mt-1" aria-hidden="true" />
                </div>

                {/* Play icon + title */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Play size={10} className="text-white fill-white ml-0.5" aria-hidden="true" />
                  </div>
                  <p className="font-display font-bold text-white text-base leading-tight">{v.title}</p>
                </div>

                <p className="font-body text-xs text-white/30 mb-2 ml-9">{v.channel}</p>
                <p className="font-body text-sm text-white/50 leading-relaxed">{v.description}</p>
              </a>
            ))}
          </div>
        </AnimateInView>

        {/* External resources */}
        <AnimateInView className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <ExternalLink size={18} className="text-yellow-400" aria-hidden="true" />
            <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase">
              Recursos
            </p>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">Sitios de referencia</h2>
          <p className="font-body text-white/40 text-sm mb-8">Fuentes oficiales y comunidades reconocidas globalmente</p>
          <div className="space-y-3">
            {resources.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 hover:border-green-400/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <p className="font-display font-bold text-white text-base">{r.name}</p>
                    <span className="font-body text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      {r.tag}
                    </span>
                  </div>
                  <p className="font-body text-sm text-white/40 leading-relaxed">{r.description}</p>
                  <p className="font-body text-xs text-green-400/50 mt-1 truncate">{r.url}</p>
                </div>
                <ExternalLink size={16} className="text-white/20 group-hover:text-green-400 transition-colors flex-shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </AnimateInView>

        {/* WhatsApp CTA */}
        <AnimateInView>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-2xl font-bold text-white">{t('whatsapp_cta')}</p>
              <p className="font-body text-sm text-white/40 mt-1">Respuesta en minutos</p>
            </div>
            <a
              href="https://wa.me/18098000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] text-white font-display font-bold rounded-full hover:bg-[#1ebe59] transition-colors whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </AnimateInView>

      </div>
    </div>
  )
}
