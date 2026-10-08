'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  type Mesh,
  type Object3D,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
} from 'three'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { BG, INK } from './landing-theme'

/*
 * The index as a tube: every frame of every project once, laid along a single
 * spiral that runs from the first project at the top to the last at the
 * bottom. The wheel (or a swipe, or a drag) travels along it one frame at a
 * time, bringing each to the front and naming it; at either end the wheel
 * hands back to the page. Clicking a frame opens its page.
 *
 * Adapted from Matis Dene's scroll-driven image tube for Codrops
 * (github.com/matdn/helmet, MIT) — without the glass helmet at its centre, and
 * as one finite spiral rather than endlessly looping rings.
 */

type TubeProject = { slug: string; title: string; src: string; number: number }

const SOURCES = LANDING_PROJECTS.flatMap((p) =>
  p.slug
    ? [{ slug: p.slug, title: p.title, srcs: [p.image, ...(p.images ?? [])] }]
    : [],
)

const PROJECTS = SOURCES.map(({ slug, title }) => ({ slug, title }))

// Every frame of every project — the cover and its gallery — each one opening
// its own project, in index order, so travelling the spiral is reading the
// index front to back.
const FRAMES: TubeProject[] = SOURCES.flatMap(({ slug, title, srcs }, i) =>
  srcs.map((src) => ({ slug, title, src, number: i + 1 })),
)
const LAST = FRAMES.length - 1

// The frames ride through Next's optimizer at a fixed width: the originals run
// to 2000px, and 35 of those resident on the GPU at once is ~300MB for tiles
// that never draw much past 600px.
const TEX_WIDTH = 640
const TEXTURE_URLS = FRAMES.map(
  (p) => `/_next/image?url=${encodeURIComponent(p.src)}&w=${TEX_WIDTH}&q=75`,
)

const RADIUS = 4
// Landscape tiles — the work is mostly shot wide — at the site's 3:2.
const TILE_W = 1.2
const TILE_H = 0.8
const TILE_ASPECT = TILE_W / TILE_H
// Frames per turn of the spiral, and how far it drops over one turn: the same
// density and ring spacing the looping tube had.
const PER_TURN = 12
const PITCH = 2.1
const STEP_ANGLE = (Math.PI * 2) / PER_TURN
const STEP_DROP = PITCH / PER_TURN

// Wheel or swipe travel (px) per frame — one notch of a mouse wheel — and drag
// travel per frame, a little longer since a drag is a deliberate pull.
const WHEEL_PX_PER_FRAME = 100
const DRAG_PX_PER_FRAME = 140
// Quiet time after the last wheel event before travel settles on a frame.
const SNAP_DELAY = 140
// A pause in wheel events longer than this (ms) starts a new gesture. Only a
// gesture that begins at an end, pushing outward, passes through to the page —
// so the tail of a fling that runs into the end stops there instead of carrying
// on to scroll the page out from under it.
const GESTURE_GAP = 200
// Pointer travel (px) past which a press is a drag, not a click.
const CLICK_SLOP = 6

const clampPosition = (v: number) => Math.min(LAST, Math.max(0, v))

/** Grid ground behind the tube, pushed toward the viewer under the pointer. */
function GridPlane({ centerUv }: { centerUv: React.RefObject<Vector2> }) {
  const meshRef = useRef<Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uGridScale: { value: 28.0 },
      uLineWidth: { value: 0.5 },
      uEdgeWidth: { value: 0.14 },
      uEdgeAmp: { value: 1.35 },
      uCenterRadius: { value: 0.22 },
      uCenterAmp: { value: 0.9 },
      uCenter: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uScrollSpeed: { value: 0.01 },
      // Mixed as display (sRGB) values, the way the reference draws its lines:
      // a tenth of the ink over the page ground, faint enough to sit back.
      uBase: { value: new Color(BG).convertLinearToSRGB() },
      uLine: { value: new Color(INK).convertLinearToSRGB() },
      uLineMix: { value: 0.1 },
    }),
    [],
  )

  useFrame((state) => {
    const material = meshRef.current?.material as ShaderMaterial | undefined
    if (!material) return
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    ;(material.uniforms.uCenter.value as Vector2).lerp(centerUv.current, 0.08)
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -5.2]}>
      <planeGeometry args={[18, 18, 256, 256]} />
      <shaderMaterial
        uniforms={uniforms}
        side={DoubleSide}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          uniform float uEdgeWidth;
          uniform float uEdgeAmp;
          uniform float uCenterRadius;
          uniform float uCenterAmp;
          uniform vec2 uCenter;

          void main() {
            vUv = uv;
            vec3 p = position;
            float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
            float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth, dEdge);
            float centerMask = 1.0 - smoothstep(0.0, uCenterRadius, distance(vUv, uCenter));
            p.z += edgeMask * uEdgeAmp + centerMask * uCenterAmp;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          uniform float uGridScale;
          uniform float uLineWidth;
          uniform float uTime;
          uniform float uScrollSpeed;
          uniform vec3 uBase;
          uniform vec3 uLine;
          uniform float uLineMix;

          float gridLine(float coord, float width) {
            float fw = fwidth(coord);
            float p = abs(fract(coord - 0.5) - 0.5);
            return 1.0 - smoothstep(width * fw, (width + 1.0) * fw, p);
          }

          void main() {
            vec2 uv = (vUv + vec2(uTime * uScrollSpeed, 0.0)) * uGridScale;
            float g = max(gridLine(uv.x, uLineWidth), gridLine(uv.y, uLineWidth));
            gl_FragColor = vec4(mix(uBase, uLine, g * uLineMix), 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Tube({
  positionRef,
  pointerInsideRef,
  ease,
  onFront,
  onHover,
  onLeave,
  onOpen,
}: {
  positionRef: React.RefObject<number>
  pointerInsideRef: React.RefObject<boolean>
  ease: number
  onFront: (index: number) => void
  onHover: (project: TubeProject) => void
  onLeave: () => void
  onOpen: (project: TubeProject) => void
}) {
  const groupRef = useRef<Object3D>(null)
  const current = useRef(0)
  const front = useRef(-1)

  const textures = useLoader(TextureLoader, TEXTURE_URLS)
  // One material per frame, cropped to the tile cover-style so nothing
  // stretches. The camera sits outside the ring, so the near tiles are seen
  // from behind and the far ones from the front — the shader flips whichever
  // face is turned away, and every frame reads the right way round.
  const materials = useMemo(
    () =>
      textures.map((t) => {
        t.colorSpace = SRGBColorSpace
        const { width, height } = t.image as { width: number; height: number }
        const aspect = width / height
        const repeat = new Vector2(1, 1)
        const offset = new Vector2(0, 0)
        if (aspect > TILE_ASPECT) {
          repeat.x = TILE_ASPECT / aspect
          offset.x = (1 - repeat.x) / 2
        } else {
          repeat.y = aspect / TILE_ASPECT
          offset.y = (1 - repeat.y) / 2
        }
        return new ShaderMaterial({
          uniforms: {
            uMap: { value: t },
            uRepeat: { value: repeat },
            uOffset: { value: offset },
          },
          side: DoubleSide,
          vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform sampler2D uMap;
            uniform vec2 uRepeat;
            uniform vec2 uOffset;
            varying vec2 vUv;
            void main() {
              vec2 uv = vUv;
              if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
              gl_FragColor = texture2D(uMap, uv * uRepeat + uOffset);
              #include <colorspace_fragment>
            }
          `,
        })
      }),
    [textures],
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  useFrame((state, dt) => {
    // Frames move under a still pointer, and R3F only raycasts when the pointer
    // does — so re-hit-test every frame while it is over the tube, keeping the
    // label on whatever is actually under it.
    if (pointerInsideRef.current) state.events.update?.()

    const target = positionRef.current
    const k = 1 - Math.pow(1 - ease, dt * 60)
    current.current += (target - current.current) * k
    if (Math.abs(target - current.current) < 1e-4) current.current = target

    // Turn and lift the spiral together so the frame at the current position
    // sits at the front, level with the eye.
    const group = groupRef.current
    if (!group) return
    group.rotation.y = -current.current * STEP_ANGLE - Math.PI / 2
    group.position.y = current.current * STEP_DROP

    const nearest = Math.round(current.current)
    if (nearest !== front.current) {
      front.current = nearest
      onFront(nearest)
    }
  })

  return (
    <group ref={groupRef}>
      {FRAMES.map((project, i) => {
        // Each frame a step further round and a step lower, so the next one
        // waits just right of and below the one at the front.
        const theta = -i * STEP_ANGLE
        return (
          <mesh
            key={i}
            position={[Math.cos(theta) * RADIUS, -i * STEP_DROP, Math.sin(theta) * RADIUS]}
            rotation={[0, -(theta + Math.PI / 2), 0]}
            material={materials[i]}
            onPointerOver={(e) => {
              e.stopPropagation()
              onHover(project)
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              onLeave()
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (e.delta > CLICK_SLOP) return
              onOpen(project)
            }}
          >
            <planeGeometry args={[TILE_W, TILE_H]} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Fires once the textures have resolved, so the field can fade in whole. */
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}

export function ProjectTube() {
  const router = useRouter()
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  const centerUv = useRef(new Vector2(0.5, 0.5))
  // Where along the spiral the tube is headed, in frames: 0 is the first
  // project's cover, LAST the last project's final frame.
  const positionRef = useRef(0)
  const snapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastWheel = useRef(0)
  const passing = useRef(false)
  const drag = useRef<{ x: number; y: number; from: number } | null>(null)
  const pointerInsideRef = useRef(false)

  const [hovered, setHovered] = useState<TubeProject | null>(null)
  const [frontIndex, setFrontIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])
  const frontFrame = FRAMES[frontIndex]

  // The label trails the pointer on its own easing, written straight to the
  // DOM so following the cursor never costs a render.
  const tipTarget = useRef({ x: 0, y: 0 })
  const tipCurrent = useRef({ x: 0, y: 0 })
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = tipRef.current
      if (el) {
        tipCurrent.current.x += (tipTarget.current.x - tipCurrent.current.x) * 0.18
        tipCurrent.current.y += (tipTarget.current.y - tipCurrent.current.y) * 0.18
        el.style.transform = `translate3d(${tipCurrent.current.x + 14}px, ${tipCurrent.current.y - 22}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // The wheel travels the spiral while the pointer is over it — vertical and
  // horizontal alike, whichever the gesture leans on — and settles on a frame
  // once it goes quiet. Bound natively (React's wheel listener is passive, so it
  // can't cancel the page scroll), and the root carries data-lenis-prevent so
  // Lenis leaves it alone too. Pushing on past either end, once the spiral has
  // stopped there, lets the page have the wheel back.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const unit = e.deltaMode === 1 ? 16 : 1
      const d =
        (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit
      if (!d) return
      const from = positionRef.current
      const to = clampPosition(from + d / WHEEL_PX_PER_FRAME)
      const now = performance.now()
      if (now - lastWheel.current > GESTURE_GAP) passing.current = to === from
      lastWheel.current = now
      if (passing.current) return
      e.preventDefault()
      positionRef.current = to
      clearTimeout(snapTimer.current)
      snapTimer.current = setTimeout(() => {
        positionRef.current = Math.round(positionRef.current)
      }, SNAP_DELAY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(snapTimer.current)
    }
  }, [])

  const onFront = useCallback((index: number) => setFrontIndex(index), [])
  const onHover = useCallback((project: TubeProject) => {
    setHovered(project)
    tipCurrent.current = { ...tipTarget.current }
  }, [])
  const onLeave = useCallback(() => setHovered(null), [])
  const onOpen = useCallback(
    (project: TubeProject) => router.push(`/work/${project.slug}`),
    [router],
  )

  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    positionRef.current = Math.round(positionRef.current)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    tipTarget.current = { x, y }
    pointerInsideRef.current = true

    const u = Math.min(1, Math.max(0, x / rect.width))
    const v = 1 - Math.min(1, Math.max(0, y / rect.height))
    centerUv.current.set(0.5 + (u - 0.5) * 0.4, 0.5 + (v - 0.5) * 0.4)

    // Dragging pulls the spiral along under the pointer: up or left brings the
    // next frames in, down or right takes it back.
    if (drag.current) {
      const dx = e.clientX - drag.current.x
      const dy = e.clientY - drag.current.y
      const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx
      positionRef.current = clampPosition(drag.current.from - d / DRAG_PX_PER_FRAME)
    }
  }

  return (
    <div
      ref={rootRef}
      data-lenis-prevent
      className="project-tube"
      onPointerMove={onPointerMove}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, from: positionRef.current }
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => {
        pointerInsideRef.current = true
      }}
      onPointerLeave={() => {
        pointerInsideRef.current = false
        endDrag()
        centerUv.current.set(0.5, 0.5)
        onLeave()
      }}
      style={{ cursor: hovered ? 'pointer' : 'default' }}
    >
      <div className="project-tube-canvas" style={{ opacity: ready ? 1 : 0 }}>
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 50 }}
          dpr={[1, 2]}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <Suspense fallback={null}>
            <GridPlane centerUv={centerUv} />
            <Tube
              positionRef={positionRef}
              pointerInsideRef={pointerInsideRef}
              ease={reduce ? 1 : 0.1}
              onFront={onFront}
              onHover={onHover}
              onLeave={onLeave}
              onOpen={onOpen}
            />
            <Ready onReady={markReady} />
          </Suspense>
        </Canvas>
      </div>

      <div className="project-tube-vignette" aria-hidden />

      <div
        ref={tipRef}
        className="project-tube-tip font-mono"
        aria-hidden
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {hovered?.title}
      </div>

      {/* Where the spiral stands: the project at the front, counted against
          the whole index, on the fold's line. */}
      <div
        className="project-tube-caption font-mono"
        aria-hidden
        style={{ opacity: ready ? 1 : 0 }}
      >
        <span className="project-tube-count">
          {String(frontFrame.number).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
        </span>
        <Link href={`/work/${frontFrame.slug}`} tabIndex={-1}>
          {frontFrame.title}
        </Link>
      </div>

      {/* The canvas is pointer-only; the same work as plain links for
          keyboards and screen readers. */}
      <ul className="sr-only">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>

      <style>{`
        .project-tube {
          position: absolute;
          inset: 0;
          overflow: hidden;
          touch-action: none;
          user-select: none;
        }
        .project-tube-canvas {
          position: absolute;
          inset: 0;
          transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);
          /* The tube fills the first screen from the header band down to the
             fold, and fades out at both rather than ending on a hard line. */
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent);
          mask-image: linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent);
        }
        .project-tube-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, ${BG} 100%);
        }
        .project-tube-tip {
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
          padding: 7px 10px;
          background: ${BG}d9;
          color: ${INK};
          border: 1px solid ${INK}33;
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity 150ms linear;
          will-change: transform;
        }
        .project-tube-caption {
          position: absolute;
          left: var(--edge, 1.5rem);
          bottom: var(--edge, 1.5rem);
          display: flex;
          align-items: baseline;
          gap: 14px;
          color: ${INK};
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .project-tube-count {
          opacity: 0.55;
          font-variant-numeric: tabular-nums;
        }
        .project-tube-caption a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}
