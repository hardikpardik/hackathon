export type IncidentStatus = 'open' | 'acknowledged' | 'closed'
export type Severity = 'P1' | 'P2' | 'P3'

export interface Incident {
  id: string
  title: string
  service: string
  severity: Severity
  status: IncidentStatus
  summary: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  name: string
  owner: string
  health: 'healthy' | 'degraded' | 'critical'
  uptime: number
  latency: number
}

export interface IncidentPage {
  incidents: Incident[]
  page: number
  totalPages: number
}
