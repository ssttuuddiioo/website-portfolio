'use client'

import { motion, useMotionValue, useSpring, animate } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useCallback, useState } from 'react'

const PLACEHOLDER_PROJECTS = [
  { title: 'Dolby Moment', client: 'Dolby', year: 2015, tag: 'experiential', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=75' },
  { title: 'Scatter and Rise', client: 'Goat Farm Arts', year: 2023, tag: 'public art', image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=600&q=75' },
  { title: 'Gesture-Gesture', client: 'Gallery 72', year: 2014, tag: 'tech experiment', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=75' },
  { title: 'Suffolk Building', client: 'Chemistry Creative', year: 2023, tag: 'creative', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=75' },
  { title: 'Cox Pillars', client: 'Cox Communications', year: 2024, tag: 'experiential', image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=600&q=75' },
  { title: 'Orbitals', client: 'Personal', year: 2018, tag: 'tech experiment', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=75' },
  { title: 'Sound Journeys', client: 'Personal', year: 2017, tag: 'public art', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=75' },
  { title: 'Snowblind', client: 'Personal', year: 2016, tag: 'creative', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=75' },
  { title: 'Living Walls', client: 'Mercedes-Benz Stadium', year: 2024, tag: 'experiential', image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=75' },
  { title: 'HydroStation', client: 'Bould Design', year: 2024, tag: 'tech experiment', image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&q=75' },
]

type RGB = [number, number, number]

/** Sample 3 colors from different regions of an image */
function extractColors(src: string): Promise<[RGB, RGB, RGB]> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve([[180, 120, 90], [90, 140, 180], [160, 100, 160]])
        return
      }
      canvas.width = 6
      canvas.height = 6
      ctx.drawImage(img, 0, 0, 6, 6)
      const d = ctx.getImageData(0, 0, 6, 6).data

      // Sample top-left region, center, bottom-right for 3 distinct colors
      const sample = (pixels: number[]): RGB => {
        let r = 0, g = 0, b = 0
        for (const p of pixels) {
          r += d[p * 4]
          g += d[p * 4 + 1]
          b += d[p * 4 + 2]
        }
        const n = pixels.length
        return [
          Math.round(Math.min(255, (r / n) * 2)),
          Math.round(Math.min(255, (g / n) * 2)),
          Math.round(Math.min(255, (b / n) * 2)),
        ]
      }

      resolve([
        sample([0, 1, 6, 7]),       // top-left quad
        sample([2, 3, 8, 9]),       // top-right quad
        sample([26, 27, 32, 33]),   // bottom-right quad
      ])
    }
    img.onerror = () => resolve([[180, 120, 90], [90, 140, 180], [160, 100, 160]])
    img.src = src
  })
}

export function IndexTeaser() {
  const gridRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cellColors, setCellColors] = useState<[RGB, RGB, RGB][]>([])
  const [isInGrid, setIsInGrid] = useState(false)

  // Smooth cursor follow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 30, stiffness: 120, mass: 0.8 })
  const springY = useSpring(mouseY, { damping: 30, stiffness: 120, mass: 0.8 })

  // Three color channels — one per blob
  const blob1R = useMotionValue(180), blob1G = useMotionValue(120), blob1B = useMotionValue(90)
  const blob2R = useMotionValue(90),  blob2G = useMotionValue(140), blob2B = useMotionValue(180)
  const blob3R = useMotionValue(160), blob3G = useMotionValue(100), blob3B = useMotionValue(160)

  const s1R = useSpring(blob1R, { damping: 25, stiffness: 60 })
  const s1G = useSpring(blob1G, { damping: 25, stiffness: 60 })
  const s1B = useSpring(blob1B, { damping: 25, stiffness: 60 })
  const s2R = useSpring(blob2R, { damping: 30, stiffness: 50 })
  const s2G = useSpring(blob2G, { damping: 30, stiffness: 50 })
  const s2B = useSpring(blob2B, { damping: 30, stiffness: 50 })
  const s3R = useSpring(blob3R, { damping: 35, stiffness: 45 })
  const s3G = useSpring(blob3G, { damping: 35, stiffness: 45 })
  const s3B = useSpring(blob3B, { damping: 35, stiffness: 45 })

  // Extract 3 colors per image on mount
  useEffect(() => {
    Promise.all(PLACEHOLDER_PROJECTS.map((p) => extractColors(p.image))).then(setCellColors)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const grid = gridRef.current
      if (!grid) return

      const rect = grid.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)

      for (let i = 0; i < cellRefs.current.length; i++) {
        const cell = cellRefs.current[i]
        if (!cell) continue
        const cr = cell.getBoundingClientRect()
        if (
          e.clientX >= cr.left && e.clientX <= cr.right &&
          e.clientY >= cr.top && e.clientY <= cr.bottom
        ) {
          if (cellColors[i]) {
            const [c1, c2, c3] = cellColors[i]
            animate(blob1R, c1[0], { duration: 0.6, ease: 'easeOut' })
            animate(blob1G, c1[1], { duration: 0.6, ease: 'easeOut' })
            animate(blob1B, c1[2], { duration: 0.6, ease: 'easeOut' })
            animate(blob2R, c2[0], { duration: 0.8, ease: 'easeOut' })
            animate(blob2G, c2[1], { duration: 0.8, ease: 'easeOut' })
            animate(blob2B, c2[2], { duration: 0.8, ease: 'easeOut' })
            animate(blob3R, c3[0], { duration: 1.0, ease: 'easeOut' })
            animate(blob3G, c3[1], { duration: 1.0, ease: 'easeOut' })
            animate(blob3B, c3[2], { duration: 1.0, ease: 'easeOut' })
          }
          break
        }
      }
    },
    [cellColors, mouseX, mouseY, blob1R, blob1G, blob1B, blob2R, blob2G, blob2B, blob3R, blob3G, blob3B],
  )

  // Three blob refs
  const blobRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const rafRef = useRef<number>(0)

  // rAF loop — orbits the blobs around the cursor with slow sine paths
  useEffect(() => {
    let t = 0
    const speeds = [0.0008, 0.0006, 0.0005]
    const radii = [120, 165, 90]
    const phases = [0, 2.1, 4.2]

    function tick() {
      t += 1
      const cx = springX.get()
      const cy = springY.get()

      const colors = [
        [s1R.get(), s1G.get(), s1B.get()],
        [s2R.get(), s2G.get(), s2B.get()],
        [s3R.get(), s3G.get(), s3B.get()],
      ]

      for (let i = 0; i < 3; i++) {
        const el = blobRefs.current[i]
        if (!el) continue
        const angle = t * speeds[i] + phases[i]
        const ox = Math.sin(angle) * radii[i]
        const oy = Math.cos(angle * 0.7 + phases[i]) * radii[i]
        const [r, g, b] = colors[i].map(Math.round)
        const size = [600, 525, 450][i]
        const half = size / 2
        el.style.transform = `translate(${cx + ox - half}px, ${cy + oy - half}px)`
        el.style.background = `radial-gradient(circle, rgba(${r},${g},${b},0.06) 0%, rgba(${r},${g},${b},0.04) 20%, rgba(${r},${g},${b},0.02) 40%, rgba(${r},${g},${b},0.008) 60%, transparent 85%)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [springX, springY, s1R, s1G, s1B, s2R, s2G, s2B, s3R, s3G, s3B])

  return (
    <section style={{ paddingBottom: 'var(--spacing-section)' }}>
      <div
        className="flex items-center gap-4 mb-10"
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
          marginBottom: '40px',
        }}
      >
        <span
          className="font-mono text-text-tertiary"
          style={{
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
          }}
        >
          All Projects
        </span>
        <span className="flex-1 h-px bg-border" />
        <Link
          href="/work"
          className="font-mono text-text-secondary hover:text-accent transition-colors"
          style={{
            fontSize: 'var(--text-sm)',
            letterSpacing: 'var(--tracking-wide)',
            transitionDuration: 'var(--duration-fast)',
          }}
        >
          View all &rarr;
        </Link>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 relative overflow-hidden"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsInGrid(true)}
        onMouseLeave={() => setIsInGrid(false)}
      >
        {/* Three metaball blobs — behind images */}
        {[600, 525, 450].map((size, i) => (
          <div
            key={i}
            ref={(el) => { blobRefs.current[i] = el }}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 0,
              filter: `blur(${50 + i * 10}px)`,
              opacity: isInGrid ? 1 : 0,
              transition: 'opacity 0.5s ease',
              willChange: 'transform, background',
            }}
          />
        ))}

        {PLACEHOLDER_PROJECTS.map((project, i) => (
          <motion.div
            key={project.title}
            ref={(el) => { cellRefs.current[i] = el }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: (i % 4) * 0.06,
            }}
            style={{
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '50px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div className="group relative cursor-pointer">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.015]"
                  style={{
                    transitionDuration: '800ms',
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.5) 0%, transparent 40%, transparent 60%, rgba(10, 10, 10, 0.5) 100%)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-display font-medium text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
                      {project.title}
                    </p>
                    <p
                      className="font-mono text-text-secondary"
                      style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}
                    >
                      {project.year}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p
                      className="font-mono text-text-secondary"
                      style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}
                    >
                      {project.client}
                    </p>
                    <p
                      className="font-mono text-text-secondary"
                      style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}
                    >
                      {project.tag}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
