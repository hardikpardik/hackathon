import type { Incident } from '../types'
import { IncidentRow } from './IncidentRow'

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="incident-list">
      {incidents.map((incident) => (
        <IncidentRow key={incident.id} incident={incident} />
      ))}
    </div>
  )
}
