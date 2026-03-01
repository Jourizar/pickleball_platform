import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-green-800 mb-4">{t('title')}</h1>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t('story_title')}</h2>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          Nell Pickleball Club nació con la visión de traer este emocionante deporte a la
          República Dominicana. Fundado por apasionados del deporte, el club ofrece
          instalaciones de primera clase y programas para todos los niveles.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t('team_title')}</h2>
        <p className="text-gray-500 italic">Contenido del equipo próximamente.</p>
      </section>
    </div>
  )
}
