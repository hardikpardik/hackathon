export type OrbitDomain = 
  | 'geopolitical'
  | 'healthcare'
  | 'environmental'
  | 'disasters'
  | 'emerging'
  | 'cross_domain'

export type SeverityLevel = 'critical' | 'high' | 'elevated' | 'normal' | 'info'

export type SeverityTrend = 'escalating' | 'stable' | 'deescalating'

export interface EvidenceSource {
  title: string
  url: string
  publisher: string
  timestamp: string
  credibilityScore: number // 0 - 100
  type: 'satellite' | 'news' | 'sensor' | 'official_report' | 'sigint'
}

export interface RelatedSignal {
  id: string
  title: string
  domain: OrbitDomain
  severity: SeverityLevel
}

export interface OrbitEvent {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  timestamp: string
  domain: OrbitDomain
  eventType: string
  severity: SeverityLevel
  trend: SeverityTrend
  region: string
  country: string
  affectedPopulation?: string
  aiAnalysis: {
    summary: string
    riskAssessment: string
    keyActors: string[]
    immediateOutlook: string
  }
  sources: EvidenceSource[]
  relatedEvents: RelatedSignal[]
}

export interface RegionalSnapshot {
  id: string
  regionName: string
  threatLevel: SeverityLevel
  regimeStatus: string
  geopoliticalRiskScore: number // 0-100
  healthcareRiskScore: number // 0-100
  environmentalRiskScore: number // 0-100
  summary: string
  keyActors: string[]
  outlook24h: string
  outlook7d: string
}

export interface FilterState {
  searchQuery: string
  selectedRegion: string
  selectedTimeRange: 'live' | '24h' | '7d' | '30d' | 'all'
  activeLayers: Record<OrbitDomain, boolean>
  minSeverity: SeverityLevel | 'all'
  projectionMode: '2d' | '3d'
}
