import { useState, useMemo } from 'react'
import type { FilterState, OrbitEvent, SeverityLevel } from '../types/orbit'
import { MOCK_EVENTS, MOCK_REGIONAL_SNAPSHOTS } from '../mock/orbitData'
import { OrbitHeader } from '../components/orbit/OrbitHeader'
import { LayersPanel } from '../components/orbit/LayersPanel'
import { OrbitMap } from '../components/orbit/OrbitMap'
import { IntelligencePanel } from '../components/orbit/IntelligencePanel'
import { StatusBar } from '../components/orbit/StatusBar'
import '../components/orbit/orbit.css'

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  critical: 4,
  high: 3,
  elevated: 2,
  normal: 1,
  info: 0,
}

export function OrbitDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedRegion: 'all',
    selectedTimeRange: 'live',
    activeLayers: {
      geopolitical: true,
      healthcare: true,
      environmental: true,
      disasters: true,
      emerging: true,
      cross_domain: true,
    },
    minSeverity: 'all',
    projectionMode: '3d',
  })

  const [selectedEvent, setSelectedEvent] = useState<OrbitEvent | null>(MOCK_EVENTS[0])
  const [zoomLevel, setZoomLevel] = useState<number>(1.0)

  // Filter events based on state
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((evt) => {
      // Layer check
      if (!filters.activeLayers[evt.domain]) return false

      // Region check
      if (filters.selectedRegion !== 'all' && evt.region !== filters.selectedRegion) {
        return false
      }

      // Severity threshold check
      if (filters.minSeverity !== 'all') {
        const minRank = SEVERITY_RANK[filters.minSeverity as SeverityLevel] || 0
        const evtRank = SEVERITY_RANK[evt.severity] || 0
        if (evtRank < minRank) return false
      }

      // Search query check
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase()
        const matchTitle = evt.title.toLowerCase().includes(q)
        const matchDesc = evt.description.toLowerCase().includes(q)
        const matchRegion = evt.region.toLowerCase().includes(q)
        const matchCountry = evt.country.toLowerCase().includes(q)
        const matchDomain = evt.domain.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchRegion && !matchCountry && !matchDomain) {
          return false
        }
      }

      return true
    })
  }, [filters])

  const handleZoomChange = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.5, Math.min(3.5, prev + delta)))
  }

  const handleResetCamera = () => {
    setZoomLevel(1.0)
    if (MOCK_EVENTS.length > 0) {
      setSelectedEvent(MOCK_EVENTS[0])
    }
  }

  return (
    <div className="orbit-container">
      <OrbitHeader
        filters={filters}
        onFilterChange={setFilters}
        onResetView={handleResetCamera}
        totalActiveEvents={filteredEvents.length}
      />

      <div className="orbit-workspace">
        <LayersPanel
          filters={filters}
          onFilterChange={setFilters}
          events={MOCK_EVENTS}
        />

        <OrbitMap
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          projectionMode={filters.projectionMode}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          onResetCamera={handleResetCamera}
        />

        <IntelligencePanel
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          regionalSnapshots={MOCK_REGIONAL_SNAPSHOTS}
          selectedRegion={filters.selectedRegion}
        />
      </div>

      <StatusBar activeCount={filteredEvents.length} totalCount={MOCK_EVENTS.length} />
    </div>
  )
}
