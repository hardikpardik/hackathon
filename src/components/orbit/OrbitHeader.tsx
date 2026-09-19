import type { FC } from 'react'
import type { FilterState } from '../../types/orbit'

interface OrbitHeaderProps {
  filters: FilterState
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void
  onResetView: () => void
  totalActiveEvents: number
}

const REGIONS = [
  'All Regions',
  'Middle East',
  'Asia Pacific',
  'Europe',
  'North America',
  'Latin America',
  'Africa',
]

const TIME_RANGES: { id: FilterState['selectedTimeRange']; label: string }[] = [
  { id: 'live', label: 'LIVE' },
  { id: '24h', label: '24H' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'all', label: 'ALL' },
]

export const OrbitHeader: FC<OrbitHeaderProps> = ({
  filters,
  onFilterChange,
  onResetView,
  totalActiveEvents,
}) => {
  return (
    <header className="orbit-header">
      <div className="orbit-brand">
        <div className="orbit-logo-icon">
          <div className="orbit-logo-ring" />
          <div className="orbit-logo-core" />
        </div>
        <div className="orbit-title">
          <span className="orbit-title-main">ORBIT</span>
          <span className="orbit-title-sub">GLOBAL INTELLIGENCE PLATFORM</span>
        </div>
        <div className="orbit-live-badge">
          <div className="orbit-pulse-dot" />
          <span>LIVE • {totalActiveEvents} SIGNALS</span>
        </div>
      </div>

      <div className="orbit-header-controls">
        <div className="orbit-search-wrapper">
          <span className="orbit-search-icon">🔍</span>
          <input
            type="text"
            className="orbit-search-input"
            placeholder="Search events, signals, coordinates..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
          />
        </div>

        <select
          className="orbit-select"
          value={filters.selectedRegion}
          onChange={(e) =>
            onFilterChange((prev) => ({ ...prev, selectedRegion: e.target.value }))
          }
        >
          {REGIONS.map((r) => (
            <option key={r} value={r === 'All Regions' ? 'all' : r}>
              {r}
            </option>
          ))}
        </select>

        <div className="orbit-btn-group">
          {TIME_RANGES.map((t) => (
            <button
              key={t.id}
              className={`orbit-btn-toggle ${filters.selectedTimeRange === t.id ? 'active' : ''}`}
              onClick={() =>
                onFilterChange((prev) => ({ ...prev, selectedTimeRange: t.id }))
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="orbit-btn-group">
          <button
            className={`orbit-btn-toggle ${filters.projectionMode === '2d' ? 'active' : ''}`}
            onClick={() =>
              onFilterChange((prev) => ({ ...prev, projectionMode: '2d' }))
            }
          >
            2D MAP
          </button>
          <button
            className={`orbit-btn-toggle ${filters.projectionMode === '3d' ? 'active' : ''}`}
            onClick={() =>
              onFilterChange((prev) => ({ ...prev, projectionMode: '3d' }))
            }
          >
            3D GLOBE
          </button>
        </div>

        <button className="orbit-btn-action" onClick={onResetView} title="Reset Map Camera">
          <span>🎯</span> Reset
        </button>
      </div>
    </header>
  )
}
