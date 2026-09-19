import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import { Dashboard } from './Dashboard'
import { IncidentDetail } from './IncidentDetail'
import { createTestQueryClient, renderWithProviders } from '../test/utils'

afterEach(() => {
  api.resetApi()
  vi.restoreAllMocks()
})

function renderDetail(id: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/incidents/:id" element={<IncidentDetail />} />
    </Routes>,
    { route: `/incidents/${id}` },
  )
}

describe('IncidentDetail', () => {
  it('loads a different incident when the route id changes', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/incidents/1']}>
          <Routes>
            <Route
              path="/incidents/:id"
              element={
                <>
                  <Link to="/incidents/2">Open checkout incident</Link>
                  <IncidentDetail />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'Payment API latency' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Open checkout incident' }))
    expect(await screen.findByRole('heading', { name: 'Checkout errors' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Payment API latency' })).not.toBeInTheDocument()
  })

  it('acknowledges an incident', async () => {
    const user = userEvent.setup()
    renderDetail('4')

    expect(await screen.findByRole('heading', { name: 'Payment webhook retries' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }))

    await waitFor(() => {
      expect(screen.getByText('acknowledged')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Acknowledge' })).not.toBeInTheDocument()
  })

  it('rolls back an optimistic acknowledgement when the request fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'acknowledgeIncident').mockRejectedValue(new Error('Acknowledgement service unavailable'))
    renderDetail('1')

    expect(await screen.findByRole('heading', { name: 'Payment API latency' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Acknowledgement service unavailable')
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument()
  })

  it('shows a recovery state when the incident does not exist', async () => {
    renderDetail('broken')
    expect(await screen.findByRole('heading', { name: 'Incident unavailable' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to incidents/i })).toHaveAttribute(
      'href',
      '/incidents',
    )
  })
})

describe('Dashboard metrics', () => {
  it('computes active incidents from the full catalog', async () => {
    renderWithProviders(<Dashboard />)
    const activeCard = (await screen.findByText('Active incidents')).closest('.metric-card')
    await waitFor(() => {
      expect(activeCard).toHaveTextContent('4')
    })
    expect(screen.getByText(/across 4 services/i)).toBeInTheDocument()
  })
})
