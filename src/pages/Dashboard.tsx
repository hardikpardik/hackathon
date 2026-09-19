import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAllIncidents, getServices } from '../api'
import { IncidentRow } from '../components/IncidentRow'
import {
  formatDashboardDate,
  formatGreeting,
  isActiveStatus,
  isSameLocalDay,
} from '../formatters'
import { incidentKeys, serviceKeys } from '../queryKeys'

export function Dashboard() {
  const { data: incidents } = useQuery({ queryKey: incidentKeys.catalog(), queryFn: getAllIncidents })
  const { data: serviceList } = useQuery({ queryKey: serviceKeys.all, queryFn: getServices })
  const active = incidents?.filter((incident) => isActiveStatus(incident.status)).length ?? 0
  const resolvedToday = incidents?.filter(
    (incident) => incident.status === 'closed' && isSameLocalDay(incident.updatedAt),
  ).length ?? 0
  const uptime =
    serviceList && serviceList.length > 0
      ? serviceList.reduce((sum, service) => sum + service.uptime, 0) / serviceList.length
      : 0
  const recent = [...(incidents ?? [])]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4)

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{formatDashboardDate()}</p>
          <h1>{formatGreeting()}</h1>
          <p className="lede">Here&apos;s what&apos;s happening across your production systems.</p>
        </div>
        <Link className="button button-primary" to="/incidents">
          View all incidents
        </Link>
      </div>
      <section className="metric-grid">
        <div className="metric-card metric-alert">
          <span>Active incidents</span>
          <strong>{active}</strong>
          <small>Needs attention now</small>
        </div>
        <div className="metric-card">
          <span>Resolved today</span>
          <strong>{resolvedToday}</strong>
          <small>Closed incidents updated today</small>
        </div>
        <div className="metric-card">
          <span>Overall uptime</span>
          <strong>{uptime ? `${uptime.toFixed(2)}%` : '—'}</strong>
          <small>Across {serviceList?.length ?? 0} services</small>
        </div>
      </section>
      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">LIVE FEED</p>
            <h2>Recent incidents</h2>
          </div>
          <Link to="/incidents">See all →</Link>
        </div>
        <div className="incident-list">
          {recent.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
        </div>
      </section>
    </>
  )
}
