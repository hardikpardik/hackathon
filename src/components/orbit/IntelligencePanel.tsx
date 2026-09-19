import { useState, useEffect, type FC } from 'react'
import type { OrbitEvent, RegionalSnapshot } from '../../types/orbit'

interface IntelligencePanelProps {
  events: OrbitEvent[]
  selectedEvent: OrbitEvent | null
  onSelectEvent: (evt: OrbitEvent) => void
  regionalSnapshots: Record<string, RegionalSnapshot>
  selectedRegion: string
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

export const IntelligencePanel: FC<IntelligencePanelProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  regionalSnapshots,
  selectedRegion,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'detail' | 'regional'>('feed')

  // Auto-switch to detail tab when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      setActiveTab('detail')
    }
  }, [selectedEvent])

  const regionSnapshot =
    regionalSnapshots[selectedRegion !== 'all' ? selectedRegion : 'Middle East'] ||
    regionalSnapshots['Middle East']

  return (
    <aside className="orbit-sidebar-right">
      <div className="orbit-tabs">
        <button
          className={`orbit-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          LIVE FEED ({events.length})
        </button>
        <button
          className={`orbit-tab ${activeTab === 'detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('detail')}
        >
          DOSSIER {selectedEvent ? '• SELECTED' : ''}
        </button>
        <button
          className={`orbit-tab ${activeTab === 'regional' ? 'active' : ''}`}
          onClick={() => setActiveTab('regional')}
        >
          REGIONAL SNAPSHOT
        </button>
      </div>

      <div className="orbit-tab-content">
        {/* Tab 1: Live Event Feed */}
        {activeTab === 'feed' && (
          <>
            {events.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '40px', fontSize: '12px' }}>
                No active signals matching filter parameters.
              </div>
            ) : (
              events.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id
                const color = SEVERITY_COLORS[evt.severity]

                return (
                  <div
                    key={evt.id}
                    className={`orbit-event-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectEvent(evt)}
                  >
                    <div className="orbit-card-top">
                      <span
                        className="orbit-sev-badge"
                        style={{ backgroundColor: color }}
                      >
                        {evt.severity}
                      </span>
                      <span className="orbit-time-ago">
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="orbit-event-title">{evt.title}</div>

                    <div className="orbit-event-meta">
                      <span>
                        {DOMAIN_ICONS[evt.domain]} {evt.domain.toUpperCase()}
                      </span>
                      <span>{evt.region}</span>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* Tab 2: Event Deep Dive Dossier */}
        {activeTab === 'detail' && (
          <>
            {selectedEvent ? (
              <>
                <div className="orbit-detail-header">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      className="orbit-sev-badge"
                      style={{ backgroundColor: SEVERITY_COLORS[selectedEvent.severity] }}
                    >
                      {selectedEvent.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      TREND: {selectedEvent.trend.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="orbit-detail-title">{selectedEvent.title}</h2>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    📍 {selectedEvent.latitude.toFixed(2)}°, {selectedEvent.longitude.toFixed(2)}° | {selectedEvent.country}
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="orbit-ai-block">
                  <div className="orbit-ai-label">
                    <span>🤖</span> AI EXECUTIVE SUMMARY
                  </div>
                  <p style={{ margin: 0 }}>{selectedEvent.aiAnalysis.summary}</p>
                </div>

                {/* AI Risk Assessment */}
                <div className="orbit-ai-block">
                  <div className="orbit-ai-label">
                    <span>🛡️</span> RISK & IMPLICATIONS
                  </div>
                  <p style={{ margin: 0 }}>{selectedEvent.aiAnalysis.riskAssessment}</p>
                </div>

                {/* Key Actors */}
                <div>
                  <span className="orbit-section-label">KEY ACTORS & ENTITIES</span>
                  <div>
                    {selectedEvent.aiAnalysis.keyActors.map((actor) => (
                      <span key={actor} className="orbit-actors-tag">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence Sources */}
                <div>
                  <span className="orbit-section-label">VERIFIED EVIDENCE & SOURCES</span>
                  <div className="orbit-sources-list">
                    {selectedEvent.sources.map((src, i) => (
                      <div key={i} className="orbit-source-item">
                        <div>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="orbit-source-link"
                          >
                            {src.title}
                          </a>
                          <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>
                            {src.publisher} • {src.type.toUpperCase()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>
                            {src.credibilityScore}%
                          </span>
                          <div style={{ fontSize: '8px', color: '#64748b' }}>CONFIDENCE</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '40px', fontSize: '12px' }}>
                Select an event from the map or live feed to inspect its dossier.
              </div>
            )}
          </>
        )}

        {/* Tab 3: Regional Snapshot */}
        {activeTab === 'regional' && (
          <>
            <div className="orbit-regional-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                  {regionSnapshot.regionName.toUpperCase()}
                </span>
                <span
                  className="orbit-sev-badge"
                  style={{ backgroundColor: SEVERITY_COLORS[regionSnapshot.threatLevel] }}
                >
                  {regionSnapshot.threatLevel.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {regionSnapshot.regimeStatus}
              </div>

              <p style={{ fontSize: '11px', lineHeight: 1.4, margin: '4px 0' }}>
                {regionSnapshot.summary}
              </p>

              {/* Risk Meters */}
              <div className="orbit-risk-meter">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Geopolitical Risk</span>
                  <span style={{ color: '#f43f5e', fontWeight: 700 }}>{regionSnapshot.geopoliticalRiskScore}%</span>
                </div>
                <div className="orbit-meter-bar-bg">
                  <div
                    className="orbit-meter-bar-fill"
                    style={{ width: `${regionSnapshot.geopoliticalRiskScore}%`, backgroundColor: '#f43f5e' }}
                  />
                </div>
              </div>

              <div className="orbit-risk-meter">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Healthcare / Bio Risk</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{regionSnapshot.healthcareRiskScore}%</span>
                </div>
                <div className="orbit-meter-bar-bg">
                  <div
                    className="orbit-meter-bar-fill"
                    style={{ width: `${regionSnapshot.healthcareRiskScore}%`, backgroundColor: '#10b981' }}
                  />
                </div>
              </div>

              <div className="orbit-risk-meter">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Environmental & Climate Risk</span>
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>{regionSnapshot.environmentalRiskScore}%</span>
                </div>
                <div className="orbit-meter-bar-bg">
                  <div
                    className="orbit-meter-bar-fill"
                    style={{ width: `${regionSnapshot.environmentalRiskScore}%`, backgroundColor: '#06b6d4' }}
                  />
                </div>
              </div>

              {/* Forecast */}
              <div style={{ marginTop: '8px' }}>
                <span className="orbit-section-label">24-HOUR OUTLOOK</span>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '4px 0' }}>
                  {regionSnapshot.outlook24h}
                </p>
              </div>

              <div>
                <span className="orbit-section-label">7-DAY OUTLOOK</span>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '4px 0' }}>
                  {regionSnapshot.outlook7d}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
