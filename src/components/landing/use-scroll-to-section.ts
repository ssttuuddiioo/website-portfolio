'use client'

import { useLenis } from '@/lib/lenis-provider'

/**
 * Smooth-scrolls to an in-page section by id, using Lenis when available
 * (matches the sidebar's scroll behavior). `force: true` so it still runs if
 * Lenis has been paused elsewhere.
 */
export function useScrollToSection() {
  const lenis = useLenis()
  return (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: 0, force: true })
    else el.scrollIntoView({ behavior: 'smooth' })
  }
}
