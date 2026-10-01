/**
 * The interactive command bar on the website. It runs Summon's real matching,
 * calculator, unit, colour, timer and emoji code (imported from the app), with a
 * pretend list of installed apps, so visitors can try it before downloading.
 */
import { calculate, formatNumber, rawNumber } from '../../src/renderer/src/lib/calc'
import { parseColor } from '../../src/renderer/src/lib/color'
import { formatDuration, parseTimer } from '../../src/renderer/src/lib/duration'
import { EMOJI } from '../../src/renderer/src/lib/emoji'
import { fuzzyMatch, matchAny } from '../../src/renderer/src/lib/fuzzy'
import { convertUnits } from '../../src/renderer/src/lib/units'

const ICON: Record<string, string> = {
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
  timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
  trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  play: '<path d="M6 3l14 9-14 9V3z"/>',
  sparkle: '<path d="M12 3c.6 4.3 3.7 7.4 8 8-4.3.6-7.4 3.7-8 8-.6-4.3-3.7-7.4-8-8 4.3-.6 7.4-3.7 8-8Z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  back: '<path d="m12 19-7-7 7-7M19 12H5"/>'
}

const TINT: Record<string, string> = {
  violet: 'linear-gradient(135deg,#9b7bff,#6d4aff)',
  blue: 'linear-gradient(135deg,#5ab0ff,#2f6fed)',
  green: 'linear-gradient(135deg,#4ade80,#16a34a)',
  orange: 'linear-gradient(135deg,#ffb057,#f06d1f)',
  red: 'linear-gradient(135deg,#ff7a7a,#e0344b)',
  pink: 'linear-gradient(135deg,#ff8fd0,#e6479b)',
  gray: 'linear-gradient(135deg,#a1a1aa,#63636e)',
  teal: 'linear-gradient(135deg,#4fe0d0,#0f9e9a)',
  yellow: 'linear-gradient(135deg,#ffd84d,#f5a300)'
}

function glyph(name: string, tint: string): string {
  return `<span class="d-ico" style="background:${TINT[tint]}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg></span>`
}
function tile(letter: string, from: string, to: string): string {
  return `<span class="d-ico" style="background:linear-gradient(135deg,${from},${to})"><b>${letter}</b></span>`
}
function swatch(color: string): string {
  return `<span class="d-ico d-swatch"><i style="background:${color}"></i></span>`
}
function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

// A believable set of installed apps (lettered tiles — we don't borrow logos).
const APPS: [string, string, string][] = [
  ['Spotify', '#1ed760', '#169c46'],
  ['Visual Studio Code', '#3ea6ff', '#0065a9'],
  ['Google Chrome', '#fbbc04', '#ea4335'],
  ['Discord', '#8c9eff', '#5865f2'],
  ['Figma', '#ff7262', '#a259ff'],
  ['Notion', '#6b6b6b', '#1f1f1f'],
  ['Slack', '#e01e5a', '#611f69'],
  ['Steam', '#66c0f4', '#1b2838'],
  ['OBS Studio', '#6b6b7b', '#302e31'],
  ['File Explorer', '#ffd35c', '#e8a300'],
  ['Microsoft Word', '#41a5ee', '#185abd'],
  ['Microsoft Excel', '#33c481', '#107c41'],
  ['Microsoft PowerPoint', '#ff8f6b', '#c43e1c'],
  ['Microsoft Teams', '#7b83eb', '#4b53bc'],
  ['Notepad', '#6cc4ff', '#2b88d8'],
  ['Calculator', '#8a8a8a', '#4a4a4a'],
  ['Photos', '#58b7ff', '#1a73d9'],
  ['Terminal', '#4d4d4d', '#1a1a1a'],
  ['Paint', '#ffb057', '#e6479b'],
  ['Blender', '#ff9a3d', '#e87d0d'],
  ['Zoom', '#4a8cff', '#0b5cff'],
  ['WhatsApp', '#4ade80', '#128c7e'],
  ['Netflix', '#ff4d57', '#b20710'],
  ['Minecraft Launcher', '#7fbf4d', '#4f7a28']
]

interface Command {
  title: string
  subtitle: string
  keywords: string[]
  icon: string
  tint: string
  run: string
}
const COMMANDS: Command[] = [
  { title: 'Clipboard History', subtitle: 'Search and paste anything you’ve copied', keywords: ['paste', 'copy', 'clip'], icon: 'clipboard', tint: 'violet', run: 'mode:clipboard' },
  { title: 'Emoji Picker', subtitle: 'Find an emoji and paste it — or type “:”', keywords: ['emoji', 'smiley'], icon: 'smile', tint: 'yellow', run: 'mode:emoji' },
  { title: 'Start a Timer', subtitle: 'Try “timer 25m focus”', keywords: ['timer', 'countdown', 'pomodoro'], icon: 'timer', tint: 'orange', run: 'query:timer ' },
  { title: 'Lock Screen', subtitle: 'Lock your PC', keywords: ['lock', 'away'], icon: 'lock', tint: 'blue', run: 'toast:Your PC would lock now 🔒' },
  { title: 'Toggle Dark Mode', subtitle: 'Switch Windows between light and dark', keywords: ['dark mode', 'theme'], icon: 'monitor', tint: 'gray', run: 'toast:Windows would switch themes 🌗' },
  { title: 'Sleep', subtitle: 'Put your PC to sleep', keywords: ['sleep', 'suspend'], icon: 'moon', tint: 'blue', run: 'toast:Sweet dreams, PC 😴' },
  { title: 'Shut Down', subtitle: 'Turn off your PC', keywords: ['shutdown', 'power off'], icon: 'power', tint: 'red', run: 'toast:Shutting down — after you press ↵ again 👋' },
  { title: 'Empty Recycle Bin', subtitle: 'Permanently delete everything in the bin', keywords: ['trash', 'bin', 'clean'], icon: 'trash', tint: 'red', run: 'toast:Recycle Bin emptied 🧹' }
]

const CLIPS = [
  { text: 'https://github.com/phillipcurmei2-max/summon', icon: glyph('link', 'blue'), ago: '1 min ago' },
  { text: '#8B6DFF', icon: swatch('#8B6DFF'), ago: '4 min ago' },
  { text: 'Meeting moved to Thursday 3pm — same room, bring the Q3 numbers.', icon: glyph('type', 'gray'), ago: '12 min ago' },
  { text: 'export function greet(name) {\n  return `Hello, ${name}!`\n}', icon: glyph('code', 'violet'), ago: '46 min ago' },
  { text: 'Flat 4, 21 Baker Street, London NW1 6XE', icon: glyph('type', 'gray'), ago: 'yesterday' }
]

const PREFIX: Record<string, [string, string, string, string]> = {
  yt: ['YouTube', 'https://www.youtube.com/results?search_query=', 'play', 'red'],
  gh: ['GitHub', 'https://github.com/search?q=', 'globe', 'gray'],
  wiki: ['Wikipedia', 'https://en.wikipedia.org/w/index.php?search=', 'globe', 'gray'],
  maps: ['Google Maps', 'https://www.google.com/maps/search/', 'globe', 'green'],
  ask: ['Claude', 'https://claude.ai/new?q=', 'sparkle', 'orange']
}

type Run = { kind: 'toast'; text: string } | { kind: 'copy'; text: string; label: string } | { kind: 'url'; url: string } | { kind: 'mode'; mode: Mode } | { kind: 'query'; q: string }

interface Row {
  html: string
  primary: string
  run: Run
}
interface Section {
  title: string
  rows: Row[]
}
type Mode = 'root' | 'emoji' | 'clipboard'

function highlight(text: string, idx: number[] = []): string {
  const hits = new Set(idx)
  return [...text].map((ch, i) => (hits.has(i) ? `<em>${esc(ch)}</em>` : esc(ch))).join('')
}

function row(icon: string, title: string, sub: string, acc: string, idx?: number[]): string {
  return `${icon}<span class="d-title">${highlight(title, idx)}</span>${sub ? `<span class="d-sub">${esc(sub)}</span>` : ''}<span class="d-acc">${esc(acc)}</span>`
}

function card(left: string, leftCap: string, right: string, rightCap: string, sw?: string): string {
  const l = sw ? `<span class="d-bigswatch"><i style="background:${sw}"></i></span>` : `<span class="d-big">${esc(left)}</span>`
  return `<div class="d-card-side">${l}<small>${esc(sw ? left : leftCap)}</small></div><svg class="d-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ICON.arrow}</svg><div class="d-card-side"><span class="d-big d-strong">${esc(right)}</span><small>${esc(rightCap)}</small></div>`
}

function rootSections(q: string): Section[] {
  const out: Section[] = []
  const query = q.trim()
  if (!query) {
    return [
      {
        title: 'Suggestions',
        rows: [
          ...COMMANDS.slice(0, 3).map((c) => ({ html: row(glyph(c.icon, c.tint), c.title, c.subtitle, 'Command'), primary: 'Run Command', run: toRun(c.run) })),
          ...APPS.slice(0, 3).map(([n, a, b]) => appRow(n, a, b))
        ]
      }
    ]
  }

  const timer = parseTimer(query)
  if (timer) {
    out.push({ title: 'Timer', rows: [{ html: card(formatDuration(timer.ms), 'Timer', timer.label || 'Time’s up!', 'Notification'), primary: 'Start Timer', run: { kind: 'toast', text: `⏰ Timer set for ${formatDuration(timer.ms)}${timer.label ? ` — ${timer.label}` : ''}` } }] })
  }
  const calc = calculate(query)
  if (calc) out.push({ title: 'Calculator', rows: [{ html: card(query, 'Expression', calc.text, 'Result'), primary: 'Copy Answer', run: { kind: 'copy', text: rawNumber(calc.value), label: calc.text } }] })
  const conv = convertUnits(query)
  if (conv.length) {
    out.push({
      title: 'Conversion',
      rows: conv.map((c) => {
        const v = formatNumber(Number(c.value.toPrecision(6)))
        return { html: card(`${formatNumber(c.input)} ${c.from}`, 'Convert', `${v} ${c.to}`, c.rate), primary: 'Copy Result', run: { kind: 'copy', text: `${v} ${c.to}`, label: `${v} ${c.to}` } as Run }
      })
    })
  }
  const color = parseColor(query)
  if (color) out.push({ title: 'Color', rows: [{ html: card(color.hex, 'HEX', color.rgb, color.hsl, color.hex), primary: 'Copy HEX', run: { kind: 'copy', text: color.hex, label: color.hex } }] })

  const results: (Row & { score: number })[] = []
  const pre = /^(\S+)\s+(.+)$/.exec(query)
  const p = pre && PREFIX[pre[1].toLowerCase()]
  if (p && pre) {
    const title = p[0] === 'Claude' ? `Ask Claude “${pre[2]}”` : `Search ${p[0]} for “${pre[2]}”`
    results.push({ score: 3000, html: row(glyph(p[2], p[3]), title, '', 'Web'), primary: 'Open in Browser', run: { kind: 'url', url: p[1] + encodeURIComponent(pre[2]) } })
  }
  for (const [name, a, b] of APPS) {
    const m = fuzzyMatch(query, name)
    if (m) results.push({ score: m.score, ...appRow(name, a, b, m.indices) })
  }
  for (const c of COMMANDS) {
    const m = matchAny(query, c.title, c.keywords)
    if (m) results.push({ score: m.score - 10, html: row(glyph(c.icon, c.tint), c.title, c.subtitle, 'Command', m.indices), primary: 'Run Command', run: toRun(c.run) })
  }
  results.sort((x, y) => y.score - x.score)
  if (results.length) out.push({ title: 'Results', rows: results.slice(0, 8) })
  const short = query.length > 24 ? query.slice(0, 23) + '…' : query
  out.push({
    title: `Use “${short}” with…`,
    rows: [
      { html: row(glyph('globe', 'blue'), `Search Google for “${query}”`, '', 'Web'), primary: 'Open in Browser', run: { kind: 'url', url: 'https://www.google.com/search?q=' + encodeURIComponent(query) } },
      { html: row(glyph('sparkle', 'orange'), `Ask Claude “${query}”`, '', 'Web'), primary: 'Open in Browser', run: { kind: 'url', url: 'https://claude.ai/new?q=' + encodeURIComponent(query) } }
    ]
  })
  return out
}

function appRow(name: string, a: string, b: string, idx?: number[]): Row {
  return { html: row(tile(name[0], a, b), name, '', 'Application', idx), primary: 'Open Application', run: { kind: 'toast', text: `🚀 ${name} would open now` } }
}

function toRun(spec: string): Run {
  const [kind, ...rest] = spec.split(':')
  const value = rest.join(':')
  if (kind === 'mode') return { kind: 'mode', mode: value as Mode }
  if (kind === 'query') return { kind: 'query', q: value }
  return { kind: 'toast', text: value }
}

// ---------------------------------------------------------------------------

export function mountDemo(root: HTMLElement): void {
  root.innerHTML = `
    <div class="d-head">
      <span class="d-lead"></span>
      <input class="d-input" spellcheck="false" autocomplete="off" aria-label="Try Summon — type something" />
      <span class="d-hint">try typing</span>
    </div>
    <div class="d-body" role="listbox"></div>
    <div class="d-foot">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6bff"/><stop offset=".55" stop-color="#d94fd0"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#dg)"/><path d="M12 4.6c.55 3.9 2.9 6.25 6.8 6.8-3.9.55-6.25 2.9-6.8 6.8-.55-3.9-2.9-6.25-6.8-6.8 3.9-.55 6.25-2.9 6.8-6.8Z" fill="#fff"/></svg>
      <span class="d-status">Summon</span>
      <span class="d-primary"></span>
    </div>`
  const input = root.querySelector<HTMLInputElement>('.d-input')!
  const body = root.querySelector<HTMLElement>('.d-body')!
  const lead = root.querySelector<HTMLElement>('.d-lead')!
  const status = root.querySelector<HTMLElement>('.d-status')!
  const primary = root.querySelector<HTMLElement>('.d-primary')!
  const hint = root.querySelector<HTMLElement>('.d-hint')!

  let mode: Mode = 'root'
  let selected = 0
  let rows: Row[] = []
  let toastTimer = 0
  let auto = true

  const placeholders: Record<Mode, string> = {
    root: 'Search apps, commands, maths…',
    emoji: 'Search emoji…',
    clipboard: 'Search clipboard history…'
  }

  // Scroll only the result list — scrollIntoView would drag the whole page to the demo.
  function keepSelectedVisible(): void {
    const el = body.querySelector<HTMLElement>('.is-sel')
    if (!el) return
    const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop
    const bottom = top + el.offsetHeight
    if (top < body.scrollTop) body.scrollTop = Math.max(0, top - 36)
    else if (bottom > body.scrollTop + body.clientHeight) body.scrollTop = bottom - body.clientHeight + 8
  }

  function toast(text: string): void {
    status.textContent = text
    status.classList.add('d-toast')
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      status.textContent = 'Summon'
      status.classList.remove('d-toast')
    }, 2600)
  }

  function setMode(next: Mode, q = ''): void {
    mode = next
    input.value = q
    input.placeholder = placeholders[next]
    lead.innerHTML =
      next === 'root'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
        : `<button class="d-back" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ICON.back}</svg></button><span class="d-chip">${next === 'emoji' ? 'Emoji' : 'Clipboard History'}</span>`
    lead.querySelector('.d-back')?.addEventListener('click', () => {
      stopAuto()
      setMode('root')
      input.focus()
    })
    selected = 0
    render()
  }

  function run(r: Run): void {
    switch (r.kind) {
      case 'toast':
        return toast(r.text)
      case 'copy':
        void navigator.clipboard?.writeText(r.text).catch(() => {})
        return toast(`✓ Copied ${r.label}`)
      case 'url':
        window.open(r.url, '_blank', 'noopener')
        return
      case 'mode':
        setMode(r.mode)
        input.focus()
        return
      case 'query':
        input.value = r.q
        input.focus()
        selected = 0
        render()
    }
  }

  function render(): void {
    const q = input.value
    if (mode === 'root' && q.startsWith(':')) return setMode('emoji', q.slice(1))
    if (mode === 'emoji') return renderEmoji(q)
    let sections: Section[]
    if (mode === 'clipboard') {
      const t = q.trim().toLowerCase()
      const list = CLIPS.filter((c) => !t || c.text.toLowerCase().includes(t))
      sections = [
        {
          title: t ? `${list.length} match${list.length === 1 ? '' : 'es'}` : 'Recently copied',
          rows: list.map((c) => ({
            html: row(c.icon, c.text.split('\n')[0], '', c.ago),
            primary: 'Paste to Active App',
            run: { kind: 'copy', text: c.text, label: 'to your clipboard' } as Run
          }))
        }
      ]
    } else {
      sections = rootSections(q)
    }
    rows = sections.flatMap((s) => s.rows)
    if (selected >= rows.length) selected = Math.max(0, rows.length - 1)
    let i = 0
    body.innerHTML = sections
      .filter((s) => s.rows.length)
      .map(
        (s) =>
          `<div class="d-sec">${esc(s.title)}</div>` +
          s.rows
            .map((r) => {
              const n = i++
              const isCard = r.html.startsWith('<div class="d-card-side')
              return `<div class="${isCard ? 'd-card' : 'd-row'}${n === selected ? ' is-sel' : ''}" data-i="${n}" role="option">${r.html}</div>`
            })
            .join('')
      )
      .join('')
    primary.innerHTML = rows[selected] ? `${esc(rows[selected].primary)} <kbd>↵</kbd>` : ''
    keepSelectedVisible()
  }

  let emojiList: typeof EMOJI = []
  function renderEmoji(q: string): void {
    const t = q.trim().toLowerCase()
    emojiList = t
      ? EMOJI.filter((e) => (fuzzyMatch(t, e.name)?.score ?? 0) >= 500 || e.keywords.split(' ').some((k) => k.startsWith(t)))
      : EMOJI.slice(0, 60)
    if (selected >= emojiList.length) selected = Math.max(0, emojiList.length - 1)
    body.innerHTML = emojiList.length
      ? `<div class="d-sec">${t ? `${emojiList.length} results` : 'All emoji'}</div><div class="d-emoji">${emojiList
          .map((e, n) => `<button class="${n === selected ? 'is-sel' : ''}" data-i="${n}" title="${esc(e.name)}" tabindex="-1">${e.char}</button>`)
          .join('')}</div>`
      : '<div class="d-empty">No emoji found</div>'
    rows = emojiList.map((e) => ({ html: '', primary: 'Paste Emoji', run: { kind: 'copy', text: e.char, label: `${e.char} ${e.name}` } }))
    primary.innerHTML = rows.length ? `Paste Emoji <kbd>↵</kbd>` : ''
    status.textContent = status.classList.contains('d-toast') ? status.textContent : (emojiList[selected]?.name ?? 'Emoji')
    keepSelectedVisible()
  }

  input.addEventListener('input', () => {
    stopAuto()
    selected = 0
    render()
  })
  input.addEventListener('keydown', (e) => {
    stopAuto()
    const cols = 10
    const move = (d: number, wrap = true): void => {
      e.preventDefault()
      if (!rows.length) return
      selected = wrap ? (selected + d + rows.length) % rows.length : Math.max(0, Math.min(rows.length - 1, selected + d))
      render()
    }
    if (mode === 'emoji' && e.key === 'ArrowRight') return move(1, false)
    if (mode === 'emoji' && e.key === 'ArrowLeft') return move(-1, false)
    if (e.key === 'ArrowDown') return move(mode === 'emoji' ? cols : 1, mode !== 'emoji')
    if (e.key === 'ArrowUp') return move(mode === 'emoji' ? -cols : -1, mode !== 'emoji')
    if (e.key === 'Enter') {
      e.preventDefault()
      if (rows[selected]) run(rows[selected].run)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (mode !== 'root') setMode('root')
      else {
        input.value = ''
        render()
      }
    } else if (e.key === 'Backspace' && !input.value && mode !== 'root') {
      e.preventDefault()
      setMode('root')
    }
  })
  body.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
    if (!el) return
    stopAuto()
    selected = Number(el.dataset.i)
    render()
    if (rows[selected]) run(rows[selected].run)
  })
  body.addEventListener('mousemove', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
    if (!el || auto) return
    const n = Number(el.dataset.i)
    if (n !== selected) {
      selected = n
      render()
    }
  })
  root.addEventListener('pointerdown', () => stopAuto())

  // --- Autoplay: type a few examples until the visitor takes over -------------
  const SCRIPT = ['vsc', '20% of 150 + 2^8', '10 km to miles', 'timer 25m focus', '#ff5c8a', 'yt lofi beats', ':party', 'spot']
  let autoTimer = 0
  function stopAuto(): void {
    if (!auto) return
    auto = false
    window.clearTimeout(autoTimer)
    hint.textContent = ''
    root.classList.remove('is-auto')
  }
  function typeOut(text: string, done: () => void): void {
    let n = 0
    const step = (): void => {
      if (!auto) return
      n++
      const partial = text.slice(0, n)
      if (mode !== 'root' && !partial.startsWith(':')) setMode('root')
      if (mode === 'emoji') input.value = partial.slice(1)
      else input.value = partial
      selected = 0
      render()
      autoTimer = window.setTimeout(n < text.length ? step : done, n < text.length ? 55 + Math.random() * 60 : 2300)
    }
    step()
  }
  function play(i: number): void {
    if (!auto) return
    setMode('root')
    autoTimer = window.setTimeout(() => typeOut(SCRIPT[i % SCRIPT.length], () => play(i + 1)), 350)
  }

  setMode('root')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) stopAuto()
  else {
    root.classList.add('is-auto')
    // Start when the bar scrolls into view.
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect()
        play(0)
      }
    })
    io.observe(root)
  }
}

const el = document.getElementById('demo')
if (el) mountDemo(el)
