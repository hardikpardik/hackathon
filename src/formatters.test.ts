import { describe, expect, it } from 'vitest'
import { formatIncidentTime, formatGreeting, isSameLocalDay, relativeTime } from './formatters'

describe('formatIncidentTime', () => {
  it('parses ISO timestamps as UTC instead of local naive time', () => {
    const timestamp = '2026-09-18T17:30:00Z'
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
    expect(formatIncidentTime(timestamp)).toBe(new Date(timestamp).toLocaleString([], options))
    if (new Date().getTimezoneOffset() !== 0) {
      expect(formatIncidentTime(timestamp)).not.toBe(
        new Date('2026-09-18T17:30:00').toLocaleString([], options),
      )
    }
  })
})

describe('relativeTime', () => {
  it('formats durations older than a day in days', () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    expect(relativeTime(twoDaysAgo)).toBe('2d ago')
  })
})

describe('formatGreeting', () => {
  it('changes by time of day', () => {
    expect(formatGreeting(new Date(2026, 8, 19, 8))).toBe('Good morning, Alex')
    expect(formatGreeting(new Date(2026, 8, 19, 15))).toBe('Good afternoon, Alex')
    expect(formatGreeting(new Date(2026, 8, 19, 20))).toBe('Good evening, Alex')
  })
})

describe('isSameLocalDay', () => {
  it('matches timestamps on the provided local day', () => {
    const now = new Date('2026-09-19T12:00:00')
    expect(isSameLocalDay(now.toISOString(), now)).toBe(true)
    expect(isSameLocalDay('2026-09-17T20:45:00Z', now)).toBe(false)
  })
})
