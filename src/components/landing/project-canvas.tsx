'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  type MeshBasicMaterial,
  PlaneGeometry,
  type Raycaster,
  SRGBColorSpace,
  type Intersection,
  type Texture,
  TextureLoader,
  Vector3,
} from 'three'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { IMAGE_SIZES } from '@/lib/landing-image-sizes'
import { BG, INK } from './landing-theme'

/*
 * The index as an infinite canvas: every frame of every project scattered
 * through an endless field of space. Drag pans across it, the wheel (or a
 * pinch) flies forward and back, WASD and the arrows steer; frames fade in out
 * of the fog as you near them. Hovering names the project, clicking opens it.
 *
 * Adapted from Edoardo Lunardi's Infinite Canvas for Codrops
 * (github.com/edoardolunardi/infinite-canvas, MIT): the same chunked field,
 * generated around the camera and culled behind it, set on the page ground
 * and wired to the work instead of a museum collection. The drei helpers it
 * leaned on are replaced with a few lines, so it brings no new dependency.
 */

type Frame = { slug: string; title: string; url: string; aspect: number }

// Every frame of every project — the cover, the page's own hero and its
// gallery — each one opening its own project.
const FRAMES: Frame[] = LANDING_PROJECTS.flatMap((p) => {
  if (!p.slug) return []
  const srcs = Array.from(
    new Set([p.image, p.pageHero, ...(p.images ?? [])].filter(Boolean)),
  ) as string[]
  return srcs.map((src) => {
    const [w, h] = IMAGE_SIZES[src] ?? [3, 2]
    return {
      slug: p.slug!,
      title: p.title,
      // Through Next's optimizer at a fixed width: the originals run to 2000px,
      // and the field never draws a frame much past 600.
      url: `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`,
      aspect: w / h,
    }
  })
})

const PROJECTS = LANDING_PROJECTS.flatMap((p) =>
  p.slug ? [{ slug: p.slug, title: p.title }] : [],
)

/* ---- the field ---------------------------------------------------------- */

const CHUNK_SIZE = 110
const ITEMS_PER_CHUNK = 5
const RENDER_DISTANCE = 2
const CHUNK_FADE_MARGIN = 1
const MAX_VELOCITY = 3.2
const DEPTH_FADE_START = 140
const DEPTH_FADE_END = 260
const INVIS_THRESHOLD = 0.01
const KEYBOARD_SPEED = 0.18
const VELOCITY_LERP = 0.16
const VELOCITY_DECAY = 0.9
const INITIAL_CAMERA_Z = 50
// Pointer travel (px) past which a press is a drag, not a click.
const CLICK_SLOP = 6

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}
const hashString = (str: string) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Every chunk around the camera's, out to the fade margin. */
const CHUNK_OFFSETS = (() => {
  const max = RENDER_DISTANCE + CHUNK_FADE_MARGIN
  const offsets: { dx: number; dy: number; dz: number }[] = []
  for (let dx = -max; dx <= max; dx++)
    for (let dy = -max; dy <= max; dy++)
      for (let dz = -max; dz <= max; dz++) offsets.push({ dx, dy, dz })
  return offsets
})()

type Plane = { id: string; position: Vector3; height: number; frame: number }

// Deterministic per chunk, so flying away and back finds the same frames in
// the same places. Least-recently-used, capped so a long flight can't grow it.
const planeCache = new Map<string, Plane[]>()
function chunkPlanes(cx: number, cy: number, cz: number): Plane[] {
  const key = `${cx},${cy},${cz}`
  const hit = planeCache.get(key)
  if (hit) {
    planeCache.delete(key)
    planeCache.set(key, hit)
    return hit
  }
  const seed = hashString(key)
  const planes: Plane[] = []
  for (let i = 0; i < ITEMS_PER_CHUNK; i++) {
    const r = (n: number) => seededRandom(seed + i * 1000 + n)
    planes.push({
      id: `${key}-${i}`,
      position: new Vector3(
        (cx + r(0)) * CHUNK_SIZE,
        (cy + r(1)) * CHUNK_SIZE,
        (cz + r(2)) * CHUNK_SIZE,
      ),
      height: 12 + r(4) * 8,
      frame: Math.floor(r(5) * 1_000_000) % FRAMES.length,
    })
  }
  planeCache.set(key, planes)
  while (planeCache.size > 256) {
    const oldest = planeCache.keys().next().value
    if (oldest === undefined) break
    planeCache.delete(oldest)
  }
  return planes
}

/* ---- textures ----------------------------------------------------------- */

// Shared across planes and across visits: the same frame recurs all over the
// field, and opening the index again shouldn't fetch it again.
const textureCache = new Map<string, Texture>()
const textureWaiters = new Map<string, Set<(t: Texture) => void>>()
let loader: TextureLoader | null = null

function loadTexture(url: string, onLoad: (t: Texture) => void) {
  const cached = textureCache.get(url)
  if (cached) {
    const img = cached.image as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth > 0) onLoad(cached)
    else textureWaiters.get(url)?.add(onLoad)
    return
  }
  textureWaiters.set(url, new Set([onLoad]))
  loader ??= new TextureLoader()
  const tex = loader.load(url, (t) => {
    t.minFilter = LinearMipmapLinearFilter
    t.magFilter = LinearFilter
    t.generateMipmaps = true
    t.anisotropy = 4
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    textureWaiters.get(url)?.forEach((cb) => cb(t))
    textureWaiters.delete(url)
  })
  textureCache.set(url, tex)
}

/* ---- scene -------------------------------------------------------------- */

const PLANE_GEOMETRY = new PlaneGeometry(1, 1)

type CameraGrid = { cx: number; cy: number; cz: number; camZ: number }

type Handlers = {
  onHover: (frame: Frame) => void
  onLeave: () => void
  onOpen: (frame: Frame) => void
}

function FramePlane({
  plane,
  chunk,
  cameraGrid,
  handlers,
}: {
  plane: Plane
  chunk: { cx: number; cy: number; cz: number }
  cameraGrid: React.RefObject<CameraGrid>
  handlers: Handlers
}) {
  const frame = FRAMES[plane.frame]
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const opacity = useRef(0)
  const tick = useRef(0)
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let live = true
    loadTexture(frame.url, (t) => live && setTexture(t))
    return () => {
      live = false
    }
  }, [frame.url])

  // Fades with distance from the camera — out past the edge of the generated
  // chunks, and into the fog with depth — so the field never shows an edge.
  useFrame(() => {
    const material = materialRef.current
    const mesh = meshRef.current
    if (!material || !mesh) return

    // Planes already gone only need checking every other frame.
    tick.current = (tick.current + 1) & 1
    if (opacity.current < INVIS_THRESHOLD && !mesh.visible && tick.current === 0)
      return

    const cam = cameraGrid.current
    const dist = Math.max(
      Math.abs(chunk.cx - cam.cx),
      Math.abs(chunk.cy - cam.cy),
      Math.abs(chunk.cz - cam.cz),
    )
    const depth = Math.abs(plane.position.z - cam.camZ)
    if (depth > DEPTH_FADE_END + 50) {
      opacity.current = 0
      material.opacity = 0
      material.depthWrite = false
      mesh.visible = false
      return
    }

    const gridFade =
      dist <= RENDER_DISTANCE
        ? 1
        : Math.max(0, 1 - (dist - RENDER_DISTANCE) / CHUNK_FADE_MARGIN)
    const depthFade =
      depth <= DEPTH_FADE_START
        ? 1
        : Math.max(
            0,
            1 - (depth - DEPTH_FADE_START) / (DEPTH_FADE_END - DEPTH_FADE_START),
          )
    const target = Math.min(gridFade, depthFade * depthFade)
    opacity.current =
      target < INVIS_THRESHOLD && opacity.current < INVIS_THRESHOLD
        ? 0
        : lerp(opacity.current, target, 0.18)

    const solid = opacity.current > 0.99
    material.opacity = solid ? 1 : opacity.current
    material.depthWrite = solid
    mesh.visible = opacity.current > INVIS_THRESHOLD
  })

  // Faded frames are still in the scene, and a raycaster doesn't care whether
  // a mesh is visible — so only a frame you can actually see takes the pointer.
  const raycast = useCallback((raycaster: Raycaster, hits: Intersection[]) => {
    const mesh = meshRef.current
    if (!mesh?.visible || opacity.current < 0.5) return
    Mesh.prototype.raycast.call(mesh, raycaster, hits)
  }, [])

  if (!texture) return null

  return (
    <mesh
      ref={meshRef}
      position={plane.position}
      scale={[plane.height * frame.aspect, plane.height, 1]}
      geometry={PLANE_GEOMETRY}
      visible={false}
      raycast={raycast}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        handlers.onHover(frame)
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        handlers.onLeave()
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (e.delta > CLICK_SLOP) return
        handlers.onOpen(frame)
      }}
    >
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        side={DoubleSide}
      />
    </mesh>
  )
}

function Chunk({
  cx,
  cy,
  cz,
  cameraGrid,
  handlers,
}: {
  cx: number
  cy: number
  cz: number
  cameraGrid: React.RefObject<CameraGrid>
  handlers: Handlers
}) {
  const [planes, setPlanes] = useState<Plane[] | null>(null)

  // Generated off the critical path, so a burst of new chunks while flying
  // doesn't stall the frame that crossed into them.
  useEffect(() => {
    let live = true
    const run = () => live && setPlanes(chunkPlanes(cx, cy, cz))
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 100 })
      return () => {
        live = false
        cancelIdleCallback(id)
      }
    }
    const id = setTimeout(run, 0)
    return () => {
      live = false
      clearTimeout(id)
    }
  }, [cx, cy, cz])

  const chunk = useMemo(() => ({ cx, cy, cz }), [cx, cy, cz])
  if (!planes) return null
  return (
    <group>
      {planes.map((plane) => (
        <FramePlane
          key={plane.id}
          plane={plane}
          chunk={chunk}
          cameraGrid={cameraGrid}
          handlers={handlers}
        />
      ))}
    </group>
  )
}

const chunksAround = (cx: number, cy: number, cz: number) =>
  CHUNK_OFFSETS.map((o) => ({
    key: `${cx + o.dx},${cy + o.dy},${cz + o.dz}`,
    cx: cx + o.dx,
    cy: cy + o.dy,
    cz: cz + o.dz,
  }))

const KEYS: Record<string, keyof Steer> = {
  w: 'forward',
  arrowup: 'forward',
  s: 'backward',
  arrowdown: 'backward',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
  e: 'up',
  q: 'down',
}
type Steer = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

function Field({
  reduce,
  pointerInside,
  handlers,
}: {
  reduce: boolean
  pointerInside: React.RefObject<boolean>
  handlers: Handlers
}) {
  const { camera, gl } = useThree()
  const cameraGrid = useRef<CameraGrid>({ cx: 0, cy: 0, cz: 0, camZ: INITIAL_CAMERA_Z })
  const [chunks, setChunks] = useState(() => chunksAround(0, 0, 0))

  const s = useRef({
    velocity: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    base: { x: 0, y: 0, z: INITIAL_CAMERA_Z },
    drift: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    lastMouse: { x: 0, y: 0 },
    scroll: 0,
    dragging: false,
    touches: [] as Touch[],
    pinch: 0,
    chunkKey: '0,0,0',
    pending: null as { cx: number; cy: number; cz: number } | null,
    lastChunkUpdate: 0,
    steer: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    } as Steer,
  })
  const touch = useMemo(
    () =>
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    [],
  )

  useEffect(() => {
    const canvas = gl.domElement
    const st = s.current

    const pinchDistance = (t: Touch[]) =>
      t.length < 2
        ? 0
        : Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    const onMouseDown = (e: MouseEvent) => {
      st.dragging = true
      st.lastMouse = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => {
      st.dragging = false
    }
    const onMouseLeave = () => {
      st.mouse = { x: 0, y: 0 }
      st.dragging = false
    }
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      st.mouse = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      }
      if (st.dragging) {
        st.target.x -= (e.clientX - st.lastMouse.x) * 0.025
        st.target.y += (e.clientY - st.lastMouse.y) * 0.025
        st.lastMouse = { x: e.clientX, y: e.clientY }
      }
    }
    // The wheel is the flight, so it never reaches the page while the field
    // is up: the root carries data-lenis-prevent, and this cancels the native
    // scroll. The grid mark (or Escape) is the way back out.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : 1
      st.scroll += e.deltaY * unit * 0.006
    }
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      st.touches = Array.from(e.touches)
      st.pinch = pinchDistance(st.touches)
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const t = Array.from(e.touches)
      if (t.length === 1 && st.touches.length >= 1) {
        st.target.x -= (t[0].clientX - st.touches[0].clientX) * 0.02
        st.target.y += (t[0].clientY - st.touches[0].clientY) * 0.02
      } else if (t.length === 2 && st.pinch > 0) {
        const d = pinchDistance(t)
        st.scroll += (st.pinch - d) * 0.006
        st.pinch = d
      }
      st.touches = t
    }
    const onTouchEnd = (e: TouchEvent) => {
      st.touches = Array.from(e.touches)
      st.pinch = pinchDistance(st.touches)
    }
    // Arrows would otherwise scroll the page under the field.
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const dir = KEYS[e.key.toLowerCase()]
      if (!dir) return
      if (e.key.startsWith('Arrow')) e.preventDefault()
      st.steer[dir] = down
    }
    const onKeyDown = onKey(true)
    const onKeyUp = onKey(false)

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [gl])

  useFrame((state) => {
    const st = s.current
    const now = performance.now()

    const { forward, backward, left, right, up, down } = st.steer
    if (forward) st.target.z -= KEYBOARD_SPEED
    if (backward) st.target.z += KEYBOARD_SPEED
    if (left) st.target.x -= KEYBOARD_SPEED
    if (right) st.target.x += KEYBOARD_SPEED
    if (down) st.target.y -= KEYBOARD_SPEED
    if (up) st.target.y += KEYBOARD_SPEED

    // The camera leans toward the pointer — the field's parallax. Held still
    // through a drag, absent on touch, and off for reduced motion.
    const zooming = Math.abs(st.velocity.z) > 0.05
    const driftAmount = reduce ? 0 : 8 * clamp(st.base.z / 50, 0.3, 2)
    const driftLerp = zooming ? 0.2 : 0.12
    if (!st.dragging) {
      const aim = touch ? { x: 0, y: 0 } : st.mouse
      st.drift.x = lerp(st.drift.x, aim.x * driftAmount, driftLerp)
      st.drift.y = lerp(st.drift.y, aim.y * driftAmount, driftLerp)
    }

    st.target.z += st.scroll
    st.scroll *= 0.8

    st.target.x = clamp(st.target.x, -MAX_VELOCITY, MAX_VELOCITY)
    st.target.y = clamp(st.target.y, -MAX_VELOCITY, MAX_VELOCITY)
    st.target.z = clamp(st.target.z, -MAX_VELOCITY, MAX_VELOCITY)
    st.velocity.x = lerp(st.velocity.x, st.target.x, VELOCITY_LERP)
    st.velocity.y = lerp(st.velocity.y, st.target.y, VELOCITY_LERP)
    st.velocity.z = lerp(st.velocity.z, st.target.z, VELOCITY_LERP)
    st.base.x += st.velocity.x
    st.base.y += st.velocity.y
    st.base.z += st.velocity.z
    camera.position.set(st.base.x + st.drift.x, st.base.y + st.drift.y, st.base.z)
    st.target.x *= VELOCITY_DECAY
    st.target.y *= VELOCITY_DECAY
    st.target.z *= VELOCITY_DECAY

    // Frames move under a still pointer, and R3F only raycasts when the
    // pointer does — so re-hit-test while it's over the field, keeping the
    // label on whatever is actually under it.
    if (pointerInside.current) state.events.update?.()

    const cx = Math.floor(st.base.x / CHUNK_SIZE)
    const cy = Math.floor(st.base.y / CHUNK_SIZE)
    const cz = Math.floor(st.base.z / CHUNK_SIZE)
    cameraGrid.current = { cx, cy, cz, camZ: st.base.z }

    const key = `${cx},${cy},${cz}`
    if (key !== st.chunkKey) {
      st.pending = { cx, cy, cz }
      st.chunkKey = key
    }
    // Rebuilding the chunk set is a React update, so it's throttled — harder
    // the faster the flight, when the set would only churn.
    const speed = Math.abs(st.velocity.z)
    const throttle = speed > 1 ? 500 : zooming ? 400 : 100
    if (st.pending && now - st.lastChunkUpdate >= throttle) {
      const { cx: px, cy: py, cz: pz } = st.pending
      st.pending = null
      st.lastChunkUpdate = now
      setChunks(chunksAround(px, py, pz))
    }
  })

  return (
    <>
      {chunks.map((c) => (
        <Chunk
          key={c.key}
          cx={c.cx}
          cy={c.cy}
          cz={c.cz}
          cameraGrid={cameraGrid}
          handlers={handlers}
        />
      ))}
    </>
  )
}

/* ---- page --------------------------------------------------------------- */

export function ProjectCanvas() {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const tipRef = useRef<HTMLDivElement>(null)
  const pointerInside = useRef(false)
  const [hovered, setHovered] = useState<Frame | null>(null)
  const [dpr] = useState(() =>
    typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
  )

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

  const handlers = useMemo<Handlers>(
    () => ({
      onHover: (frame) => {
        setHovered(frame)
        tipCurrent.current = { ...tipTarget.current }
      },
      onLeave: () => setHovered(null),
      onOpen: (frame) => router.push(`/work/${frame.slug}`),
    }),
    [router],
  )

  return (
    <div
      data-lenis-prevent
      className="project-canvas"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        tipTarget.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        pointerInside.current = true
      }}
      onPointerEnter={() => {
        pointerInside.current = true
      }}
      onPointerLeave={() => {
        pointerInside.current = false
        setHovered(null)
      }}
    >
      <div className={hovered ? 'project-canvas-gl is-hover' : 'project-canvas-gl'}>
        <Canvas
          camera={{ position: [0, 0, INITIAL_CAMERA_Z], fov: 60, near: 1, far: 500 }}
          dpr={dpr}
          flat
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={[BG]} />
          <fog attach="fog" args={[BG, 120, 320]} />
          <Field reduce={reduce} pointerInside={pointerInside} handlers={handlers} />
        </Canvas>
      </div>

      <div className="project-canvas-vignette" aria-hidden />

      <div
        ref={tipRef}
        className="project-canvas-tip font-mono"
        aria-hidden
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {hovered?.title}
      </div>

      <div className="project-canvas-hint font-mono" aria-hidden>
        Drag to move · Scroll to fly
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
        .project-canvas {
          position: absolute;
          inset: 0;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          background: ${BG};
        }
        .project-canvas-gl {
          position: absolute;
          inset: 0;
          /* The field fills the first screen from the header band down to the
             fold, and fades out at both rather than ending on a hard line. */
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent);
        }
        /* The field is dragged; over a frame it's a link. */
        .project-canvas-gl canvas { cursor: grab; }
        .project-canvas-gl canvas:active { cursor: grabbing; }
        .project-canvas-gl.is-hover canvas { cursor: pointer; }
        .project-canvas-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 60%, ${BG} 100%);
        }
        .project-canvas-tip {
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
        .project-canvas-hint {
          position: absolute;
          left: var(--edge, 1.5rem);
          bottom: var(--edge, 1.5rem);
          pointer-events: none;
          color: ${INK};
          opacity: 0.5;
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
