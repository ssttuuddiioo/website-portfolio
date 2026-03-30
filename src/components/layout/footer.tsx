import Link from 'next/link'

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/studiostudio.nyc', label: 'Instagram' },
  { href: 'https://vimeo.com/studiostudio', label: 'Vimeo' },
  { href: 'https://github.com/studiostudio', label: 'GitHub' },
  { href: 'https://linkedin.com/in/pablognecco', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer
      className="border-t border-border"
      style={{ padding: 'var(--spacing-3xl) var(--gutter)' }}
    >
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="font-display text-text-primary text-sm font-medium hover:text-accent transition-colors"
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            Studio Studio
          </Link>
          <p className="font-mono text-xs tracking-wide text-text-tertiary">
            © {new Date().getFullYear()} Studio Studio · Brooklyn, NY
          </p>
        </div>

        <div className="flex gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-wide text-text-secondary hover:text-accent transition-colors"
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
