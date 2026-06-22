'use client'

import { useEffect, useState } from 'react'

// A few strong frames from /public/landing/opt to cycle behind the lockup.
const SLIDES = [
  '/landing/opt/space-labs.avif',
  '/landing/opt/orbitals.avif',
  '/landing/opt/gestures.avif',
  '/landing/opt/installation-33.avif',
  '/landing/opt/snow.avif',
]

const INTERVAL_MS = 5000

/**
 * Backmost slideshow: cross-fades through a handful of images every 5s. Sits
 * inside the motion wrapper that scales/blurs/fades it with the page scroll,
 * so the whole carousel inherits that motion as one layer.
 */
export function HeroBackdrop() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {SLIDES.map((src, i) => (
        <div
          key={src}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      ))}
    </>
  )
}
