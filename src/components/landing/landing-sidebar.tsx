'use client'

import Link from 'next/link'
import { useLenis } from '@/lib/lenis-provider'
import { INK, BLUE } from './landing-theme'

type Item =
  | { id: string; label: string; kind: 'scroll' }
  | { id: string; label: string; kind: 'route'; href: string }

const ITEMS: Item[] = [
  { id: 'home', label: 'home', kind: 'scroll' },
  { id: 'about', label: 'about', kind: 'scroll' },
  { id: 'work', label: 'work', kind: 'scroll' },
  { id: 'services', label: 'services', kind: 'scroll' },
  { id: 'ideas', label: 'ideas', kind: 'scroll' },
  { id: 'stories', label: 'stories', kind: 'scroll' },
  { id: 'contact', label: 'contact', kind: 'scroll' },
]

/**
 * Persistent left-hand nav — the spine of the landing experience.
 * A blue dot marks the active section. On the main page `inPage` is true
 * and scroll items smooth-scroll via Lenis; on sub-pages they link back
 * to the matching anchor on /landing.
 */
export function LandingSidebar({
  active,
  inPage = true,
}: {
  active: string
  inPage?: boolean
}) {
  const lenis = useLenis()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed left-0 top-0 h-screen flex items-center z-[80]"
      style={{ paddingLeft: 'var(--gutter, 1.5rem)' }}
    >
      <ul className="flex flex-col" style={{ gap: '0.55rem' }}>
        {ITEMS.map((item) => {
          const isActive = active === item.id
          const labelStyle: React.CSSProperties = {
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.8rem',
            letterSpacing: '0.01em',
            color: INK,
            opacity: isActive ? 1 : 0.5,
            transition: 'opacity 200ms',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }

          return (
            <li key={item.id} className="flex items-center" style={{ height: 18 }}>
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isActive ? BLUE : 'transparent',
                  marginRight: 9,
                  flexShrink: 0,
                  transition: 'background 200ms',
                }}
              />
              {item.kind === 'route' ? (
                <Link
                  href={item.href}
                  style={labelStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = isActive ? '1' : '0.5')
                  }
                >
                  {item.label}
                </Link>
              ) : inPage ? (
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  style={labelStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = isActive ? '1' : '0.5')
                  }
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={`/landing#${item.id}`}
                  style={labelStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = isActive ? '1' : '0.5')
                  }
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
