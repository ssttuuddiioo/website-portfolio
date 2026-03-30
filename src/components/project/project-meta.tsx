import type { SanityProjectDetail } from '@/lib/sanity/types'

interface ProjectMetaProps {
  project: SanityProjectDetail
}

export function ProjectMeta({ project }: ProjectMetaProps) {
  const metaItems = [
    { label: 'Client', value: project.client },
    { label: 'Role', value: project.role },
    { label: 'Year', value: project.year?.toString() },
    { label: 'Category', value: project.category?.title },
  ].filter((item) => item.value)

  if (metaItems.length === 0) return null

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-border"
      style={{
        padding: 'var(--spacing-xl) 0',
        margin: 'var(--spacing-2xl) 0',
      }}
    >
      {metaItems.map((item) => (
        <div key={item.label}>
          <dt
            className="font-mono text-text-tertiary"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            {item.label}
          </dt>
          <dd
            className="font-mono text-text-secondary"
            style={{
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </div>
  )
}
