'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { INK, BG, BLUE } from './landing-theme'

/**
 * "See All Work" as a DVD-screensaver bounce.
 * Sits still in the center until the cursor touches it — the cursor pushes it
 * away (and damps its speed), after which it drifts and bounces off the canvas
 * walls forever. Hovering both steers and slows it. Always clickable → /work.
 */
export function SeeAllWork() {
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
    let S = 0

    const measure = () => {
      const r = wrap.getBoundingClientRect()
      W = r.width
      H = r.height
      S = ball.offsetWidth
      pos.current.x = Math.min(Math.max(pos.current.x, 0), Math.max(0, W - S))
      pos.current.y = Math.min(Math.max(pos.current.y, 0), Math.max(0, H - S))
    }

    measure()
    pos.current.x = (W - S) / 2
    pos.current.y = (H - S) / 2
    ball.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const MIN = 1.4 // idle drift speed (px/frame)
    const MAX = 7
    const PUSH = 1.3
    const INFLUENCE = 44 // px of cursor reach beyond the ball edge

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      mouse.current.x = e.clientX - r.left
      mouse.current.y = e.clientY - r.top
    }
    const onEnter = () => {
      mouse.current.inside = true
    }
    const onLeave = () => {
      mouse.current.inside = false
      mouse.current.x = -9999
      mouse.current.y = -9999
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointerleave', onLeave)

    let scale = 1
    let raf = 0

    const tick = () => {
      const p = pos.current
      const v = vel.current
      const cx = p.x + S / 2
      const cy = p.y + S / 2
      const dx = cx - mouse.current.x
      const dy = cy - mouse.current.y
      const dist = Math.hypot(dx, dy) || 1
      const hovering = mouse.current.inside && dist < S / 2 + INFLUENCE

      if (hovering) {
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

      // bounce off the canvas walls
      if (p.x <= 0) {
        p.x = 0
        v.x = Math.abs(v.x)
      } else if (p.x >= W - S) {
        p.x = W - S
        v.x = -Math.abs(v.x)
      }
      if (p.y <= 0) {
        p.y = 0
        v.y = Math.abs(v.y)
      } else if (p.y >= H - S) {
        p.y = H - S
        v.y = -Math.abs(v.y)
      }

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
      ball.style.background = hovering ? BLUE : INK

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(measure)
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(460px, 64vh, 740px)',
        overflow: 'hidden',
      }}
    >
      <Link
        ref={ballRef}
        href="/work"
        className="font-display"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: 'clamp(150px, 18vw, 240px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: INK,
          color: BG,
          fontSize: 'clamp(1.1rem, 2vw, 1.7rem)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        See All Work
      </Link>
    </div>
  )
}
