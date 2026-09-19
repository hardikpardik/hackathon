import { incidents as seedIncidents, services } from './data'
import type { Incident, IncidentPage, IncidentStatus } from './types'

let incidents = structuredClone(seedIncidents)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getIncidents(
  page = 1,
  query = '',
  status: IncidentStatus | '' = '',
): Promise<IncidentPage> {
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = incidents.filter((incident) => {
    const matchesQuery = `${incident.title} ${incident.service}`.toLowerCase().includes(normalizedQuery)
    const matchesStatus = !status || incident.status === status
    return matchesQuery && matchesStatus
  })
  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  return {
    incidents: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    totalPages,
  }
}

export async function getAllIncidents(): Promise<Incident[]> {
  return incidents.map((incident) => ({ ...incident }))
}

export async function getIncident(id: string): Promise<Incident> {
  const incident = incidents.find((item) => item.id === id)
  if (!incident) throw new Error('Incident not found')
  return { ...incident }
}

export async function acknowledgeIncident(id: string): Promise<Incident> {
  await wait(120)
  const incident = incidents.find((item) => item.id === id)
  if (!incident || incident.status === 'closed')
    throw new Error('Only active incidents can be acknowledged')
  incident.status = 'acknowledged'
  incident.updatedAt = new Date().toISOString()
  return { ...incident }
}

export async function getServices() {
  return services
}

export function resetApi() {
  incidents = structuredClone(seedIncidents)
}
