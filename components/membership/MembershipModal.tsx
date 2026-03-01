'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { MembershipPlan } from './MembershipCard'

interface MembershipModalProps {
  plan: Omit<MembershipPlan, 'locale'>
  locale: string
  onClose: () => void
}

export default function MembershipModal({ plan, locale, onClose }: MembershipModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // Stable ref so the effect never needs to re-run when onClose identity changes
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const previousFocus = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus()
    }
  }, []) // stable — onClose accessed via ref

  return (
    // z-[60] intentionally sits above the site header (z-50)
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-plan-name"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-lg max-h-[90vh] bg-[#0d1a0f] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 flex flex-col outline-none"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Badge header */}
        <div className={`${plan.badge_color} px-6 py-6 relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          <p id="modal-plan-name" className="font-display font-bold text-3xl text-white relative">{plan.name}</p>
          <p className="font-body text-sm text-white/70 relative mt-0.5">{plan.age_range}</p>
          <p className="font-display text-4xl font-bold text-white relative mt-3">
            RD${plan.price.toLocaleString()}
            <span className="font-body text-base font-normal text-white/60 ml-1">/mes</span>
          </p>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-6 flex flex-col gap-6">

          {/* Description */}
          {plan.description && (
            <p className="font-body text-green-100/70 leading-relaxed">{plan.description}</p>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🕐', label: 'Horario',   value: plan.court_hours },
              { icon: '🎓', label: 'Clases',    value: plan.classes_per_week },
              { icon: '🏆', label: 'Torneos',   value: plan.tournaments },
              { icon: '👥', label: 'Invitados', value: plan.guests },
            ].filter(s => s.value).map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/5 rounded-2xl p-4"
              >
                <p className="text-lg mb-1" aria-hidden="true">{stat.icon}</p>
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
