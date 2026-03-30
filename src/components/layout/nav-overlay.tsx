'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/experiments', label: 'Experiments' },
  { href: '/contact', label: 'Contact' },
]

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/studiostudio.nyc', label: 'IG' },
  { href: 'https://vimeo.com/studiostudio', label: 'Vimeo' },
  { href: 'https://github.com/studiostudio', label: 'GitHub' },
  { href: 'https://linkedin.com/in/pablognecco', label: 'LinkedIn' },
]

interface NavOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function NavOverlay({ isOpen, onClose }: NavOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-bg-primary flex flex-col justify-between"
          style={{ padding: 'var(--gutter)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="font-mono text-sm tracking-wide text-text-secondary hover:text-accent transition-colors p-2 -mr-2"
              style={{ transitionDuration: 'var(--duration-fast)' }}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-display text-4xl font-light tracking-tight text-text-primary hover:text-accent transition-colors"
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Social + email */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href="mailto:hello@studiostudio.nyc"
              className="font-mono text-sm tracking-wide text-text-secondary hover:text-accent transition-colors"
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              hello@studiostudio.nyc
            </a>
            <div className="flex gap-6">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm tracking-wide text-text-secondary hover:text-accent transition-colors"
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
