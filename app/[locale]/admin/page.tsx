import { useTranslations } from 'next-intl'
import AnimateInView from '@/components/ui/AnimateInView'

const SECTION_ICONS: Record<string, string> = {
  content: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  faqs: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  plans: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  courts: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  tournaments: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

export default function AdminPage() {
  const t = useTranslations('admin')

  const sections = [
    { key: 'content',     label: t('content') },
    { key: 'faqs',        label: t('faqs') },
    { key: 'plans',       label: t('plans') },
    { key: 'courts',      label: t('courts') },
    { key: 'tournaments', label: t('tournaments') },
    { key: 'settings',    label: t('settings') },
  ]

  return (
    <div className="inner-page">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <AnimateInView className="mb-16">
          <p className="font-body text-green-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Panel
          </p>
          <h1 className="font-display text-6xl font-bold text-white leading-none">
            {t('title')}
          </h1>
          <div className="mt-4 w-16 h-1 bg-yellow-400 rounded-full" />
        </AnimateInView>

        {/* Section grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {sections.map((s, i) => (
            <AnimateInView key={s.key} delay={i * 80}>
              <div className="card-glow bg-white/5 border border-white/10 rounded-2xl p-7 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-5 group-hover:bg-green-400/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SECTION_ICONS[s.key]} />
                  </svg>
                </div>
                <p className="font-display text-xl font-bold text-white">{s.label}</p>
                <p className="font-body text-xs text-white/30 mt-1 uppercase tracking-widest">
                  Próximamente
                </p>
              </div>
            </AnimateInView>
          ))}
        </div>

      </div>
    </div>
  )
}
