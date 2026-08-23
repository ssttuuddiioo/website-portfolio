'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { INK, BG } from './landing-theme'

/**
 * "See All Work" as a DVD-screensaver bounce.
 * Sits still in the center until the cursor touches it — the cursor pushes it
 * away (and damps its speed), after which it drifts and bounces off the canvas
 * walls forever. Hovering both steers and slows it. Always clickable → /work.
 */
export function SeeAllWork({
  href = '/work',
  label = 'See All Work',
  ballSize = 'clamp(104px, 12vw, 158px)',
  height = 'clamp(170px, 20vh, 280px)',
  roam = false,
}: {
  href?: string
  label?: string
  ballSize?: string
  /** Reserved height of the resting box (before the ball is first kicked). */
  height?: string
  /** When true the ball escapes its section box and bounces around the whole viewport. */
  roam?: boolean
} = {}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLAnchorElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: -9999, y: -9999, inside: false })
  const started = useRef(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const ball = ballRef.current
    if (!wrap || !ball) return

    let W = 0
    let H = 0
    let S = 0 // pill width
    let SH = 0 // pill height
    // roam: starts false (ball rests in its box). Flips true the first time the
    // ball is kicked — from then on it's position:fixed and bounded by the viewport.
    let fixedMode = false

    const measure = () => {
      S = ball.offsetWidth
      SH = ball.offsetHeight
      if (fixedMode) {
        W = window.innerWidth
        H = window.innerHeight
      } else {
        const r = wrap.getBoundingClientRect()
        W = r.width
        H = r.height
      }
      pos.current.x = Math.min(Math.max(pos.current.x, 0), Math.max(0, W - S))
      pos.current.y = Math.min(Math.max(pos.current.y, 0), Math.max(0, H - SH))
    }

    measure()
    pos.current.x = (W - S) / 2
    pos.current.y = (H - SH) / 2
    ball.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const MIN = 1.4 // idle drift speed (px/frame)
    const MAX = 7
    const PUSH = 1.3
    const INFLUENCE = 44 // px of cursor reach beyond the ball edge

    // DVD-screensaver palette — the pill flips to a new one on every wall hit.
    const PALETTE = [
      '#2447FF', // blue
      '#FF2E88', // magenta
      '#16E0FF', // cyan
      '#FFD400', // yellow
      '#28E07B', // green
      '#FF7A1A', // orange
      '#9B4DFF', // purple
      '#FFFFFF', // white
    ]
    // Pick a dark or light label depending on the fill's brightness.
    const contrast = (hex: string) => {
      const n = parseInt(hex.slice(1), 16)
      const r = (n >> 16) & 255
      const g = (n >> 8) & 255
      const b = n & 255
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? BG : INK
    }
    let color = INK
    let textColor = BG
    const bounceColor = () => {
      let c = color
      while (c === color) {
        c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      }
      color = c
      textColor = contrast(c)
    }

    // Mouse is tracked in the ball's current coordinate space: relative to the
    // box while it rests, relative to the viewport once it has broken free.
    const onMove = (e: PointerEvent) => {
      if (fixedMode) {
        mouse.current.x = e.clientX
        mouse.current.y = e.clientY
      } else {
        const r = wrap.getBoundingClientRect()
        mouse.current.x = e.clientX - r.left
        mouse.current.y = e.clientY - r.top
      }
      mouse.current.inside = true
    }
    const onEnter = () => {
      mouse.current.inside = true
    }
    const onLeave = () => {
      mouse.current.inside = false
      mouse.current.x = -9999
      mouse.current.y = -9999
    }

    // Roam mode tracks the pointer across the whole window so the ball stays
    // steerable wherever it wanders; boxed mode only listens within its box.
    const target: HTMLElement | Window = roam ? window : wrap
    target.addEventListener('pointermove', onMove as EventListener)
    target.addEventListener('pointerenter', onEnter)
    target.addEventListener('pointerleave', onLeave)

    let scale = 1
    let raf = 0

    const tick = () => {
      const p = pos.current
      const v = vel.current
      const cx = p.x + S / 2
      const cy = p.y + SH / 2
      const dx = cx - mouse.current.x
      const dy = cy - mouse.current.y
      const dist = Math.hypot(dx, dy) || 1
      const hovering = mouse.current.inside && dist < S / 2 + INFLUENCE

      if (hovering) {
        // First kick in roam mode: hand the ball off from its in-flow box to
        // fixed/viewport coordinates so it can roam the whole page. Translating
        // both the ball and the cursor by the box's offset keeps the shove
        // direction (computed above) intact across the switch.
        if (roam && !fixedMode) {
          const r = wrap.getBoundingClientRect()
          pos.current.x += r.left
          pos.current.y += r.top
          mouse.current.x += r.left
          mouse.current.y += r.top
          ball.style.position = 'fixed'
          fixedMode = true
          W = window.innerWidth
          H = window.innerHeight
        }
        const nx = dx / dist
        const ny = dy / dist
        // stronger shove the closer the cursor is to the center
        const strength = PUSH * (1 - dist / (S / 2 + INFLUENCE))
        v.x += nx * strength
        v.y += ny * strength
        // ...but the cursor also drags its speed down
        v.x *= 0.9
        v.y *= 0.9
        started.current = true
      }

      p.x += v.x
      p.y += v.y

      // bounce off the canvas walls — flip to a fresh DVD color on any hit
      let hit = false
      if (p.x <= 0) {
        p.x = 0
        v.x = Math.abs(v.x)
        hit = true
      } else if (p.x >= W - S) {
        p.x = W - S
        v.x = -Math.abs(v.x)
        hit = true
      }
      if (p.y <= 0) {
        p.y = 0
        v.y = Math.abs(v.y)
        hit = true
      } else if (p.y >= H - SH) {
        p.y = H - SH
        v.y = -Math.abs(v.y)
        hit = true
      }
      if (hit && started.current) bounceColor()

      let sp = Math.hypot(v.x, v.y)
      // keep it drifting once kicked, unless the cursor is actively slowing it
      if (started.current && !hovering && sp < MIN) {
        if (sp < 0.001) {
          const a = (p.x + p.y) * 0.05
          v.x = Math.cos(a) * MIN
          v.y = Math.sin(a) * MIN
        } else {
          v.x = (v.x / sp) * MIN
          v.y = (v.y / sp) * MIN
        }
      }
      if (sp > MAX) {
        v.x = (v.x / sp) * MAX
        v.y = (v.y / sp) * MAX
      }

      scale += ((hovering ? 1.07 : 1) - scale) * 0.2
      ball.style.transform = `translate(${p.x}px, ${p.y}px) scale(${scale})`
      ball.style.background = color
      ball.style.color = textColor

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    // Once fixed, the box no longer drives bounds — track the viewport directly.
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', measure)
      target.removeEventListener('pointermove', onMove as EventListener)
      target.removeEventListener('pointerenter', onEnter)
      target.removeEventListener('pointerleave', onLeave)
    }
  }, [roam])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
        // Boxed until kicked. In roam mode the ball goes position:fixed and must
        // not be clipped by this box, so keep overflow visible there.
        overflow: roam ? 'visible' : 'hidden',
      }}
    >
      <Link
        ref={ballRef}
        href={href}
        className="font-display"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          // Float above page content while roaming (stays under the global
          // wordmark / frame overlays, which sit outside this stacking context).
          zIndex: roam ? 40 : undefined,
          pointerEvents: 'auto',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minWidth: ballSize,
          boxSizing: 'border-box',
          padding: 'clamp(0.65rem, 1.5vw, 1.1rem) clamp(1.1rem, 2.2vw, 1.7rem)',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
          background: INK,
          color: BG,
          fontSize: 'clamp(0.9rem, 1.45vw, 1.2rem)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {label}
      </Link>
    </div>
  )
}
