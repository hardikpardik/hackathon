import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getIncidents } from '../api'
import { IncidentList } from '../components/IncidentList'
import { incidentKeys } from '../queryKeys'
import type { IncidentStatus } from '../types'

export function Incidents() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<IncidentStatus | ''>('')
  const { data, isLoading } = useQuery({
    queryKey: incidentKeys.list(page, query, status),
    queryFn: () => getIncidents(page, query, status),
    placeholderData: (previous) => previous,
  })

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OPERATIONS / INCIDENTS</p>
          <h1>Incidents</h1>
          <p className="lede">Track, triage, and resolve production issues.</p>
        </div>
      </div>
      <div className="toolbar">
        <label className="search">
          <span>⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setPage(1)
              setQuery(event.target.value)
            }}
            placeholder="Search incidents"
            aria-label="Search incidents"
          />
        </label>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setPage(1)
            setStatus(event.target.value as IncidentStatus | '')
          }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="closed">Closed</option>
        </select>
        <span className="toolbar-count">{data?.incidents.length ?? 0} shown</span>
      </div>
      {isLoading ? (
        <div className="loading">Loading incidents...</div>
      ) : (
        <IncidentList incidents={data?.incidents ?? []} />
      )}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} of {data?.totalPages ?? 1}
        </span>
        <button disabled={page === (data?.totalPages ?? 1)} onClick={() => setPage(page + 1)}>
          Next →
        </button>
      </div>
    </>
  )
}
