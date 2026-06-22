'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLenis } from '@/lib/lenis-provider'
import { INK, BLUE, BG } from './landing-theme'

type Item =
  | { id: string; label: string; kind: 'scroll' }
  | { id: string; label: string; kind: 'route'; href: string }

const ITEMS: Item[] = [
  { id: 'home', label: 'home', kind: 'scroll' },
  { id: 'about', label: 'about', kind: 'scroll' },
  { id: 'work', label: 'work', kind: 'scroll' },
  { id: 'services', label: 'services', kind: 'scroll' },
  { id: 'ideas', label: 'ideas', kind: 'scroll' },
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

function SocialRow({
  size,
  gap,
  horizontal = false,
  onContact,
}: {
  size: number
  gap: string
  horizontal?: boolean
  onContact?: () => void
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
              color: INK,
              opacity: 0.5,
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
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
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
}: {
  active: string
  inPage?: boolean
}) {
  const lenis = useLenis()
  const [open, setOpen] = useState(false)

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!lenis) return
    if (open) lenis.stop()
    else lenis.start()
    return () => lenis.start()
  }, [open, lenis])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    // force: true so the scroll runs even though the open menu has called
    // lenis.stop() — without it Lenis ignores scrollTo while stopped, which is
    // why tapping a mobile menu item never navigated.
    if (lenis) lenis.scrollTo(el, { offset: 0, force: true })
    else el.scrollIntoView({ behavior: 'smooth' })
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
            scrollTo(item.id)
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
      {/* Desktop — nav links on a solid background-colored bar pinned to the top */}
      <nav
        className="fixed left-0 right-0 top-0 hidden md:flex justify-center items-center z-[80]"
        style={{
          background: BG,
          paddingTop: 'max(0.7rem, env(safe-area-inset-top))',
          paddingBottom: '0.7rem',
        }}
      >
        <ul className="flex flex-row items-center" style={{ gap: '1.5rem' }}>
          {ITEMS.map((item) => renderRow(item, 7, '0.8rem'))}
        </ul>
      </nav>

      {/* Desktop — social icons on a solid background-colored bar, bottom center */}
      <div
        className="fixed left-0 right-0 bottom-0 hidden md:flex justify-center items-center z-[80]"
        style={{
          background: BG,
          paddingTop: '0.7rem',
          paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))',
        }}
      >
        <SocialRow
          size={17}
          gap="0.9rem"
          horizontal
          onContact={() => scrollTo('contact')}
        />
      </div>

      {/* Mobile — hamburger top-left (becomes an X when open) */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="md:hidden fixed top-0 left-0 z-[90] flex flex-col justify-center"
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

      {/* Mobile — full-screen menu */}
      <div
        className="md:hidden fixed inset-0 z-[85]"
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
              scrollTo('contact')
              setOpen(false)
            }}
          />
        </div>
      </div>
    </>
  )
}
