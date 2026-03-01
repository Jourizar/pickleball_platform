// components/layout/Footer.tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('nav')

  return (
    <footer className="bg-green-950 text-green-100 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-bold text-lg text-white">Nell Pickleball Club</p>
          <p className="text-sm text-green-300 mt-1">República Dominicana</p>
        </div>
        <nav className="flex gap-6 text-sm flex-wrap justify-center">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">{t('home')}</Link>
          <Link href={`/${locale}/about`} className="hover:text-white transition-colors">{t('about')}</Link>
          <Link href={`/${locale}/guide`} className="hover:text-white transition-colors">{t('guide')}</Link>
          <Link href={`/${locale}/reservations`} className="hover:text-white transition-colors">{t('reservations')}</Link>
        </nav>
        <p className="text-xs text-green-400">
          © {new Date().getFullYear()} Nell Pickleball Club
        </p>
      </div>
    </footer>
  )
}
