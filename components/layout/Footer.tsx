import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('nav')

  return (
    <footer className="bg-[#050e07] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Brand */}
        <div>
          <p className="font-display font-bold text-2xl tracking-tight">
            <span className="text-white">NELL </span>
            <span className="text-yellow-400">PBC</span>
          </p>
          <p className="font-body text-xs text-white/30 mt-1 tracking-widest uppercase">
            República Dominicana
          </p>
        </div>

        {/* Nav */}
        <nav className="flex gap-8 font-body text-sm flex-wrap justify-center">
          {[
            { href: `/${locale}`,              label: t('home') },
            { href: `/${locale}/about`,        label: t('about') },
            { href: `/${locale}/guide`,        label: t('guide') },
            { href: `/${locale}/reservations`, label: t('reservations') },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/40 hover:text-white transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="font-body text-xs text-white/20 tracking-wide">
          © {new Date().getFullYear()} Nell Pickleball Club
        </p>
      </div>
    </footer>
  )
}
