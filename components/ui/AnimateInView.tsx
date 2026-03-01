'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  variant?: 'up' | 'left' | 'right'
  delay?: number
}

export default function AnimateInView({
  children,
  className = '',
  variant = 'up',
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const variantClass =
    variant === 'left' ? 'reveal-left' :
    variant === 'right' ? 'reveal-right' :
    'reveal'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('in-view'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${variantClass} ${className}`}>
      {children}
    </div>
  )
}
