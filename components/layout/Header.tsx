// components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const otherLocale = locale === 'es' ? 'en' : 'es'
  // Swap locale prefix in current path
  const altLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/guide`, label: t('guide') },
    { href: `/${locale}/reservations`, label: t('reservations') },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="font-bold text-xl text-green-700">
          Nell Pickleball
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={altLocalePath}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-700"
            title={otherLocale.toUpperCase()}
          >
            <Globe size={16} />
            {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
          >
            {t('login')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-gray-700 hover:text-green-700"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link
            href={altLocalePath}
            className="flex items-center gap-2 text-sm text-gray-500"
            onClick={() => setOpen(false)}
          >
            <Globe size={16} /> {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="px-4 py-2 text-center font-semibold text-white bg-green-600 rounded-full hover:bg-green-700"
            onClick={() => setOpen(false)}
          >
            {t('login')}
          </Link>
        </div>
      )}
    </header>
  )
}
