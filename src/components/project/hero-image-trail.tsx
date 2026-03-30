'use client'

import { useRef, useEffect, useCallback } from 'react'

const POOL_SIZE = 16
const SPAWN_DISTANCE = 35
const IMAGE_WIDTH = 280
const IMAGE_HEIGHT = 180

interface HeroImageTrailProps {
  images: string[]
}

export function HeroImageTrail({ images }: HeroImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRefs = useRef<(HTMLImageElement | null)[]>([])
  const currentIndex = useRef(0)
  const imageIndex = useRef(0)
  const lastSpawn = useRef({ x: -999, y: -999 })
  const boundsRef = useRef<DOMRect | null>(null)
  const zCounter = useRef(1)
  const isCoarse = useRef(false)
  const prefersReducedMotion = useRef(false)
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // Preload images + detect input/motion prefs
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })

    isCoarse.current = window.matchMedia('(pointer: coarse)').matches
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }, [images])

  // Cache bounds via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateBounds = () => {
      boundsRef.current = container.getBoundingClientRect()
    }
    updateBounds()

    const ro = new ResizeObserver(updateBounds)
    ro.observe(container)

    const onScroll = () => {
      boundsRef.current = container.getBoundingClientRect()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const spawnImage = useCallback(
    (x: number, y: number) => {
      const idx = currentIndex.current % POOL_SIZE
      const el = poolRefs.current[idx]
      if (!el) return

      // Clear any pending fade-out for this slot
      const existingTimeout = timeouts.current.get(idx)
      if (existingTimeout) clearTimeout(existingTimeout)

      // Pick next image
      const src = images[imageIndex.current % images.length]
      imageIndex.current++

      // Slight random rotation for organic feel
      const rotation = (Math.random() - 0.5) * 6

      // Instant reset — no transition while positioning
      el.style.transition = 'none'
      el.style.opacity = '0'
      el.style.transform = `translate(${x - IMAGE_WIDTH / 2}px, ${y - IMAGE_HEIGHT / 2}px) rotate(${rotation}deg) scale(0.92)`
      el.style.zIndex = String(zCounter.current++)
      if (el.src !== src) el.src = src

      // Force reflow, then animate in
      void el.offsetHeight
      el.style.transition = 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.opacity = '0.75'
      el.style.transform = `translate(${x - IMAGE_WIDTH / 2}px, ${y - IMAGE_HEIGHT / 2}px) rotate(${rotation}deg) scale(1)`

      // Schedule fade out — let it linger then fade
      const t = setTimeout(() => {
        el.style.transition = 'opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.opacity = '0'
        timeouts.current.delete(idx)
      }, 250)
      timeouts.current.set(idx, t)

      currentIndex.current++
    },
    [images]
  )

  // Mouse tracking
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseMove = (e: MouseEvent) => {
      if (isCoarse.current || prefersReducedMotion.current) return
      const bounds = boundsRef.current
      if (!bounds) return

      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top

      const dx = x - lastSpawn.current.x
      const dy = y - lastSpawn.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > SPAWN_DISTANCE) {
        lastSpawn.current = { x, y }
        spawnImage(x, y)
      }
    }

    container.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      container.removeEventListener('mousemove', onMouseMove)
    }
  }, [spawnImage])

  // Cleanup timeouts on unmount
  useEffect(() => {
    const t = timeouts.current
    return () => {
      t.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        zIndex: 0,
        backgroundImage:
          'radial-gradient(circle, rgba(85, 82, 80, 0.3) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          ref={(el) => {
            poolRefs.current[i] = el
          }}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            objectFit: 'cover',
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}
