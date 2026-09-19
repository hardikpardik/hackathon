import { useState, useEffect, useRef, type FC, type MouseEvent, type WheelEvent } from 'react'
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

  // Map state
  const [centerLon, setCenterLon] = useState(15)
  const [centerLat, setCenterLat] = useState(20)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredEvent, setHoveredEvent] = useState<OrbitEvent | null>(null)
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number } | null>(null)

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

    // Calculate approximate lat/lon under cursor for HUD
    if (projectionMode === '2d') {
      const lon = ((x / rect.width) * 360 - 180) / zoomLevel + centerLon
      const lat = (90 - (y / rect.height) * 180) / zoomLevel + centerLat
      setMouseCoords({ lat: Math.max(-90, Math.min(90, lat)), lon: ((lon + 180) % 360) - 180 })
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
      setCenterLon((prev) => prev - (dx / (rect.width * 0.005)) / zoomLevel)
      setCenterLat((prev) => Math.max(-85, Math.min(85, prev + (dy / (rect.height * 0.005)) / zoomLevel)))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    onZoomChange(e.deltaY < 0 ? 0.2 : -0.2)
  }

  // Draw tactical Canvas background (graticules, globe sphere, land mass grid)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    canvas.width = width
    canvas.height = height

    // Clear
    ctx.clearRect(0, 0, width, height)

    if (projectionMode === '3d') {
      // Render 3D Orthographic Globe
      const radius = Math.min(width, height) * 0.38 * zoomLevel
      const cx = width / 2
      const cy = height / 2

      // Globe atmospheric outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15)
      glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)')
      glowGrad.addColorStop(1, 'rgba(0, 240, 255, 0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2)
      ctx.fill()

      // Globe sphere surface fill
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius)
      sphereGrad.addColorStop(0, '#101e33')
      sphereGrad.addColorStop(0.7, '#09111c')
      sphereGrad.addColorStop(1, '#04070d')
      ctx.fillStyle = sphereGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#00f0ff'
      ctx.stroke()

      // Render 3D Latitude/Longitude Graticule lines
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)'

      // Longitude lines
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath()
        let started = false
        for (let lat = -90; lat <= 90; lat += 5) {
          const pt = project3D(lat, lon, centerLat, centerLon, radius, cx, cy)
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true }
            else { ctx.lineTo(pt.x, pt.y) }
          } else {
            started = false
          }
        }
        ctx.stroke()
      }

      // Latitude circles
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let started = false
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project3D(lat, lon, centerLat, centerLon, radius, cx, cy)
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true }
            else { ctx.lineTo(pt.x, pt.y) }
          } else {
            started = false
          }
        }
        ctx.stroke()
      }

    } else {
      // Render 2D Grid & Map lines
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

      // Draw Equator & Prime Meridian accents
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
  }, [projectionMode, centerLon, centerLat, zoomLevel])

  // Helper projection math for 3D Globe
  function project3D(
    lat: number,
    lon: number,
    cLat: number,
    cLon: number,
    radius: number,
    cx: number,
    cy: number
  ) {
    const radLat = (lat * Math.PI) / 180
    const radLon = (lon * Math.PI) / 180
    const radCLat = (cLat * Math.PI) / 180
    const radCLon = (cLon * Math.PI) / 180

    const cosc = Math.sin(radCLat) * Math.sin(radLat) + Math.cos(radCLat) * Math.cos(radLat) * Math.cos(radLon - radCLon)
    const visible = cosc > 0

    const x = cx + radius * Math.cos(radLat) * Math.sin(radLon - radCLon)
    const y = cy - radius * (Math.cos(radCLat) * Math.sin(radLat) - Math.sin(radCLat) * Math.cos(radLat) * Math.cos(radLon - radCLon))

    return { x, y, visible }
  }

  // Calculate marker screen positions
  const getMarkerPos = (lat: number, lon: number) => {
    if (!containerRef.current) return { x: -999, y: -999, visible: false }
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    if (projectionMode === '3d') {
      const radius = Math.min(width, height) * 0.38 * zoomLevel
      const cx = width / 2
      const cy = height / 2
      return project3D(lat, lon, centerLat, centerLon, radius, cx, cy)
    } else {
      // 2D Projection
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
