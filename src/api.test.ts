import { afterEach, describe, expect, it } from 'vitest'
import { acknowledgeIncident, getAllIncidents, getIncidents, resetApi } from './api'

afterEach(resetApi)

describe('incident API contract', () => {
  it('returns a paginated incident response', async () => {
    const response = await getIncidents(1)
    expect(response.page).toBe(1)
    expect(response.incidents).toHaveLength(4)
    expect(response.totalPages).toBe(2)
  })

  it('returns the next page of incidents', async () => {
    const response = await getIncidents(2)
    expect(response.page).toBe(2)
    expect(response.incidents.map((incident) => incident.id)).toEqual(['5', '6'])
  })

  it('filters incidents by query across title and service, case-insensitively', async () => {
    const response = await getIncidents(1, 'PAYMENTS')
    expect(response.incidents.map((incident) => incident.id)).toEqual(['1', '4'])
    expect(response.totalPages).toBe(1)
  })

  it('filters incidents by status', async () => {
    const response = await getIncidents(1, '', 'closed')
    expect(response.incidents.every((incident) => incident.status === 'closed')).toBe(true)
    expect(response.incidents).toHaveLength(2)
  })

  it('rejects acknowledgement for a closed incident', async () => {
    await expect(acknowledgeIncident('5')).rejects.toThrow('Only active incidents')
  })

  it('acknowledges an open incident', async () => {
    const updated = await acknowledgeIncident('4')
    expect(updated.status).toBe('acknowledged')
    const catalog = await getAllIncidents()
    expect(catalog.find((incident) => incident.id === '4')?.status).toBe('acknowledged')
  })
})
