import { useState, useEffect, useRef, useMemo, type FC, type MouseEvent, type WheelEvent } from 'react'
import { geoOrthographic, geoPath, geoGraticule10, geoDistance, type GeoProjection, type GeoPermissibleObjects } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { OrbitEvent, FilterState } from '../../types/orbit'

interface OrbitMapProps {
  events: OrbitEvent[]
  selectedEvent: OrbitEvent | null
  onSelectEvent: (event: OrbitEvent) => void
  projectionMode: FilterState['projectionMode']
  zoomLevel: number
  onZoomChange: (delta: number) => void
  onResetCamera: () => void
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  elevated: '#f59e0b',
  normal: '#10b981',
  info: '#3b82f6',
}

const DOMAIN_ICONS: Record<string, string> = {
  geopolitical: '🌐',
  healthcare: '🩺',
  environmental: '🌿',
  disasters: '⚠️',
  emerging: '📡',
  cross_domain: '🔀',
}

// Pre-computed deterministic star field (percent-based positions)
const STARS = Array.from({ length: 220 }, (_, i) => {
  const rnd = (n: number) => {
    const x = Math.sin((i + 1) * n) * 10000
    return x - Math.floor(x)
  }
  return { x: rnd(12.9898), y: rnd(78.233), r: rnd(43.11) * 1.3 + 0.2, a: rnd(93.77) * 0.6 + 0.2 }
})

// Shared world land / borders geometry loaded once from bundled topojson
let worldCache: { land: GeoPermissibleObjects; borders: GeoPermissibleObjects } | null = null

function useWorldData() {
  const [world, setWorld] = useState(worldCache)
  useEffect(() => {
    if (worldCache) return
    let alive = true
    fetch('/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        const land = feature(topo, topo.objects.countries) as unknown as GeoPermissibleObjects
        const borders = mesh(topo, topo.objects.countries, (a: unknown, b: unknown) => a !== b) as unknown as GeoPermissibleObjects
        worldCache = { land, borders }
        if (alive) setWorld(worldCache)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return world
}

export const OrbitMap: FC<OrbitMapProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  projectionMode,
  zoomLevel,
  onZoomChange,
  onResetCamera,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const world = useWorldData()

  // Map state
  const [centerLon, setCenterLon] = useState(15)
  const [centerLat, setCenterLat] = useState(20)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredEvent, setHoveredEvent] = useState<OrbitEvent | null>(null)
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Track viewport size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Orthographic projection for the 3D globe
  const projection = useMemo<GeoProjection | null>(() => {
    if (projectionMode !== '3d' || !size.width || !size.height) return null
    const radius = Math.min(size.width, size.height) * 0.42 * zoomLevel
    return geoOrthographic()
      .scale(radius)
      .translate([size.width / 2, size.height / 2])
      .rotate([-centerLon, -centerLat])
      .clipAngle(90)
  }, [projectionMode, size, zoomLevel, centerLon, centerLat])

  // Center on selected event if changed
  useEffect(() => {
    if (selectedEvent) {
      setCenterLon(selectedEvent.longitude)
      setCenterLat(selectedEvent.latitude)
    }
  }, [selectedEvent])

  // Mouse handlers for dragging pan / rotation
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (projectionMode === '2d') {
      const lon = ((x / rect.width) * 360 - 180) / zoomLevel + centerLon
      const lat = (90 - (y / rect.height) * 180) / zoomLevel + centerLat
      setMouseCoords({ lat: Math.max(-90, Math.min(90, lat)), lon: ((lon + 180) % 360) - 180 })
    } else if (projection) {
      const inv = projection.invert?.([x, y])
      if (inv) setMouseCoords({ lat: inv[1], lon: inv[0] })
    }

    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setDragStart({ x: e.clientX, y: e.clientY })

    if (projectionMode === '3d') {
      // Rotate globe
      setCenterLon((prev) => ((prev - dx * 0.4 + 180) % 360) - 180)
      setCenterLat((prev) => Math.max(-85, Math.min(85, prev + dy * 0.4)))
    } else {
      // Pan 2D map
      setCenterLon((prev) => prev - dx / (rect.width * 0.005) / zoomLevel)
      setCenterLat((prev) => Math.max(-85, Math.min(85, prev + dy / (rect.height * 0.005) / zoomLevel)))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    onZoomChange(e.deltaY < 0 ? 0.2 : -0.2)
  }

  // Draw the tactical globe / 2D grid
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = size
    if (!width || !height) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Deep-space star field backdrop
    for (const s of STARS) {
      ctx.globalAlpha = s.a
      ctx.fillStyle = '#9fd8ff'
      ctx.beginPath()
      ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (projectionMode === '3d' && projection) {
      const path = geoPath(projection, ctx)
      const cx = width / 2
      const cy = height / 2
      const radius = projection.scale()

      // Atmospheric outer glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.22)
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.35)')
      glow.addColorStop(0.5, 'rgba(14, 116, 200, 0.12)')
      glow.addColorStop(1, 'rgba(8, 47, 90, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2)
      ctx.fill()

      // Ocean sphere with sunlit shading (light from upper-left)
      const ocean = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.4,
        radius * 0.15,
        cx,
        cy,
        radius,
      )
      ocean.addColorStop(0, '#1c4a70')
      ocean.addColorStop(0.5, '#0e2c49')
      ocean.addColorStop(1, '#05121f')
      const sphere = { type: 'Sphere' } as unknown as GeoPermissibleObjects
      ctx.beginPath()
      path(sphere)
      ctx.fillStyle = ocean
      ctx.fill()

      // Graticule
      ctx.beginPath()
      path(geoGraticule10())
      ctx.strokeStyle = 'rgba(96, 189, 240, 0.12)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Land masses
      if (world) {
        ctx.beginPath()
        path(world.land)
        const landGrad = ctx.createRadialGradient(
          cx - radius * 0.35,
          cy - radius * 0.4,
          radius * 0.1,
          cx,
          cy,
          radius,
        )
        landGrad.addColorStop(0, '#2f6a44')
        landGrad.addColorStop(0.55, '#1d4530')
        landGrad.addColorStop(1, '#0c2118')
        ctx.fillStyle = landGrad
        ctx.fill()

        // Country borders
        ctx.beginPath()
        path(world.borders)
        ctx.strokeStyle = 'rgba(120, 214, 168, 0.35)'
        ctx.lineWidth = 0.4
        ctx.stroke()

        // Coastline accent
        ctx.beginPath()
        path(world.land)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Terminator shading — subtle dark limb on lower-right
      const shade = ctx.createRadialGradient(
        cx + radius * 0.45,
        cy + radius * 0.5,
        radius * 0.2,
        cx,
        cy,
        radius * 1.05,
      )
      shade.addColorStop(0, 'rgba(2, 6, 14, 0.55)')
      shade.addColorStop(0.6, 'rgba(2, 6, 14, 0)')
      ctx.beginPath()
      path(sphere)
      ctx.fillStyle = shade
      ctx.fill()

      // Sphere rim
      ctx.beginPath()
      path(sphere)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)'
      ctx.lineWidth = 1.2
      ctx.stroke()
    } else if (projectionMode === '2d') {
      ctx.strokeStyle = 'rgba(31, 41, 61, 0.6)'
      ctx.lineWidth = 0.5

      const step = 40 * zoomLevel
      for (let x = 0; x < width; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      const eqY = height / 2 + (centerLat * height) / 180
      const pmX = width / 2 - (centerLon * width) / 360

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, eqY)
      ctx.lineTo(width, eqY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pmX, 0)
      ctx.lineTo(pmX, height)
      ctx.stroke()
    }
  }, [projection, projectionMode, size, world, centerLon, centerLat, zoomLevel])

  // Calculate marker screen positions
  const getMarkerPos = (lat: number, lon: number) => {
    const { width, height } = size
    if (!width || !height) return { x: -999, y: -999, visible: false }

    if (projectionMode === '3d') {
      if (!projection) return { x: -999, y: -999, visible: false }
      const p = projection([lon, lat])
      if (!p) return { x: -999, y: -999, visible: false }
      const onNearSide = geoDistance([lon, lat], [centerLon, centerLat]) < Math.PI / 2
      return { x: p[0], y: p[1], visible: onNearSide }
    } else {
      const x = ((lon - centerLon + 180) / 360) * width * zoomLevel + (width * (1 - zoomLevel)) / 2
      const y = ((90 - lat - centerLat) / 180) * height * zoomLevel + (height * (1 - zoomLevel)) / 2
      const visible = x >= 0 && x <= width && y >= 0 && y <= height
      return { x, y, visible }
    }
  }

  return (
    <div
      ref={containerRef}
      className="orbit-map-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="orbit-map-canvas-container" />

      {/* Map HUD Overlays */}
      <div className="orbit-map-hud">
        <div className="orbit-hud-card">
          <span className="orbit-hud-label">PROJECTION ENGINE</span>
          <span className="orbit-hud-val">
            {projectionMode === '3d' ? '3D ORTHOGRAPHIC GLOBE' : '2D EQUIRECTANGULAR'}
          </span>
        </div>
        <div className="orbit-hud-card">
          <span className="orbit-hud-label">CENTER LAT / LON</span>
          <span className="orbit-hud-val" style={{ fontSize: '11px' }}>
            {centerLat.toFixed(2)}° N, {centerLon.toFixed(2)}° E
          </span>
        </div>
        {mouseCoords && (
          <div className="orbit-hud-card">
            <span className="orbit-hud-label">CURSOR TARGET</span>
            <span className="orbit-hud-val" style={{ fontSize: '11px', color: '#94a3b8' }}>
              {mouseCoords.lat.toFixed(2)}°, {mouseCoords.lon.toFixed(2)}°
            </span>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="orbit-map-controls">
        <button className="orbit-map-btn" onClick={() => onZoomChange(0.25)} title="Zoom In">
          +
        </button>
        <button className="orbit-map-btn" onClick={() => onZoomChange(-0.25)} title="Zoom Out">
          −
        </button>
        <button className="orbit-map-btn" onClick={onResetCamera} title="Reset Camera">
          ⌖
        </button>
      </div>

      {/* Render Event Markers */}
      {events.map((evt) => {
        const { x, y, visible } = getMarkerPos(evt.latitude, evt.longitude)
        if (!visible) return null

        const isSelected = selectedEvent?.id === evt.id
        const color = SEVERITY_COLORS[evt.severity] || '#00f0ff'

        return (
          <div
            key={evt.id}
            className="orbit-map-marker"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              color: color,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSelectEvent(evt)
            }}
            onMouseEnter={() => setHoveredEvent(evt)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <div
              className="orbit-marker-ring"
              style={{
                borderColor: color,
                backgroundColor: isSelected ? 'rgba(0,240,255,0.3)' : 'rgba(0,0,0,0.6)',
                width: isSelected ? '22px' : '16px',
                height: isSelected ? '22px' : '16px',
              }}
            >
              <span style={{ fontSize: isSelected ? '11px' : '8px' }}>
                {DOMAIN_ICONS[evt.domain] || '📍'}
              </span>
            </div>

            {/* Hover Tooltip */}
            {(hoveredEvent?.id === evt.id || isSelected) && (
              <div className="orbit-tooltip">
                <div style={{ fontWeight: 700, color: '#fff' }}>{evt.title}</div>
                <div style={{ color: color, fontSize: '9px', marginTop: '2px' }}>
                  {evt.domain.toUpperCase()} • {evt.severity.toUpperCase()} • {evt.region}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
