'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeaderProps {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === `/${locale}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const otherLocale = locale === 'es' ? 'en' : 'es'
  const altLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  const navLinks = [
    { href: `/${locale}`,              label: t('home') },
    { href: `/${locale}/about`,        label: t('about') },
    { href: `/${locale}/guide`,        label: t('guide') },
    { href: `/${locale}/reservations`, label: t('reservations') },
  ]

  const transparent = isHome && !scrolled && !open

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-[#050e07]/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/30'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href={`/${locale}`} className="font-display font-bold text-2xl tracking-tight">
          <span className="text-white">NELL </span>
          <span className="text-yellow-400">PBC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm font-medium transition-colors duration-150 ${
                  active ? 'text-green-400' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={altLocalePath}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors font-body tracking-widest"
          >
            <Globe size={14} />
            {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="px-5 py-2 rounded-full font-display font-bold text-sm text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-colors duration-150"
          >
            {t('login')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#050e07] border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-xl font-bold text-white/80 hover:text-yellow-400 transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-white/5" />
          <Link
            href={altLocalePath}
            className="flex items-center gap-2 text-sm text-white/40 font-body"
            onClick={() => setOpen(false)}
          >
            <Globe size={14} /> {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="w-full text-center py-3 rounded-full font-display font-bold text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-colors"
            onClick={() => setOpen(false)}
          >
            {t('login')}
          </Link>
        </div>
      )}
    </header>
  )
}
