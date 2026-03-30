'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLenis } from '@/lib/lenis-provider'
import { NavOverlay } from './nav-overlay'

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/experiments', label: 'Experiments' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    const handleScroll = ({ scroll }: { scroll: number }) => {
      setScrolled(scroll > 100)
    }

    lenis.on('scroll', handleScroll)
    return () => {
      lenis.off('scroll', handleScroll)
    }
  }, [lenis])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!lenis) return
    if (menuOpen) {
      lenis.stop()
    } else {
      lenis.start()
    }
  }, [menuOpen, lenis])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors`}
        style={{
          transitionDuration: 'var(--duration-normal)',
          transitionTimingFunction: 'var(--ease-smooth)',
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <nav
          className="flex items-center justify-between"
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            padding: '1.25rem var(--gutter)',
          }}
        >
          <Link
            href="/"
            className="font-display text-text-primary text-lg font-medium tracking-tight hover:text-accent transition-colors"
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            Studio Studio
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-sm tracking-wide transition-colors ${
                  pathname === link.href || pathname?.startsWith(link.href + '/')
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent'
                }`}
                style={{ transitionDuration: 'var(--duration-fast)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 -mr-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-6 h-px bg-text-primary" />
            <span className="block w-6 h-px bg-text-primary" />
          </button>
        </nav>
      </header>

      <NavOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
