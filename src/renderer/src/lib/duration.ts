/** Parses timer commands: "timer 5m", "timer 1h30m pizza", "remind me in 10 min to call mum". */

const UNIT_MS: Record<string, number> = {
  s: 1000, sec: 1000, secs: 1000, second: 1000, seconds: 1000,
  m: 60_000, min: 60_000, mins: 60_000, minute: 60_000, minutes: 60_000,
  h: 3_600_000, hr: 3_600_000, hrs: 3_600_000, hour: 3_600_000, hours: 3_600_000
}

const PART = /^\s*(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)?(?![a-z])\s*(?:and\s+)?/i

export interface TimerRequest {
  ms: number
  label: string
}

const TRIGGER = /^(?:timer|countdown|remind(?:\s+me)?(?:\s+in)?|alarm\s+in|in)\s+/i

export function parseTimer(input: string): TimerRequest | null {
  const trigger = TRIGGER.exec(input.trim())
  if (!trigger) return null
  let rest = input.trim().slice(trigger[0].length)
  let ms = 0
  let parts = 0
  for (;;) {
    const m = PART.exec(rest)
    if (!m) break
    // A bare number means minutes ("timer 5").
    ms += parseFloat(m[1]) * UNIT_MS[(m[2] ?? 'min').toLowerCase()]
    rest = rest.slice(m[0].length)
    parts++
    if (!m[2]) break
  }
  if (!parts || ms < 1000 || ms > 7 * 86_400_000) return null
  const label = rest.replace(/^(?:to|for|-|:)\s+/i, '').trim()
  return { ms: Math.round(ms), label }
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h) parts.push(`${h} h`)
  if (m) parts.push(`${m} min`)
  if (s && !h) parts.push(`${s} s`)
  return parts.join(' ') || '0 s'
}

/** 4:05 or 1:02:30 style countdown. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export function timeAgo(at: number, now = Date.now()): string {
  const s = Math.round((now - at) / 1000)
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24)
  if (d < 7) return d === 1 ? 'yesterday' : `${d} days ago`
  return new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
