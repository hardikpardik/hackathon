import type { FC } from 'react'

interface StatusBarProps {
  activeCount: number
  totalCount: number
}

const SEVERITIES = [
  { label: 'CRITICAL', color: '#ef4444' },
  { label: 'HIGH', color: '#f97316' },
  { label: 'ELEVATED', color: '#f59e0b' },
  { label: 'NORMAL', color: '#10b981' },
  { label: 'INFO', color: '#3b82f6' },
]

export const StatusBar: FC<StatusBarProps> = ({ activeCount, totalCount }) => {
  return (
    <footer className="orbit-statusbar">
      <div className="orbit-legend">
        <span style={{ fontWeight: 700, color: '#94a3b8' }}>SEVERITY:</span>
        {SEVERITIES.map((s) => (
          <div key={s.label} className="orbit-legend-item">
            <div className="orbit-legend-dot" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span>
          SIGNALS FILTERED: <strong style={{ color: '#00f0ff' }}>{activeCount}</strong> / {totalCount}
        </span>
        <span>
          INGESTION RATE: <strong style={{ color: '#10b981' }}>1.4k / sec</strong>
        </span>
        <span>
          STATUS: <strong style={{ color: '#10b981' }}>● OPERATIONAL</strong>
        </span>
      </div>
    </footer>
  )
}
