import { Link } from 'react-router-dom'
import type { Incident } from '../types'
import { relativeTime } from '../formatters'

export function IncidentRow({ incident }: { incident: Incident }) {
  return (
    <Link className="incident-row" to={`/incidents/${incident.id}`}>
      <span className={`severity severity-${incident.severity.toLowerCase()}`}>
        {incident.severity}
      </span>
      <span className="incident-main">
        <strong>{incident.title}</strong>
        <small>{incident.service}</small>
      </span>
      <span className="muted">{relativeTime(incident.createdAt)}</span>
      <span className={`status status-${incident.status}`}>{incident.status}</span>
      <span className="chevron">›</span>
    </Link>
  )
}
