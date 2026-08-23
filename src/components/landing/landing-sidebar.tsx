'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useLenis } from '@/lib/lenis-provider'
import { centerOffset } from './use-scroll-to-section'
import { INK, BLUE, BG, SURFACE, ink } from './landing-theme'

type Item =
  | { id: string; label: string; kind: 'scroll' }
  | { id: string; label: string; kind: 'route'; href: string }

const ITEMS: Item[] = [
  { id: 'home', label: 'home', kind: 'scroll' },
  { id: 'about', label: 'about', kind: 'scroll' },
  { id: 'work', label: 'work', kind: 'scroll' },
  { id: 'services', label: 'services', kind: 'scroll' },
  // { id: 'ideas', label: 'notes', kind: 'scroll' }, // hidden for now
  { id: 'contact', label: 'contact', kind: 'scroll' },
]

// Order = 2x2 grid reading order: Instagram, LinkedIn on top; Email, GitHub below.
// The Email item scrolls to the contact section rather than opening a new tab.
const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  { label: 'Email', href: '#contact', icon: 'mail', contact: true },
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
]

// Simple line-style house, matching the social icons' stroke treatment. Used in
// place of the "home" word in the nav dock.
function HomeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path d="M3 11l9-7 9 7" />
      <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
    </svg>
  )
}

function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  const c = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'instagram':
      return (
        <svg {...c}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...c}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7l10 6 10-6" />
        </svg>
      )
    case 'github':
      return (
        <svg {...c}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...c}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    default:
      return null
  }
}

export function SocialRow({
  size,
  gap,
  horizontal = false,
  onContact,
  color = INK,
  restOpacity = 0.5,
}: {
  size: number
  gap: string
  horizontal?: boolean
  onContact?: () => void
  /** Icon color. Defaults to page ink; the IKB footer passes PAPER. */
  color?: string
  /** Resting opacity, raised to 1 on hover. */
  restOpacity?: number
}) {
  return (
    <div
      style={{
        display: horizontal ? 'flex' : 'grid',
        gridTemplateColumns: horizontal ? undefined : 'repeat(2, max-content)',
        alignItems: 'center',
        gap,
        width: 'max-content',
      }}
    >
      {SOCIALS.map((s) => {
        const isContact = 'contact' in s && s.contact
        return (
          <a
            key={s.label}
            href={s.href}
            target={isContact ? undefined : '_blank'}
            rel={isContact ? undefined : 'noreferrer'}
            aria-label={s.label}
            style={{
              color,
              opacity: restOpacity,
              display: 'flex',
              transition: 'opacity 200ms',
            }}
            onClick={
              isContact && onContact
                ? (e) => {
                    e.preventDefault()
                    onContact()
                  }
                : undefined
            }
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = String(restOpacity))
            }
          >
            <SocialIcon name={s.icon} size={size} />
          </a>
        )
      })}
    </div>
  )
}

/**
 * Persistent left-hand nav on desktop; a hamburger (top-left) opening a
 * full-screen menu on mobile. A blue dot marks the active section. Scroll
 * items smooth-scroll via Lenis; route items navigate.
 */
export function LandingSidebar({
  active,
  inPage = true,
  dockOpacity,
  dockY,
  onNavigate,
}: {
  active: string
  inPage?: boolean
  // Reveal animation for the desktop dock, driven by the hero scroll. When
  // omitted (e.g. on inner pages) the dock is simply always visible.
  dockOpacity?: MotionValue<number>
  dockY?: MotionValue<number>
  // Section navigation owned by the landing page: sets the highlight and locks
  // the scroll-spy for the duration of the programmatic scroll. When omitted
  // we fall back to a plain Lenis scroll.
  onNavigate?: (id: string) => void
}) {
  const lenis = useLenis()
  const [open, setOpen] = useState(false)

  // Fallback so the hooks run unconditionally even when no reveal is passed
  // (inner pages): the dock just sits fully visible at rest.
  const restOpacity = useMotionValue(1)
  const restY = useMotionValue(0)
  const navOpacity = dockOpacity ?? restOpacity
  const navY = dockY ?? restY
  // Don't let the dock capture clicks while it's still tucked away/fading in.
  const dockPointer = useTransform(navOpacity, (o) =>
    o > 0.05 ? 'auto' : 'none',
  )

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!lenis) return
    if (open) lenis.stop()
    else lenis.start()
    return () => lenis.start()
  }, [open, lenis])

  // Prefer the page-owned navigation (highlight + spy lock); otherwise fall
  // back to a plain Lenis scroll. force: true so it runs even while the open
  // mobile menu has called lenis.stop().
  const go = (id: string) => {
    if (onNavigate) return onNavigate(id)
    const el = document.getElementById(id)
    if (!el) return
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
  }

  // Sliding highlight pill (desktop dock): we measure the active item's box and
  // animate a blue pill to it, so it snaps between items as the active section
  // changes — including continuously while a click-scroll is in flight.
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active]
      if (!el) return
      setPill({ x: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    // Re-measure once the mono font has loaded so the metrics are final.
    document.fonts?.ready?.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [active])

  // Horizontal dock item: padded mono label. The active item reads white over
  // the sliding blue pill (rendered separately behind the row); inactive items
  // are dimmed ink and lift on hover.
  const renderDockItem = (item: Item) => {
    const isActive = active === item.id
    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '0.95rem',
      letterSpacing: '0.01em',
      color: isActive ? '#fff' : INK,
      opacity: isActive ? 1 : 0.4,
      fontWeight: isActive ? 700 : 400,
      transition: 'color 200ms, opacity 200ms',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }
    // Don't fight the white-on-blue active label with hover dimming.
    const onEnter = (e: React.MouseEvent<HTMLElement>) => {
      if (!isActive) e.currentTarget.style.opacity = '0.7'
    }
    const onLeave = (e: React.MouseEvent<HTMLElement>) => {
      if (!isActive) e.currentTarget.style.opacity = '0.4'
    }

    // Home reads as a line-style house icon rather than the word.
    const isHome = item.id === 'home'
    const content = isHome ? <HomeIcon size={18} /> : item.label
    const a11yLabel = isHome ? 'home' : undefined

    let label: React.ReactNode
    if (item.kind === 'route') {
      label = (
        <Link
          href={item.href}
          style={labelStyle}
          aria-label={a11yLabel}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {content}
        </Link>
      )
    } else if (inPage) {
      label = (
        <button
          type="button"
          style={labelStyle}
          aria-label={a11yLabel}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => go(item.id)}
        >
          {content}
        </button>
      )
    } else {
      label = (
        <Link
          href={`/#${item.id}`}
          style={labelStyle}
          aria-label={a11yLabel}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {content}
        </Link>
      )
    }

    return (
      <li
        key={item.id}
        ref={(el) => {
          itemRefs.current[item.id] = el
        }}
        className="flex items-center justify-center"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0.5rem 1.1rem',
          borderRadius: 999,
        }}
      >
        {label}
      </li>
    )
  }

  const renderRow = (item: Item, dotSize: number, fontSize: string) => {
    const isActive = active === item.id
    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--font-mono), monospace',
      fontSize,
      letterSpacing: '0.01em',
      color: INK,
      opacity: isActive ? 1 : 0.5,
      transition: 'opacity 200ms',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      textAlign: 'left',
    }
    const onEnter = (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.opacity = '1')
    const onLeave = (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.opacity = isActive ? '1' : '0.5')

    let label: React.ReactNode
    if (item.kind === 'route') {
      label = (
        <Link
          href={item.href}
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      )
    } else if (inPage) {
      label = (
        <button
          type="button"
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => {
            go(item.id)
            setOpen(false)
          }}
        >
          {item.label}
        </button>
      )
    } else {
      label = (
        <Link
          href={`/#${item.id}`}
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      )
    }

    return (
      <li
        key={item.id}
        className="flex items-center"
        style={{ height: dotSize + 11 }}
      >
        <span
          aria-hidden
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: isActive ? BLUE : 'transparent',
            marginRight: 10,
            flexShrink: 0,
            transition: 'background 200ms',
          }}
        />
        {label}
      </li>
    )
  }

  return (
    <>
      {/* Floating nav dock — pinned top-right on desktop, opposite the STUDIO
          lockup in the top-left; centered along the top on mobile. A single
          pill of nav links with the sliding blue highlight. Replaces the
          hamburger on mobile (see the .nav-dock overrides in the <style>). */}
      <motion.nav
        className="flex nav-dock"
        style={{
          position: 'fixed',
          // Carried as far right as it can go without leaving the viewport.
          // A literal +200px off the old inset would hang the pill ~36px past
          // the right edge, so the floor holds it at 1.25rem clear (plus any
          // safe area) — roughly 145px right of where it was.
          right: 'max(calc(1.25rem + env(safe-area-inset-right)), calc(var(--gutter, 1.5rem) + env(safe-area-inset-right) - 100px))',
          top: 'calc(clamp(1.4rem, 3.4vh, 2.4rem) + env(safe-area-inset-top))',
          zIndex: 90,
          background: SURFACE,
          borderRadius: 999,
          padding: '0.35rem 0.5rem',
          border: `1px solid ${ink(0.12)}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          opacity: navOpacity,
          y: navY,
          pointerEvents: dockPointer,
        }}
      >
        <ul
          className="flex flex-row items-center"
          style={{ position: 'relative', gap: '0.25rem' }}
        >
          {/* Sliding blue highlight — snaps to the active item; springs along
              continuously while a click-scroll updates the active section. */}
          {pill && (
            <motion.div
              aria-hidden
              initial={false}
              animate={{ x: pill.x, width: pill.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: BLUE,
                borderRadius: 999,
                zIndex: 0,
              }}
            />
          )}
          {ITEMS.map((item) => renderDockItem(item))}
        </ul>
      </motion.nav>

      {/* Hamburger — retired now that the bottom dock serves mobile too. Kept in
          the tree but force-hidden via .ss-hide; restore by removing that class. */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ss-hide md:hidden fixed top-0 left-0 z-[90] flex flex-col justify-center"
        style={{
          paddingTop: 'calc(var(--gutter, 1.5rem) + env(safe-area-inset-top))',
          paddingLeft: 'calc(var(--gutter, 1.5rem) + env(safe-area-inset-left))',
          paddingRight: 'var(--gutter, 1.5rem)',
          paddingBottom: 'var(--gutter, 1.5rem)',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 26,
            height: 2,
            background: INK,
            borderRadius: 2,
            transformOrigin: 'center',
            transform: open ? 'translateY(4px) rotate(45deg)' : 'none',
            transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <span
          style={{
            display: 'block',
            width: 26,
            height: 2,
            background: INK,
            borderRadius: 2,
            transformOrigin: 'center',
            transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none',
            transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </button>

      {/* Full-screen menu — also retired with the hamburger (force-hidden). */}
      <div
        className="ss-hide md:hidden fixed inset-0 z-[85]"
        style={{
          background: BG,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'calc(var(--gutter, 1.5rem) + 1rem)',
        }}
      >
        <ul className="flex flex-col" style={{ gap: '0.5rem' }}>
          {ITEMS.map((item) => renderRow(item, 9, '1.6rem'))}
        </ul>
        <div style={{ marginTop: '2.5rem', marginLeft: 19 }}>
          <SocialRow
            size={22}
            gap="1.25rem"
            onContact={() => {
              go('contact')
              setOpen(false)
            }}
          />
        </div>
      </div>

      {/* Force-hide the retired hamburger + full-screen menu at every width, and
          recenter/shrink the dock so all the nav links fit on a phone.
          Centering uses left/right + margin:auto (not transform) so Framer's
          reveal y-animation on the dock survives. */}
      <style>{`
        .ss-hide { display: none !important; }
        @media (max-width: 767px) {
          .nav-dock {
            left: 0 !important;
            right: 0 !important;
            margin-left: auto !important;
            margin-right: auto !important;
            width: max-content !important;
            max-width: calc(100vw - 0.75rem) !important;
            padding: 0.3rem 0.4rem !important;
          }
          .nav-dock ul { gap: 0.05rem !important; }
          .nav-dock li { padding: 0.5rem 0.45rem !important; }
          .nav-dock a, .nav-dock button { font-size: 0.72rem !important; }
        }
      `}</style>
    </>
  )
}
