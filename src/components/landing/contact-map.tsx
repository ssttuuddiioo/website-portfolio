'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { BLUE, BG } from './landing-theme'

// DUMBO, Brooklyn.
const CENTER: [number, number] = [-73.9899, 40.7033]
// The river — same blue as the cursor trail (theme BLUE).
const RIVER = BLUE

/**
 * Live map of the studio's corner of Brooklyn (DUMBO) with a dropped pin.
 * Uses MapLibre GL + OpenFreeMap vector tiles — open source, no API key,
 * no watermark, no usage limits. "Positron" is the minimal light style.
 */
export function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: CENTER,
      zoom: 13,
      attributionControl: { compact: true },
      // Keep it a quiet object, not an interactive toy.
      cooperativeGestures: true,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    // Restyle: cobalt river, warm land to match the site background.
    map.on('load', () => {
      for (const layer of map.getStyle().layers ?? []) {
        const id = layer.id.toLowerCase()
        if (layer.type === 'background') {
          map.setPaintProperty(layer.id, 'background-color', BG)
        } else if (id.includes('water')) {
          if (layer.type === 'fill') {
            map.setPaintProperty(layer.id, 'fill-color', RIVER)
          } else if (layer.type === 'line') {
            map.setPaintProperty(layer.id, 'line-color', RIVER)
          }
        }
      }
    })

    // Custom blue teardrop marker to match the brand pin.
    const el = document.createElement('div')
    el.innerHTML = `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" aria-hidden="true">
        <path d="M14 0 C21.7 0 28 6.3 28 14 C28 24 14 36 14 36 C14 36 0 24 0 14 C0 6.3 6.3 0 14 0 Z" fill="${BLUE}"/>
        <circle cx="14" cy="14" r="5" fill="#fff"/>
      </svg>`
    el.style.cssText = 'cursor:default;transform:translateY(-2px)'

    new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(CENTER)
      .addTo(map)

    return () => map.remove()
  }, [])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of DUMBO, Brooklyn, where Studio Studio is located"
      style={{
        width: '100%',
        // Cropped from square into a rectangle (~100px shorter at column width).
        aspectRatio: '5 / 4',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(10,10,10,0.12)',
      }}
    />
  )
}
