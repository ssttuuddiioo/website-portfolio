'use client'

import Image from 'next/image'
import type { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'

export const projectComponents: PortableTextComponents = {
  types: {
    imageBlock: ({ value }) => {
      if (!value?.image?.asset) return null

      const isFullBleed = value.layout === 'full-bleed'
      const isHalf = value.layout === 'left-half' || value.layout === 'right-half'

      return (
        <figure
          className={isFullBleed ? '' : isHalf ? 'max-w-[50%]' : ''}
          style={{
            margin: isFullBleed
              ? 'var(--spacing-3xl) calc(-1 * var(--gutter))'
              : `var(--spacing-3xl) auto`,
            maxWidth: isFullBleed ? 'none' : isHalf ? '50%' : 'var(--max-width)',
            float: value.layout === 'left-half' ? 'left' : value.layout === 'right-half' ? 'right' : undefined,
          }}
        >
          <Image
            src={urlFor(value.image).width(isFullBleed ? 2400 : 1200).url()}
            alt={value.image.alt || ''}
            width={value.image.asset?.metadata?.dimensions?.width || 1200}
            height={value.image.asset?.metadata?.dimensions?.height || 800}
            className="w-full"
            placeholder={value.image.asset?.metadata?.lqip ? 'blur' : undefined}
            blurDataURL={value.image.asset?.metadata?.lqip || undefined}
          />
          {value.caption && (
            <figcaption
              className="font-mono text-text-secondary mt-3"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
                padding: isFullBleed ? '0 var(--gutter)' : undefined,
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    imageGrid: ({ value }) => {
      if (!value?.images?.length) return null

      return (
        <figure style={{ margin: 'var(--spacing-3xl) 0' }}>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${value.columns || 2}, 1fr)`,
            }}
          >
            {value.images.map((img: any, i: number) => (
              <Image
                key={i}
                src={urlFor(img).width(800).url()}
                alt={img.alt || ''}
                width={img.asset?.metadata?.dimensions?.width || 800}
                height={img.asset?.metadata?.dimensions?.height || 600}
                className="w-full"
                placeholder={img.asset?.metadata?.lqip ? 'blur' : undefined}
                blurDataURL={img.asset?.metadata?.lqip || undefined}
              />
            ))}
          </div>
          {value.caption && (
            <figcaption
              className="font-mono text-text-secondary mt-3"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    videoEmbed: ({ value }) => {
      if (!value?.url) return null

      const aspectMap: Record<string, string> = {
        '16:9': '56.25%',
        '4:3': '75%',
        '1:1': '100%',
        '9:16': '177.78%',
      }

      // Convert Vimeo/YouTube URLs to embed format
      let embedUrl = value.url
      const vimeoMatch = value.url.match(/vimeo\.com\/(\d+)/)
      const youtubeMatch = value.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)

      if (vimeoMatch) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`
      } else if (youtubeMatch) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`
      }

      return (
        <figure style={{ margin: 'var(--spacing-3xl) 0' }}>
          <div
            className="relative w-full overflow-hidden"
            style={{ paddingBottom: aspectMap[value.aspectRatio] || '56.25%' }}
          >
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={value.caption || 'Video'}
            />
          </div>
          {value.caption && (
            <figcaption
              className="font-mono text-text-secondary mt-3"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    videoFile: ({ value }) => {
      if (!value?.file?.asset?.url) return null

      return (
        <figure style={{ margin: 'var(--spacing-3xl) 0' }}>
          <video
            src={value.file.asset.url}
            poster={value.poster?.asset?.url}
            autoPlay={value.autoplay}
            loop={value.loop}
            muted
            playsInline
            className="w-full"
          />
          {value.caption && (
            <figcaption
              className="font-mono text-text-secondary mt-3"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    pullQuote: ({ value }) => (
      <blockquote
        className="border-l-2 border-accent"
        style={{
          margin: 'var(--spacing-3xl) 0',
          padding: '0 0 0 var(--spacing-lg)',
        }}
      >
        <p
          className="font-display italic text-text-primary"
          style={{
            fontSize: 'var(--text-xl)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          &ldquo;{value.quote}&rdquo;
        </p>
        {value.attribution && (
          <cite
            className="font-mono text-text-secondary not-italic block mt-3"
            style={{
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            — {value.attribution}
          </cite>
        )}
      </blockquote>
    ),

    techStackBlock: ({ value }) => {
      if (!value?.technologies?.length) return null

      // Group by category
      const grouped = value.technologies.reduce(
        (acc: Record<string, string[]>, tech: any) => {
          const cat = tech.category || 'Other'
          if (!acc[cat]) acc[cat] = []
          acc[cat].push(tech.name)
          return acc
        },
        {} as Record<string, string[]>
      )

      return (
        <div
          className="border-t border-b border-border"
          style={{
            margin: 'var(--spacing-3xl) 0',
            padding: 'var(--spacing-xl) 0',
          }}
        >
          {Object.entries(grouped).map(([category, techs]) => (
            <div key={category} className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4 last:mb-0">
              <span
                className="font-mono text-text-tertiary"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  minWidth: '100px',
                }}
              >
                {category}
              </span>
              <div className="flex flex-wrap gap-2">
                {(techs as string[]).map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-text-secondary bg-bg-surface px-3 py-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      letterSpacing: 'var(--tracking-wide)',
                      borderRadius: '2px',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
  },

  marks: {
    link: ({ children, value }) => {
      const { href, external } = value || {}
      return external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          {children}
        </a>
      ) : (
        <a
          href={href}
          className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          {children}
        </a>
      )
    },
  },

  block: {
    h2: ({ children }) => (
      <h2
        className="font-display font-medium text-text-primary"
        style={{
          fontSize: 'var(--text-2xl)',
          lineHeight: 'var(--leading-snug)',
          marginTop: 'var(--spacing-3xl)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="font-display font-medium text-text-primary"
        style={{
          fontSize: 'var(--text-xl)',
          lineHeight: 'var(--leading-snug)',
          marginTop: 'var(--spacing-2xl)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p
        className="font-display text-text-primary"
        style={{
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-normal)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-2 border-accent font-display italic text-text-secondary"
        style={{
          paddingLeft: 'var(--spacing-lg)',
          margin: 'var(--spacing-2xl) 0',
          fontSize: 'var(--text-lg)',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        {children}
      </blockquote>
    ),
  },
}
