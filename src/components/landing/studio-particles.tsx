'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  a: number // per-particle alpha weight
}

const COUNT = 460 // ambient, not dense
const CELL = 40 // spatial-hash cell for light separation

/**
 * Always-on ambient particle field that whirls around the whole page —
 * a visual metaphor for boundaries blurring. Rendered as the BACK layer
 * (low z-index) so all page content/images sit on top. Spawns on mount,
 * drifts on a slow curl flow-field with light boid separation, and wraps
 * around the viewport so it never empties. Resets on refresh.
 */
export function StudioParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cv = canvas
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const c = ctx

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      cv.width = W * dpr
      cv.height = H * dpr
      cv.style.width = `${W}px`
      cv.style.height = `${H}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Seed across the whole viewport so the field is ambient immediately.
    const particles: Particle[] = []
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        a: 0.35 + Math.random() * 0.65,
      })
    }

    function flowAngle(x: number, y: number, t: number) {
      const s = 0.0016
      return (
        (Math.sin(x * s + t * 0.3) +
          Math.cos(y * s - t * 0.25) +
          Math.sin((x + y) * s * 0.5 + t * 0.2)) *
        Math.PI
      )
    }

    const grid = new Map<number, Particle[]>()
    const key = (gx: number, gy: number) => gx * 100000 + gy
    let t = 0
    let fade = 0
    let raf = 0

    function tick() {
      c.clearRect(0, 0, W, H)
      fade = Math.min(1, fade + 0.015)
      t += 0.01

      grid.clear()
      for (const p of particles) {
        const k = key(Math.floor(p.x / CELL), Math.floor(p.y / CELL))
        const b = grid.get(k)
        if (b) b.push(p)
        else grid.set(k, [p])
      }

      const speed = 0.9
      for (const p of particles) {
        const ang = flowAngle(p.x, p.y, t)
        const fx = Math.cos(ang)
        const fy = Math.sin(ang)

        let sepx = 0
        let sepy = 0
        const gx = Math.floor(p.x / CELL)
        const gy = Math.floor(p.y / CELL)
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const b = grid.get(key(gx + ox, gy + oy))
            if (!b) continue
            for (const q of b) {
              if (q === p) continue
              const dx = p.x - q.x
              const dy = p.y - q.y
              const dist2 = dx * dx + dy * dy
              if (dist2 > 1 && dist2 < 400) {
                const inv = 1 / Math.sqrt(dist2)
                sepx += dx * inv
                sepy += dy * inv
              }
            }
          }
        }

        p.vx += fx * 0.06 + sepx * 0.02 + (Math.random() - 0.5) * 0.04
        p.vy += fy * 0.06 + sepy * 0.02 + (Math.random() - 0.5) * 0.04
        p.vx *= 0.95
        p.vy *= 0.95
        const sp = Math.hypot(p.vx, p.vy)
        if (sp > speed) {
          p.vx = (p.vx / sp) * speed
          p.vy = (p.vy / sp) * speed
        }
        p.x += p.vx
        p.y += p.vy

        if (p.x < -4) p.x += W + 8
        else if (p.x > W + 4) p.x -= W + 8
        if (p.y < -4) p.y += H + 8
        else if (p.y > H + 4) p.y -= H + 8
      }

      for (const p of particles) {
        c.globalAlpha = fade * p.a * 0.5
        c.fillStyle = '#0a0a0a'
        c.beginPath()
        c.arc(p.x, p.y, 1.5, 0, 6.2832)
        c.fill()
      }
      c.globalAlpha = 1

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

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
        zIndex: 1,
      }}
    />
  )
}
