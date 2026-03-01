import { useTranslations } from 'next-intl'
import AnimateInView from '@/components/ui/AnimateInView'

export default function GuidePage() {
  const t = useTranslations('guide')

  const faqs = [
    {
      q: '¿Qué es el pickleball?',
      a: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping-pong. Se juega en una cancha más pequeña y es ideal para todas las edades.',
    },
    {
      q: '¿Qué equipo necesito?',
      a: 'Necesitas una paleta de pickleball (más corta y sólida que una raqueta de tenis), una pelota perforada y calzado deportivo con buena tracción lateral.',
    },
    {
      q: '¿Cómo reservo una cancha?',
      a: 'Puedes reservar una cancha desde la sección de Reservaciones una vez que tengas una membresía activa. Las reservaciones se pueden hacer hasta 7 días de anticipación.',
    },
    {
      q: '¿Hay clases para principiantes?',
      a: 'Sí, ofrecemos clases grupales para todos los niveles incluidas en tu membresía. También hay clínicas especiales los fines de semana.',
    },
    {
      q: '¿Puedo traer invitados?',
      a: 'Los miembros pueden traer invitados por una tarifa diaria. Los planes Familiar permiten acceso ilimitado para todos los miembros registrados.',
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
        <AnimateInView className="mb-16">
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
