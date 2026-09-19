import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { acknowledgeIncident, getIncident } from '../api'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { formatIncidentTime } from '../formatters'
import { incidentKeys } from '../queryKeys'
import type { Incident } from '../types'

export function IncidentDetailPage() {
  const { id = '' } = useParams()
  return (
    <ErrorBoundary key={id}>
      <IncidentDetail />
    </ErrorBoundary>
  )
}

export function IncidentDetail() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const {
    data: incident,
    isLoading,
    isError,
  } = useQuery({ queryKey: incidentKeys.detail(id), queryFn: () => getIncident(id) })
  const mutation = useMutation({
    mutationFn: () => acknowledgeIncident(id),
    onMutate: async () => {
      const key = incidentKeys.detail(id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Incident>(key)
      queryClient.setQueryData<Incident>(key, (current) =>
        current ? { ...current, status: 'acknowledged' } : current,
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(incidentKeys.detail(id), context.previous)
      }
    },
    onSuccess: (updated) => queryClient.setQueryData(incidentKeys.detail(id), updated),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) })
    },
  })
  if (isLoading) return <div className="loading">Loading incident...</div>
  if (isError || !incident)
    return (
      <div className="error-panel">
        <h2>Incident unavailable</h2>
        <Link to="/incidents">Back to incidents</Link>
      </div>
    )
  const canAcknowledge = incident.status !== 'closed' && incident.status !== 'acknowledged'
  return (
    <>
      <Link className="back-link" to="/incidents">
        ← All incidents
      </Link>
      <div className="detail-heading">
        <div>
          <div className="detail-kicker">
            <span className={`severity severity-${incident.severity.toLowerCase()}`}>
              {incident.severity}
            </span>
            <span className={`status status-${incident.status}`}>{incident.status}</span>
          </div>
          <h1>{incident.title}</h1>
          <p className="lede">
            {incident.service} · Incident #{incident.id}
          </p>
        </div>
        {canAcknowledge && (
          <button
            className="button button-primary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
          </button>
        )}
      </div>
      {mutation.isError && (
        <div role="alert" className="alert">
          {mutation.error.message}
        </div>
      )}
      <div className="detail-grid">
        <section className="panel">
          <p className="eyebrow">SUMMARY</p>
          <h2>What happened</h2>
          <p>{incident.summary}</p>
          <div className="timeline">
            <div>
              <span className="timeline-dot" />
              <p>
                <strong>Incident created</strong>
                <small>{formatIncidentTime(incident.createdAt)}</small>
              </p>
            </div>
            <div>
              <span className="timeline-dot" />
              <p>
                <strong>Last updated</strong>
                <small>{formatIncidentTime(incident.updatedAt)}</small>
              </p>
            </div>
          </div>
        </section>
        <aside className="panel">
          <p className="eyebrow">DETAILS</p>
          <dl>
            <dt>Service</dt>
            <dd>{incident.service}</dd>
            <dt>Started</dt>
            <dd>{formatIncidentTime(incident.createdAt)}</dd>
          </dl>
        </aside>
      </div>
    </>
  )
}
