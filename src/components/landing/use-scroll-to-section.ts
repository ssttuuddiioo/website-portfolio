'use client'

import { useLenis } from '@/lib/lenis-provider'

/**
 * Lenis offset that parks a section in the middle of the viewport instead of
 * pinning its top edge to the top of the screen. Short blocks (about) read
 * better centered; sections taller than the viewport keep top alignment, since
 * centering those would push their opening lines above the fold.
 */
export function centerOffset(el: HTMLElement) {
  const slack = window.innerHeight - el.getBoundingClientRect().height
  return slack > 0 ? -slack / 2 : 0
}

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
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
  }
}
