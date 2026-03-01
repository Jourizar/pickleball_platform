# Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the boilerplate home page with the full Nell Pickleball Club home page — Header, Hero, Membership Cards, Mission/Vision, WhatsApp CTA, and Footer — using static placeholder content.

**Architecture:** Static React Server Components with no DB calls. All content is hardcoded for now; DB wiring is a future step. Components are co-located in `components/layout/` and `components/membership/`. The `[locale]/layout.tsx` wraps every page in Header + Footer.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · next-intl · lucide-react

---

> **Note:** No test framework is installed. Verification is done by loading the page in the browser and checking each section visually.

---

### Task 1: Extend Tailwind config with brand colors

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: Add brand colors to theme**

Replace the content of `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green: "#16a34a",   // green-600
          dark: "#14532d",    // green-900
          light: "#dcfce7",   // green-100
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Verify — no action needed yet; used in later tasks**

---

### Task 2: Create Header component

**Files:**
- Create: `components/layout/Header.tsx`

**Step 1: Create the directory and file**

```tsx
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
```

**Step 2: Verify — will render after wiring into layout (Task 4)**

---

### Task 3: Create Footer component

**Files:**
- Create: `components/layout/Footer.tsx`

**Step 1: Create file**

```tsx
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
```

---

### Task 4: Wire Header + Footer into locale layout

**Files:**
- Modify: `app/[locale]/layout.tsx`

**Step 1: Update layout to render Header and Footer around children**

```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header locale={locale} />
        <main className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  )
}
```

**Step 2: Verify in browser**

Load `http://localhost:3000`. You should see:
- Sticky green-branded nav bar at top with "Nell Pickleball" logo
- Dark green footer at bottom
- Mobile: hamburger icon replaces nav links

---

### Task 5: Create MembershipCard component

**Files:**
- Create: `components/membership/MembershipCard.tsx`

**Step 1: Create directory and file**

```tsx
// components/membership/MembershipCard.tsx
import Link from 'next/link'

export interface MembershipPlan {
  id: string
  name: string
  age_range: string
  price: number
  benefits: string[]
  badge_color: string   // Tailwind bg color class e.g. "bg-green-500"
  cta_label: string
  locale: string
}

export default function MembershipCard({
  name,
  age_range,
  price,
  benefits,
  badge_color,
  cta_label,
  locale,
}: MembershipPlan) {
  return (
    <div className="flex-shrink-0 w-72 md:w-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
      {/* Badge */}
      <div className={`${badge_color} px-4 py-3`}>
        <span className="text-white font-bold text-lg">{name}</span>
        <p className="text-white/80 text-sm">{age_range}</p>
      </div>

      {/* Price */}
      <div className="px-5 pt-5">
        <p className="text-3xl font-bold text-gray-900">
          RD${price.toLocaleString()}
          <span className="text-base font-normal text-gray-500">/mes</span>
        </p>
      </div>

      {/* Benefits */}
      <ul className="px-5 py-4 flex-1 space-y-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-600 mt-0.5">✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href={`/${locale}/signup`}
          className="block w-full text-center py-3 rounded-full font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          {cta_label}
        </Link>
      </div>
    </div>
  )
}
```

---

### Task 6: Build the home page

**Files:**
- Modify: `app/[locale]/page.tsx`

**Step 1: Replace boilerplate with full home page**

```tsx
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import MembershipCard, { type MembershipPlan } from '@/components/membership/MembershipCard'

// Static placeholder membership plans
const PLANS: Omit<MembershipPlan, 'locale'>[] = [
  {
    id: 'mini',
    name: 'Mini',
    age_range: 'Menores de 14 años',
    price: 1500,
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
    ],
    badge_color: 'bg-yellow-500',
    cta_label: 'Suscribirse',
  },
  {
    id: 'individual',
    name: 'Individual',
    age_range: '14 años en adelante',
    price: 3000,
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
      'Acceso a torneos',
    ],
    badge_color: 'bg-green-600',
    cta_label: 'Suscribirse',
  },
  {
    id: 'familiar',
    name: 'Familiar',
    age_range: 'Hasta 4 miembros',
    price: 7500,
    benefits: [
      'Todo lo del plan Individual',
      'Hasta 4 miembros de familia',
      'Reservaciones prioritarias',
      'Descuento en torneos',
    ],
    badge_color: 'bg-green-800',
    cta_label: 'Suscribirse',
  },
]

interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            {t('hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/signup`}
              className="px-8 py-4 bg-white text-green-800 font-bold rounded-full hover:bg-green-50 transition-colors text-center"
            >
              {t('cta_join')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors text-center"
            >
              {t('cta_learn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Membership Plans ── */}
      <section className="py-16 bg-gray-50" id="membership">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {t('membership_title')}
          </h2>
          <p className="text-center text-gray-500 mb-10">
            {t('membership_subtitle')}
          </p>
          {/* Mobile: snap-scroll row | Desktop: 3-col grid */}
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {PLANS.map((plan) => (
              <div key={plan.id} className="snap-start">
                <MembershipCard {...plan} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission / Vision ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">
              {t('mission_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Promover el pickleball en la República Dominicana creando una comunidad
              inclusiva donde personas de todas las edades puedan aprender, competir y
              disfrutar del deporte en un ambiente de excelencia.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">
              {t('vision_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ser el club de pickleball de referencia del Caribe, reconocido por la
              calidad de sus instalaciones, programas de formación y torneos de alto nivel.
            </p>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="bg-green-600 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-white text-xl font-semibold">
              {t('whatsapp_cta')}
            </p>
          </div>
          <a
            href="https://wa.me/18098000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-600" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
```

**Step 2: Verify in browser**

Load `http://localhost:3000`. Confirm:
- [ ] Hero section: green gradient, club name, tagline, two working buttons
- [ ] "Join Now" routes to `/es/signup` (404 is fine for now)
- [ ] "Learn More" routes to `/es/about` (404 is fine for now)
- [ ] Membership cards: 3 cards visible; snap-scroll on mobile
- [ ] Mission/Vision: two-column on desktop, stacked on mobile
- [ ] WhatsApp CTA: green banner with button
- [ ] Footer: dark green with nav links
- [ ] Language switcher in header toggles between `/es` and `/en`

**Step 3: Commit**

```bash
git add app/[locale]/page.tsx app/[locale]/layout.tsx \
        components/layout/Header.tsx components/layout/Footer.tsx \
        components/membership/MembershipCard.tsx \
        tailwind.config.ts \
        docs/plans/2026-02-28-homepage-implementation.md \
        docs/plans/2026-02-28-homepage-design.md \
        next.config.mjs
git commit -m "feat: build full home page with header, hero, membership cards, mission/vision, WhatsApp CTA, and footer"
```
