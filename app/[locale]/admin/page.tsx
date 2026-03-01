import { useTranslations } from 'next-intl'

export default function AdminPage() {
  const t = useTranslations('admin')

  const sections = [
    { key: 'content', label: t('content') },
    { key: 'faqs', label: t('faqs') },
    { key: 'plans', label: t('plans') },
    { key: 'courts', label: t('courts') },
    { key: 'tournaments', label: t('tournaments') },
    { key: 'settings', label: t('settings') },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-green-800 mb-10">{t('title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div
            key={s.key}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-400 hover:shadow-sm transition-all cursor-pointer"
          >
            <p className="font-semibold text-gray-800">{s.label}</p>
            <p className="text-xs text-gray-400 mt-1">Próximamente</p>
          </div>
        ))}
      </div>
    </div>
  )
}
