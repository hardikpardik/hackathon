import type { FC, CSSProperties } from 'react'
import type { FilterState, OrbitDomain, SeverityLevel, OrbitEvent } from '../../types/orbit'

interface LayersPanelProps {
  filters: FilterState
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void
  events: OrbitEvent[]
}

const LAYERS: { id: OrbitDomain; label: string; icon: string; color: string }[] = [
  { id: 'geopolitical', label: 'Geopolitical Intelligence', icon: '🌐', color: '#f43f5e' },
  { id: 'healthcare', label: 'Healthcare & Public Health', icon: '🩺', color: '#10b981' },
  { id: 'environmental', label: 'Environmental & Climate', icon: '🌿', color: '#06b6d4' },
  { id: 'disasters', label: 'Disasters & Hazards', icon: '⚠️', color: '#f59e0b' },
  { id: 'emerging', label: 'Emerging Signals', icon: '📡', color: '#a855f7' },
  { id: 'cross_domain', label: 'Cross-Domain Signals', icon: '🔀', color: '#ec4899' },
]

const SEVERITY_OPTIONS: { id: SeverityLevel | 'all'; label: string; color?: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'elevated', label: 'ELEVATED+', color: '#f59e0b' },
  { id: 'high', label: 'HIGH+', color: '#f97316' },
  { id: 'critical', label: 'CRITICAL', color: '#ef4444' },
]

export const LayersPanel: FC<LayersPanelProps> = ({
  filters,
  onFilterChange,
  events,
}) => {
  const toggleLayer = (domain: OrbitDomain) => {
    onFilterChange((prev) => ({
      ...prev,
      activeLayers: {
        ...prev.activeLayers,
        [domain]: !prev.activeLayers[domain],
      },
    }))
  }

  // Count active events per layer
  const getCount = (domain: OrbitDomain) => {
    return events.filter((e) => e.domain === domain).length
  }

  return (
    <aside className="orbit-sidebar-left">
      <div className="orbit-panel-header">
        <span className="orbit-panel-title">
          <span>🎛️</span> INTELLIGENCE LAYERS
        </span>
      </div>

      <div className="orbit-layer-list">
        {LAYERS.map((layer) => {
          const isActive = filters.activeLayers[layer.id]
          const count = getCount(layer.id)

          return (
            <div
              key={layer.id}
              className={`orbit-layer-card ${isActive ? 'active' : ''}`}
              style={{ '--orbit-layer-color': layer.color } as CSSProperties}
              onClick={() => toggleLayer(layer.id)}
            >
              <div className="orbit-layer-info">
                <input
                  type="checkbox"
                  className="orbit-toggle-checkbox"
                  checked={isActive}
                  onChange={() => {}} // handled by parent onClick
                />
                <span className="orbit-layer-icon">{layer.icon}</span>
                <span className="orbit-layer-name">{layer.label}</span>
              </div>
              <span className="orbit-layer-badge">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="orbit-severity-filter">
        <span className="orbit-section-label">MIN SEVERITY THRESHOLD</span>
        <div className="orbit-severity-buttons">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`orbit-sev-btn ${filters.minSeverity === opt.id ? 'active' : ''}`}
              style={{ '--sev-color': opt.color } as CSSProperties}
              onClick={() =>
                onFilterChange((prev) => ({ ...prev, minSeverity: opt.id }))
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
