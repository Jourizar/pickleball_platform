import { useTranslations } from 'next-intl'

export default function GuidePage() {
  const t = useTranslations('guide')

  const faqs = [
    { q: '¿Qué es el pickleball?', a: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping-pong.' },
    { q: '¿Qué equipo necesito?', a: 'Necesitas una paleta de pickleball, una pelota perforada y calzado deportivo cómodo.' },
    { q: '¿Cómo reservo una cancha?', a: 'Puedes reservar una cancha desde la sección de Reservaciones una vez que tengas una membresía activa.' },
    { q: '¿Hay clases para principiantes?', a: 'Sí, ofrecemos clases grupales para todos los niveles incluidas en la membresía.' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-green-800 mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-12">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('faq_title')}</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="border border-gray-200 rounded-xl p-4 group">
              <summary className="font-medium text-gray-800 cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-green-600 ml-2">+</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="bg-green-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-700 font-medium">{t('whatsapp_cta')}</p>
        <a
          href="https://wa.me/18098000000"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
        >
          WhatsApp
        </a>
      </div>
    </div>
  )
}
