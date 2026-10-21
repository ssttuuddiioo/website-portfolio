'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    setLenis(instance)

    function raf(time: number) {
      instance.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafRef.current)
      instance.destroy()
    }
  }, [])

  // Every page in a route group shares this one instance, and Lenis keeps its
  // own idea of where the page is scrolled. After a client-side navigation it
  // would put the new page back at the old page's offset, so a link clicked
  // halfway down opened its page halfway down. Start each new page at the top,
  // unless the link aims at an anchor (the page scrolls itself there) or the
  // visitor came back with the browser's back/forward (the browser restores).
  const pathname = usePathname()
  const fromHistory = useRef(false)
  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    if (!lenis) return
    if (fromHistory.current) {
      fromHistory.current = false
      return
    }
    if (window.location.hash) return
    lenis.scrollTo(0, { immediate: true, force: true })
  }, [pathname, lenis])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
