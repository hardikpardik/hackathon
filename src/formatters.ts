import type { IncidentStatus } from './types'

export function formatIncidentTime(timestamp: string) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeTime(timestamp: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`
  return `${Math.round(minutes / 1440)}d ago`
}

export function formatDashboardDate(date = new Date()) {
  return date
    .toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

export function formatGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning, Alex'
  if (hour < 18) return 'Good afternoon, Alex'
  return 'Good evening, Alex'
}

export function isSameLocalDay(timestamp: string, now = new Date()) {
  const date = new Date(timestamp)
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isActiveStatus(status: IncidentStatus) {
  return status !== 'closed'
}
