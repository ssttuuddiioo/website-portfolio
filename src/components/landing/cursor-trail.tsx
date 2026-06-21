'use client'

import { useEffect, useRef } from 'react'

interface CursorTrailProps {
  /** Base color as an "r,g,b" string. */
  rgb?: string
}

type Pt = { x: number; y: number; t: number }

const TRAIL_LIFE = 1400 // ms a wisp lingers before dissolving
const MAX_POINTS = 110 // hard cap so the spline stays cheap
const SUBDIV = 6 // Catmull-Rom samples per segment (smoothness)
const BASE_WIDTH = 2.6 // px at the freshest part of the stroke
const BASE_ALPHA = 0.9

/** Catmull-Rom interpolation between p1 and p2 (p0/p3 are the tangents). */
function catmull(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  )
}

/**
 * Persistent, prominent cursor trail rendered as a smooth Catmull-Rom
 * curve. The stroke tapers in width and alpha toward its tail so it reads
 * as a wisp being drawn in behind the pointer. Fixed, full-viewport,
 * non-interactive.
 */
export function CursorTrail({ rgb = '10,10,10' }: CursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const cv = canvas
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const c = ctx

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
      cv.style.width = `${window.innerWidth}px`
      cv.style.height = `${window.innerHeight}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const points: Pt[] = []

    function onMove(e: PointerEvent) {
      const now = performance.now()
      const last = points[points.length - 1]
      // Skip near-duplicate samples so the spline tangents stay stable.
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 2) {
        last.t = now
        return
      }
      points.push({ x: e.clientX, y: e.clientY, t: now })
      if (points.length > MAX_POINTS) points.shift()
    }
    window.addEventListener('pointermove', onMove)

    c.lineCap = 'round'
    c.lineJoin = 'round'

    let raf = 0
    function frame() {
      const now = performance.now()
      c.clearRect(0, 0, cv.width, cv.height)

      while (points.length && now - points[0].t > TRAIL_LIFE) points.shift()

      if (points.length >= 2) {
        // Walk each span and draw smooth sub-segments with per-sample
        // width + alpha so the tail tapers (wisp).
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i - 1] ?? points[i]
          const p1 = points[i]
          const p2 = points[i + 1]
          const p3 = points[i + 2] ?? points[i + 1]

          let prevX = p1.x
          let prevY = p1.y
          for (let s = 1; s <= SUBDIV; s++) {
            const t = s / SUBDIV
            const x = catmull(p0.x, p1.x, p2.x, p3.x, t)
            const y = catmull(p0.y, p1.y, p2.y, p3.y, t)
            const sampleT = p1.t + (p2.t - p1.t) * t
            const age = (now - sampleT) / TRAIL_LIFE
            const life = Math.max(0, 1 - age)
            // Ease the taper so the tail thins gracefully.
            const taper = life * life
            c.lineWidth = BASE_WIDTH * taper + 0.35
            c.strokeStyle = `rgba(${rgb},${BASE_ALPHA * life})`
            c.beginPath()
            c.moveTo(prevX, prevY)
            c.lineTo(x, y)
            c.stroke()
            prevX = x
            prevY = y
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [rgb])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  )
}
