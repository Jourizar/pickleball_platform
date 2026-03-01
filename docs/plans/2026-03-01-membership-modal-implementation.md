# Membership Plan Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full-detail modal to each membership card so users can click "Ver detalles", read everything about a plan, and subscribe.

**Architecture:** A new `MembershipSection` Client Component owns selected-plan state and renders both the card grid and `MembershipModal`. The home page (Server Component) passes enriched plan data down. `MembershipCard` gains an `onDetails` callback and a secondary "Ver detalles" button. No new routes needed.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · React (useState, useEffect)

> **Note:** No test framework installed — verification is visual in the browser.

---

### Task 1: Extend the plan data type and enrich PLANS array

**Files:**
- Modify: `components/membership/MembershipCard.tsx`
- Modify: `app/[locale]/page.tsx`

**Step 1: Extend `MembershipPlan` interface in `MembershipCard.tsx`**

Add these optional fields to the existing interface:

```ts
export interface MembershipPlan {
  id: string
  name: string
  age_range: string
  price: number
  benefits: string[]
  badge_color: string
  cta_label: string
  locale: string
  // Extended detail fields
  description?: string
  court_hours?: string
  classes_per_week?: string
  guests?: string
  tournaments?: string
  not_included?: string[]
}
```

**Step 2: Replace PLANS array in `app/[locale]/page.tsx`**

Replace the existing `PLANS` constant with this enriched version:

```ts
const PLANS: Omit<MembershipPlan, 'locale'>[] = [
  {
    id: 'mini',
    name: 'Mini',
    age_range: 'Menores de 14 años',
    price: 1500,
    description: 'El plan ideal para jóvenes que quieren descubrir el pickleball. Diseñado para desarrollar habilidades fundamentales en un ambiente divertido y seguro.',
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
    ],
    court_hours: 'Lunes a Sábado, 8am – 5pm',
    classes_per_week: '2 clases grupales por semana',
    guests: 'No incluye invitados',
    tournaments: 'Pago de entrada requerido',
    not_included: [
      'Acceso los domingos',
      'Torneos gratuitos',
      'Invitados',
    ],
    badge_color: 'bg-accent-yellow',
    cta_label: 'Suscribirse',
  },
  {
    id: 'individual',
    name: 'Individual',
    age_range: '14 años en adelante',
    price: 3000,
    description: 'El paquete completo para el jugador comprometido. Acceso ilimitado, clases frecuentes y entrada gratuita a todos nuestros torneos oficiales.',
    benefits: [
      'Acceso ilimitado a canchas',
      'Clases grupales incluidas',
      'Préstamo de equipo',
      'Torneos incluidos',
    ],
    court_hours: 'Lunes a Domingo, 7am – 9pm',
    classes_per_week: '4 clases grupales por semana',
    guests: '1 invitado por mes',
    tournaments: 'Entrada gratuita a todos los torneos',
    not_included: [
      'Reservaciones prioritarias',
      'Más de 1 invitado por mes',
    ],
    badge_color: 'bg-brand-green',
    cta_label: 'Suscribirse',
  },
  {
    id: 'familiar',
    name: 'Familiar',
    age_range: 'Hasta 4 miembros',
    price: 7500,
    description: 'Todo lo que la familia necesita para disfrutar del pickleball juntos. Reservaciones prioritarias, descuentos exclusivos y el mayor horario de acceso disponible.',
    benefits: [
      'Todo lo del plan Individual',
      'Hasta 4 miembros de familia',
      'Reservaciones prioritarias',
      'Descuento en torneos',
    ],
    court_hours: 'Lunes a Domingo, 6am – 10pm (acceso prioritario)',
    classes_per_week: 'Clases ilimitadas para todos los miembros',
    guests: '2 invitados por mes',
    tournaments: 'Entrada gratuita + 20% descuento en torneos externos',
    not_included: [],
    badge_color: 'bg-brand-vivid',
    cta_label: 'Suscribirse',
  },
]
```

**Step 3: Verify — data compiles without errors (Next.js hot reload will catch TypeScript errors)**

---

### Task 2: Update MembershipCard to add "Ver detalles" button and onDetails callback

**Files:**
- Modify: `components/membership/MembershipCard.tsx`

**Step 1: Add `onDetails` prop and secondary button**

Replace the entire file content:

```tsx
import Link from 'next/link'

export interface MembershipPlan {
  id: string
  name: string
  age_range: string
  price: number
  benefits: string[]
  badge_color: string
  cta_label: string
  locale: string
  description?: string
  court_hours?: string
  classes_per_week?: string
  guests?: string
  tournaments?: string
  not_included?: string[]
}

interface MembershipCardProps extends MembershipPlan {
  onDetails?: () => void
}

export default function MembershipCard({
  name,
  age_range,
  price,
  benefits,
  badge_color,
  cta_label,
  locale,
  onDetails,
}: MembershipCardProps) {
  return (
    <div className="card-glow flex-shrink-0 w-72 md:w-auto bg-[#0d1a0f] border border-white/10 rounded-3xl overflow-hidden flex flex-col">

      {/* Badge header */}
      <div className={`${badge_color} px-5 py-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <p className="font-display font-bold text-2xl text-white relative">{name}</p>
        <p className="font-body text-sm text-white/70 relative">{age_range}</p>
      </div>

      {/* Price */}
      <div className="px-6 pt-6">
        <p className="font-display font-bold text-4xl text-white">
          RD$<span>{price.toLocaleString()}</span>
          <span className="font-body text-base font-normal text-white/30 ml-1">/mes</span>
        </p>
      </div>

      {/* Benefits */}
      <ul className="px-6 py-5 flex-1 space-y-3">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-3 font-body text-sm text-white/60">
            <span className="text-green-400 mt-0.5 font-bold flex-shrink-0">✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="px-6 pb-6 flex flex-col gap-3">
        <Link
          href={`/${locale}/signup`}
          className="group block w-full text-center py-3.5 rounded-full font-display font-bold text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-400/20"
        >
          {cta_label}
          <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
        </Link>
        {onDetails && (
          <button
            onClick={onDetails}
            className="w-full py-3 rounded-full font-display font-bold text-sm text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-200"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Verify in browser — card should show two buttons now (Subscribe + Ver detalles)**

---

### Task 3: Create MembershipModal component

**Files:**
- Create: `components/membership/MembershipModal.tsx`

**Step 1: Create the file**

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { MembershipPlan } from './MembershipCard'

interface MembershipModalProps {
  plan: Omit<MembershipPlan, 'locale'>
  locale: string
  onClose: () => void
}

export default function MembershipModal({ plan, locale, onClose }: MembershipModalProps) {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d1a0f] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 flex flex-col">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Badge header */}
        <div className={`${plan.badge_color} px-6 py-6 relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          <p className="font-display font-bold text-3xl text-white relative">{plan.name}</p>
          <p className="font-body text-sm text-white/70 relative mt-0.5">{plan.age_range}</p>
          <p className="font-display text-4xl font-bold text-white relative mt-3">
            RD${plan.price.toLocaleString()}
            <span className="font-body text-base font-normal text-white/60 ml-1">/mes</span>
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">

          {/* Description */}
          {plan.description && (
            <p className="font-body text-green-100/70 leading-relaxed">{plan.description}</p>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🕐', label: 'Horario', value: plan.court_hours },
              { icon: '🎓', label: 'Clases',  value: plan.classes_per_week },
              { icon: '🏆', label: 'Torneos', value: plan.tournaments },
              { icon: '👥', label: 'Invitados', value: plan.guests },
            ].filter(s => s.value).map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/5 rounded-2xl p-4"
              >
                <p className="text-lg mb-1">{stat.icon}</p>
                <p className="font-body text-xs text-white/30 uppercase tracking-widest">{stat.label}</p>
                <p className="font-body text-sm text-white/80 mt-0.5 leading-snug">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* What's included */}
          <div>
            <p className="font-display font-bold text-white text-lg mb-3">Lo que incluye</p>
            <ul className="space-y-2">
              {plan.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 font-body text-sm text-green-100/70">
                  <span className="text-green-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* What's not included */}
          {plan.not_included && plan.not_included.length > 0 && (
            <div>
              <p className="font-display font-bold text-white text-lg mb-3">No incluye</p>
              <ul className="space-y-2">
                {plan.not_included.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-white/30">
                    <span className="text-red-400/70 font-bold flex-shrink-0 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky subscribe CTA */}
        <div className="px-6 py-5 border-t border-white/5 flex-shrink-0">
          <Link
            href={`/${locale}/signup`}
            onClick={onClose}
            className="group block w-full text-center py-4 rounded-full font-display font-bold text-lg text-[#050e07] bg-yellow-400 hover:bg-yellow-300 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-400/20"
          >
            {plan.cta_label}
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify file exists at `components/membership/MembershipModal.tsx`**

---

### Task 4: Create MembershipSection client component

**Files:**
- Create: `components/membership/MembershipSection.tsx`

**Step 1: Create the file**

```tsx
'use client'

import { useState } from 'react'
import MembershipCard, { type MembershipPlan } from './MembershipCard'
import MembershipModal from './MembershipModal'

interface MembershipSectionProps {
  plans: Omit<MembershipPlan, 'locale'>[]
  locale: string
}

export default function MembershipSection({ plans, locale }: MembershipSectionProps) {
  const [selected, setSelected] = useState<Omit<MembershipPlan, 'locale'> | null>(null)

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
        {plans.map((plan) => (
          <div key={plan.id} className="snap-start flex-shrink-0 w-72 md:w-auto">
            <MembershipCard
              {...plan}
              locale={locale}
              onDetails={() => setSelected(plan)}
            />
          </div>
        ))}
      </div>

      {selected && (
        <MembershipModal
          plan={selected}
          locale={locale}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
```

**Step 2: Verify file exists at `components/membership/MembershipSection.tsx`**

---

### Task 5: Wire MembershipSection into the home page

**Files:**
- Modify: `app/[locale]/page.tsx`

**Step 1: Replace the import and card grid in the membership section**

At the top of the file, replace:
```tsx
import MembershipCard, { type MembershipPlan } from '@/components/membership/MembershipCard'
```
With:
```tsx
import MembershipSection from '@/components/membership/MembershipSection'
import type { MembershipPlan } from '@/components/membership/MembershipCard'
```

**Step 2: Replace the card grid JSX inside the membership section**

Find and replace this block:
```tsx
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {PLANS.map((plan, i) => (
              <AnimateInView
                key={plan.id}
                delay={i * 120}
                className="snap-start flex-shrink-0 w-72 md:w-auto"
              >
                <MembershipCard {...plan} locale={locale} />
              </AnimateInView>
            ))}
          </div>
```

With:
```tsx
          <AnimateInView>
            <MembershipSection plans={PLANS} locale={locale} />
          </AnimateInView>
```

**Step 3: Verify in browser**

- [ ] Home page loads without errors
- [ ] Each membership card shows "Suscribirse" and "Ver detalles" buttons
- [ ] Clicking "Ver detalles" opens the modal with full plan details
- [ ] Modal shows: description, 4 quick-stat tiles, included list, not-included list, subscribe button
- [ ] Clicking × closes the modal
- [ ] Pressing Escape closes the modal
- [ ] Clicking the backdrop closes the modal
- [ ] Body scroll is locked while modal is open
- [ ] "Suscribirse" in modal navigates to `/[locale]/signup`

**Step 4: Commit**

```bash
git add \
  components/membership/MembershipCard.tsx \
  components/membership/MembershipModal.tsx \
  components/membership/MembershipSection.tsx \
  app/\[locale\]/page.tsx \
  docs/plans/2026-03-01-membership-modal-design.md \
  docs/plans/2026-03-01-membership-modal-implementation.md
git commit -m "feat: add membership plan detail modal with full info and subscribe CTA"
```
