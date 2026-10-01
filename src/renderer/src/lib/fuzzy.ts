/**
 * Fuzzy matching tuned for a launcher: typing the start of a name, the start of
 * any word, or its initials ("vsc" → Visual Studio Code) should all rank highly,
 * and loose in-order letters ("chrme") should still find something.
 */

export interface Match {
  score: number
  /** Character positions in the text to highlight. */
  indices: number[]
}

function wordStarts(text: string): number[] {
  const starts: number[] = []
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const prev = text[i - 1]
    if (!/[\p{L}\p{N}]/u.test(ch)) continue
    if (
      i === 0 ||
      !/[\p{L}\p{N}]/u.test(prev) ||
      (/\p{Lu}/u.test(ch) && /\p{Ll}/u.test(prev)) ||
      (/\p{N}/u.test(ch) && !/\p{N}/u.test(prev))
    ) {
      starts.push(i)
    }
  }
  return starts
}

function range(start: number, length: number): number[] {
  return Array.from({ length }, (_, i) => start + i)
}

function matchToken(q: string, text: string, lower: string, starts: number[]): Match | null {
  if (lower === q) return { score: 1000, indices: range(0, q.length) }
  if (lower.startsWith(q)) return { score: 900 - Math.min(lower.length - q.length, 50), indices: range(0, q.length) }

  for (const s of starts) {
    if (s > 0 && lower.startsWith(q, s)) return { score: 800 - Math.min(s, 50), indices: range(s, q.length) }
  }

  // Initials: "vsc" → [V]isual [S]tudio [C]ode
  if (q.length >= 2 && starts.length >= q.length) {
    const initials = starts.map((i) => lower[i]).join('')
    if (initials.startsWith(q)) return { score: 760, indices: starts.slice(0, q.length) }
  }

  const at = lower.indexOf(q)
  if (at >= 0) return { score: 600 - Math.min(at, 50), indices: range(at, q.length) }

  // Letters in order, rewarding runs and word starts, penalising gaps.
  if (q.length < 2) return null
  const startSet = new Set(starts)
  const indices: number[] = []
  let score = 300
  let ti = 0
  for (let qi = 0; qi < q.length; qi++) {
    const found = lower.indexOf(q[qi], ti)
    if (found < 0) return null
    if (indices.length) {
      const gap = found - indices[indices.length - 1] - 1
      score += gap === 0 ? 12 : -Math.min(gap, 10) * 3
    }
    if (startSet.has(found)) score += 10
    indices.push(found)
    ti = found + 1
  }
  score -= Math.min(indices[0], 20)
  // Very scattered matches are noise.
  if (indices[indices.length - 1] - indices[0] > q.length * 4 + 6) return null
  return { score: Math.max(score, 100), indices }
}

export function fuzzyMatch(query: string, text: string): Match | null {
  const q = query.trim().toLowerCase()
  if (!q) return { score: 0, indices: [] }
  const lower = text.toLowerCase()
  const starts = wordStarts(text)

  const tokens = q.split(/\s+/)
  if (tokens.length === 1) return matchToken(q, text, lower, starts)

  // Multi-word: try the whole phrase first, then require every word to match.
  const whole = matchToken(q, text, lower, starts)
  if (whole && whole.score >= 600) return whole
  let total = 0
  const indices = new Set<number>()
  for (const token of tokens) {
    const m = matchToken(token, text, lower, starts)
    if (!m || m.score < 500) return null
    total += m.score
    m.indices.forEach((i) => indices.add(i))
  }
  return { score: Math.round(total / tokens.length) - 20, indices: [...indices].sort((a, b) => a - b) }
}

/** Best match across a title and extra keywords; keywords score a little lower and don't highlight. */
export function matchAny(query: string, title: string, keywords: string[] = []): Match | null {
  let best = fuzzyMatch(query, title)
  for (const kw of keywords) {
    const m = fuzzyMatch(query, kw)
    if (m && m.score >= 600 && (!best || m.score - 80 > best.score)) best = { score: m.score - 80, indices: [] }
  }
  return best
}
