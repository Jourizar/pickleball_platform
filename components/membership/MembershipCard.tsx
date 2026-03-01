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
  // Extended detail fields — not rendered by this card; passed through to MembershipModal
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
            type="button"
            onClick={onDetails}
            aria-label={`Ver detalles de ${name}`}
            className="w-full py-3 rounded-full font-display font-bold text-sm text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  )
}
