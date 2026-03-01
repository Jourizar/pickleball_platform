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
