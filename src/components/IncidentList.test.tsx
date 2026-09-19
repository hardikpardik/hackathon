import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { IncidentList } from './IncidentList'
import { incidents } from '../data'

describe('IncidentList', () => {
  it('renders each incident as a link to its detail page', () => {
    render(
      <MemoryRouter>
        <IncidentList incidents={incidents.slice(0, 2)} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /payment api latency/i })).toHaveAttribute(
      'href',
      '/incidents/1',
    )
    expect(screen.getByRole('link', { name: /checkout errors/i })).toHaveAttribute(
      'href',
      '/incidents/2',
    )
    expect(screen.getByText('payments-api')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('acknowledged')).toBeInTheDocument()
  })

  it('renders nothing when there are no incidents', () => {
    const { container } = render(
      <MemoryRouter>
        <IncidentList incidents={[]} />
      </MemoryRouter>,
    )

    expect(container.querySelector('.incident-list')).toBeEmptyDOMElement()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
