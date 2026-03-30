import Image from 'next/image'
import type { SanityProjectDetail } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

interface ProjectHeroProps {
  project: SanityProjectDetail
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const hasVideo = project.heroVideo?.asset?.url || project.heroVideoUrl
  const hasImage = project.heroImage?.asset?.url

  return (
    <section className="relative w-full" style={{ minHeight: '60vh' }}>
      {hasVideo ? (
        <video
          src={project.heroVideo?.asset?.url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ minHeight: '60vh' }}
        />
      ) : hasImage ? (
        <Image
          src={urlFor(project.heroImage).width(2400).url()}
          alt={project.heroImage?.alt || project.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          placeholder={project.heroImage?.asset?.metadata?.lqip ? 'blur' : undefined}
          blurDataURL={project.heroImage?.asset?.metadata?.lqip || undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-bg-surface" />
      )}
    </section>
  )
}
