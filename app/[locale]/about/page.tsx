import { useTranslations } from 'next-intl'
import AnimateInView from '@/components/ui/AnimateInView'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div className="inner-page">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <AnimateInView className="mb-16">
          <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            El Club
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-none">
            {t('title')}
          </h1>
          <div className="mt-4 w-16 h-1 bg-yellow-400 rounded-full" />
        </AnimateInView>

        {/* Story */}
        <AnimateInView className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-5">
                {t('story_title')}
              </h2>
              <p className="font-body text-green-100/60 leading-relaxed text-lg">
                Nell Pickleball Club nació con la visión de traer este emocionante deporte a la
                República Dominicana. Fundado por apasionados del deporte, el club ofrece
                instalaciones de primera clase y programas para todos los niveles.
              </p>
              <p className="font-body text-green-100/60 leading-relaxed text-lg mt-4">
                Rodeados de la naturaleza tropical caribeña, nuestras canchas están diseñadas
                para que disfrutes del juego al aire libre con la mejor infraestructura.
              </p>
            </div>

            {/* Decorative stat card */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2024', label: 'Fundado' },
                { value: '3', label: 'Canchas' },
                { value: '200+', label: 'Miembros' },
                { value: '12+', label: 'Torneos' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-400/30 transition-colors"
                >
                  <p className="font-display text-4xl font-bold text-yellow-400">{value}</p>
                  <p className="font-body text-sm text-white/40 uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateInView>

        {/* Team */}
        <AnimateInView>
          <div className="border-t border-white/5 pt-16">
            <h2 className="font-display text-3xl font-bold text-white mb-8">
              {t('team_title')}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: 'Coach Ana López', role: 'Directora Técnica' },
                { name: 'Carlos Méndez', role: 'Entrenador Principal' },
                { name: 'Sara Reyes', role: 'Coordinadora de Torneos' },
              ].map((member) => (
                <div
                  key={member.name}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-400/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mb-4">
                    <span className="font-display font-bold text-green-400 text-xl">
                      {member.name[0]}
                    </span>
                  </div>
                  <p className="font-display text-xl font-bold text-white">{member.name}</p>
                  <p className="font-body text-sm text-white/40 mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateInView>

      </div>
    </div>
  )
}
