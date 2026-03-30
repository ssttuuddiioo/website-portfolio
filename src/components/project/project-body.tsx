'use client'

import { PortableText } from '@portabletext/react'
import { projectComponents } from './portable-text-components'

interface ProjectBodyProps {
  body: unknown[]
}

export function ProjectBody({ body }: ProjectBodyProps) {
  if (!body?.length) return null

  return (
    <div style={{ margin: 'var(--spacing-2xl) 0' }}>
      <PortableText value={body as any} components={projectComponents} />
    </div>
  )
}
