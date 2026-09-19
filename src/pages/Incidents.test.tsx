import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { resetApi } from '../api'
import { Incidents } from './Incidents'
import { renderWithProviders } from '../test/utils'

afterEach(resetApi)

describe('Incidents page', () => {
  it('refetches when the page changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Incidents />)

    expect(await screen.findByRole('link', { name: /payment api latency/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findByRole('link', { name: /mobile login timeout/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payment api latency/i })).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('searches by service name without requiring an exact title match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Incidents />)

    await screen.findByRole('link', { name: /payment api latency/i })
    await user.type(screen.getByRole('searchbox', { name: /search incidents/i }), 'identity')

    expect(await screen.findByRole('link', { name: /mobile login timeout/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /payment api latency/i })).not.toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Incidents />)

    await screen.findByRole('link', { name: /payment api latency/i })
    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'closed')

    expect(await screen.findByRole('link', { name: /mobile login timeout/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /email delivery delay/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payment api latency/i })).not.toBeInTheDocument()
  })
})
