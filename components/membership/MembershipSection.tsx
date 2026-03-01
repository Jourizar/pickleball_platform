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
