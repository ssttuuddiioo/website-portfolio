import type { SanityCollaborator } from '@/lib/sanity/types'

interface CollaboratorsProps {
  list: SanityCollaborator[]
}

export function Collaborators({ list }: CollaboratorsProps) {
  if (!list?.length) return null

  return (
    <section
      className="border-t border-border"
      style={{
        padding: 'var(--spacing-2xl) 0',
        margin: 'var(--spacing-3xl) 0 0',
      }}
    >
      <h3
        className="font-mono text-text-tertiary mb-6"
        style={{
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
        }}
      >
        Collaborators
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {list.map((collab) => (
          <div key={collab.name}>
            {collab.url ? (
              <a
                href={collab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-text-primary hover:text-accent transition-colors"
                style={{
                  fontSize: 'var(--text-base)',
                  transitionDuration: 'var(--duration-fast)',
                }}
              >
                {collab.name}
              </a>
            ) : (
              <span
                className="font-display text-text-primary"
                style={{ fontSize: 'var(--text-base)' }}
              >
                {collab.name}
              </span>
            )}
            {collab.role && (
              <p
                className="font-mono text-text-secondary"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  marginTop: '2px',
                }}
              >
                {collab.role}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
