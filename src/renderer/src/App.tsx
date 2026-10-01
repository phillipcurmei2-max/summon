import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, Copy, CornerDownLeft, Loader2, Search } from 'lucide-react'
import {
  DEFAULT_SETTINGS,
  type Catalog,
  type ClipEntry,
  type Settings,
  type TimerInfo,
  type UsageStat
} from '@shared/types'
import { ActionPanel } from './components/ActionPanel'
import { ClipboardView } from './components/ClipboardView'
import { EMOJI_COLS, EmojiGrid } from './components/EmojiGrid'
import { Kbd, Logo } from './components/Icon'
import { ResultList } from './components/ResultList'
import { SettingsView } from './components/SettingsView'
import { clipboardSections } from './lib/clips'
import { formatDuration } from './lib/duration'
import { EMOJI, type Emoji } from './lib/emoji'
import { fuzzyMatch } from './lib/fuzzy'
import { resetPointer } from './lib/pointer'
import { search } from './lib/search'
import type { Action, Item, Mode, Ops } from './lib/types'

interface Confirm {
  itemKey: string
  actionId: string
}

const PLACEHOLDER: Record<Mode, string> = {
  root: 'Search apps, files and commands, or type some maths…',
  clipboard: 'Search clipboard history…',
  emoji: 'Search emoji…',
  settings: ''
}

const MODE_LABEL: Record<Mode, string> = {
  root: '',
  clipboard: 'Clipboard History',
  emoji: 'Emoji',
  settings: 'Settings'
}

const EXAMPLES = ['20% of 150', '10 km to miles', 'timer 5m tea', '#8b6dff', 'yt lofi beats', ':party']

function filterEmoji(query: string, usage: Record<string, UsageStat>): Emoji[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    const used = EMOJI.filter((e) => usage[`emoji:${e.char}`]).sort(
      (a, b) => usage[`emoji:${b.char}`].last - usage[`emoji:${a.char}`].last
    )
    const usedSet = new Set(used.slice(0, 24))
    return [...usedSet, ...EMOJI.filter((e) => !usedSet.has(e))]
  }
  const scored: { e: Emoji; score: number }[] = []
  for (const e of EMOJI) {
    let score = fuzzyMatch(q, e.name)?.score ?? 0
    if (score < 500) score = 0
    for (const word of e.keywords.split(' ')) {
      if (word.startsWith(q)) score = Math.max(score, word === q ? 850 : 700)
    }
    if (score) scored.push({ e, score })
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.e)
}

export function App(): React.JSX.Element {
  const [ready, setReady] = useState(false)
  const [version, setVersion] = useState('')
  const [catalog, setCatalog] = useState<Catalog>({ apps: [], recent: [], indexing: true })
  const [clips, setClips] = useState<ClipEntry[]>([])
  const [usage, setUsage] = useState<Record<string, UsageStat>>({})
  const [timers, setTimers] = useState<TimerInfo[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [hotkeyOk, setHotkeyOk] = useState(true)
  const [dark, setDark] = useState(true)
  const [welcome, setWelcome] = useState(false)

  const [mode, setModeState] = useState<Mode>('root')
  const [query, setQueryState] = useState('')
  const [selected, setSelected] = useState(0)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionIndex, setActionIndex] = useState(0)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<number>(0)

  const flash = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  /** Focuses the search field; `select` highlights existing text so typing replaces it. */
  const focusInput = useCallback((select = false) => {
    requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return
      input.focus()
      if (select) input.select()
      else input.setSelectionRange(input.value.length, input.value.length)
    })
  }, [])

  const switchMode = useCallback(
    (next: Mode, initialQuery = '') => {
      setModeState(next)
      setQueryState(initialQuery)
      setSelected(0)
      setActionsOpen(false)
      setConfirm(null)
      focusInput()
    },
    [focusInput]
  )

  const setQuery = useCallback(
    (q: string) => {
      // Typing ":" jumps straight into the emoji picker.
      if (mode === 'root' && q.startsWith(':')) return switchMode('emoji', q.slice(1))
      setQueryState(q)
      setSelected(0)
      setConfirm(null)
    },
    [mode, switchMode]
  )

  // --- Boot + events from the main process --------------------------------
  useEffect(() => {
    let alive = true
    void window.summon.boot().then((b) => {
      if (!alive) return
      setVersion(b.version)
      setCatalog(b.catalog)
      setClips(b.clipboard)
      setUsage(b.usage)
      setTimers(b.timers)
      setSettings(b.settings)
      setHotkeyOk(b.hotkeyOk)
      setDark(b.dark)
      setWelcome(b.firstRun)
      setReady(true)
    })
    const offs = [
      window.summon.onCatalog(setCatalog),
      window.summon.onClipboard(setClips),
      window.summon.onUsage(setUsage),
      window.summon.onTimers(setTimers),
      window.summon.onSettings(setSettings),
      window.summon.onTheme(setDark),
      window.summon.onShow((reason, view) => {
        resetPointer()
        switchMode(view ?? 'root')
        focusInput(true)
        if (reason === 'first-run') setWelcome(true)
        setNow(Date.now())
        panelRef.current?.animate(
          [
            { opacity: 0, transform: 'scale(.985) translateY(-6px)' },
            { opacity: 1, transform: 'none' }
          ],
          { duration: 150, easing: 'cubic-bezier(.2,.8,.2,1)' }
        )
      }),
      window.summon.onHidden(() => {
        setModeState('root')
        setQueryState('')
        setSelected(0)
        setActionsOpen(false)
        setConfirm(null)
        setToast(null)
      })
    ]
    const onFocus = (): void => inputRef.current?.focus()
    window.addEventListener('focus', onFocus)
    return () => {
      alive = false
      offs.forEach((off) => off())
      window.removeEventListener('focus', onFocus)
    }
  }, [switchMode, focusInput])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Live countdowns and "copied 2 min ago" labels.
  useEffect(() => {
    // Refresh straight away so a just-started timer never shows a stale countdown.
    setNow(Date.now())
    if (!timers.length && mode !== 'clipboard') return
    const id = window.setInterval(() => setNow(Date.now()), timers.length ? 1000 : 30_000)
    return () => window.clearInterval(id)
  }, [timers, mode])

  // --- What results can do -------------------------------------------------
  const ops: Ops = useMemo(
    () => ({
      open: (target, usageId) => {
        void window.summon.open(target, usageId).then((r) => {
          if (!r.ok) flash(`Couldn’t open that: ${r.error ?? 'unknown error'}`)
        })
      },
      copy: (text) => void window.summon.copy(text),
      paste: (text) => void window.summon.paste(text),
      reveal: (path) => window.summon.reveal(path),
      runAsAdmin: (path) => window.summon.runAsAdmin(path),
      setMode: (m) => switchMode(m),
      setQuery: (q) => {
        setQueryState(q)
        setSelected(0)
        focusInput()
      },
      startTimer: (ms, label) => {
        void window.summon.startTimer(ms, label).then(() => {
          setQueryState('')
          setSelected(0)
          flash(`Timer started — ${formatDuration(ms)}${label ? ` · ${label}` : ''}`)
        })
      },
      cancelTimer: (id) => {
        window.summon.cancelTimer(id)
        flash('Timer cancelled')
      },
      recordUse: (id) => window.summon.recordUse(id),
      deleteClip: (id) => window.summon.deleteClip(id),
      clearClipboard: () => {
        window.summon.clearClipboard()
        flash('Clipboard history cleared')
      },
      reindex: () => {
        window.summon.reindex()
        flash('Rescanning your apps…')
      },
      quit: () => window.summon.quit()
    }),
    [flash, focusInput, switchMode]
  )

  // --- Results for the current mode ------------------------------------------
  const sections = useMemo(() => {
    if (mode === 'root') {
      return search({
        query,
        apps: catalog.apps,
        recent: catalog.recent,
        usage,
        timers,
        engine: settings.searchEngine,
        now,
        ops
      })
    }
    if (mode === 'clipboard') return clipboardSections(clips, query, ops, now)
    return []
  }, [mode, query, catalog, usage, timers, settings.searchEngine, now, ops, clips])

  const emojis = useMemo(() => (mode === 'emoji' ? filterEmoji(query, usage) : []), [mode, query, usage])
  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])

  const current: Item | undefined = useMemo(() => {
    if (mode !== 'emoji') return flat[selected]
    const emoji = emojis[selected]
    if (!emoji) return undefined
    const use = (): void => window.summon.recordUse(`emoji:${emoji.char}`)
    return {
      key: `emoji:${emoji.char}`,
      title: `${emoji.char}  ${emoji.name}`,
      icon: { kind: 'emoji', char: emoji.char },
      score: 0,
      actions: [
        { id: 'paste', title: 'Paste Emoji', icon: CornerDownLeft, run: () => (use(), ops.paste(emoji.char)) },
        { id: 'copy', title: 'Copy Emoji', icon: Copy, run: () => (use(), ops.copy(emoji.char)) }
      ]
    }
  }, [mode, flat, selected, emojis, ops])

  const count = mode === 'emoji' ? emojis.length : flat.length
  useEffect(() => {
    if (selected >= count && count > 0) setSelected(count - 1)
  }, [count, selected])

  const runAction = useCallback(
    (item: Item | undefined, index: number) => {
      const action: Action | undefined = item?.actions[index]
      if (!item || !action) return
      if (action.confirm && !(confirm?.itemKey === item.key && confirm.actionId === action.id)) {
        setConfirm({ itemKey: item.key, actionId: action.id })
        if (index === 0) setActionsOpen(false)
        return
      }
      setConfirm(null)
      setActionsOpen(false)
      setWelcome(false)
      action.run()
    },
    [confirm]
  )

  // --- Keyboard --------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (actionsOpen) return setActionsOpen(false)
        if (confirm) return setConfirm(null)
        if (mode !== 'root') return switchMode('root')
        if (query) return setQuery('')
        return window.summon.hide()
      }
      if (mode === 'settings') return

      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (current && current.actions.length > 1) {
          setActionsOpen((open) => !open)
          setActionIndex(0)
        }
        return
      }
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        return switchMode('settings')
      }

      if (actionsOpen && current) {
        const n = current.actions.length
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          setActionIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
          if (confirm) setConfirm(null)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          runAction(current, actionIndex)
        }
        return
      }

      const step = (delta: number, wrap: boolean): void => {
        e.preventDefault()
        if (!count) return
        setConfirm(null)
        setSelected((i) => {
          const next = i + delta
          if (wrap) return (next + count) % count
          return Math.max(0, Math.min(count - 1, next))
        })
      }
      if (mode === 'emoji') {
        if (e.key === 'ArrowRight') return step(1, false)
        if (e.key === 'ArrowLeft') return step(-1, false)
        if (e.key === 'ArrowDown') return step(EMOJI_COLS, false)
        if (e.key === 'ArrowUp') return step(-EMOJI_COLS, false)
      } else {
        if (e.key === 'ArrowDown') return step(1, true)
        if (e.key === 'ArrowUp') return step(-1, true)
      }
      if (e.key === 'PageDown') return step(8, false)
      if (e.key === 'PageUp') return step(-8, false)

      if (e.key === 'Enter') {
        e.preventDefault()
        return runAction(current, e.ctrlKey ? 1 : 0)
      }
      if (e.key === 'Backspace' && !query && mode !== 'root') {
        e.preventDefault()
        return switchMode('root')
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        return
      }
      // Per-action shortcuts such as Ctrl+O (open file location).
      if (current && (e.ctrlKey || e.key === 'Delete')) {
        const index = current.actions.findIndex(
          (a) =>
            a.shortcut &&
            a.shortcut.key.toLowerCase() === e.key.toLowerCase() &&
            !!a.shortcut.ctrl === e.ctrlKey &&
            !!a.shortcut.shift === e.shiftKey
        )
        if (index >= 0) {
          e.preventDefault()
          runAction(current, index)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [actionsOpen, actionIndex, confirm, count, current, mode, query, runAction, setQuery, switchMode])

  const updateSettings = useCallback(async (patch: Partial<Settings>): Promise<boolean> => {
    const result = await window.summon.setSettings(patch)
    setSettings(result.settings)
    // A rejected shortcut leaves the previous one active, so only success changes the warning.
    if (patch.hotkey !== undefined && result.hotkeyOk) setHotkeyOk(true)
    return result.hotkeyOk
  }, [])

  // --- Render ----------------------------------------------------------------
  const primary = current?.actions[0]
  const confirmingPrimary = !!confirm && !!current && confirm.itemKey === current.key && confirm.actionId === primary?.id
  const status =
    toast ??
    (mode === 'root'
      ? catalog.indexing && !catalog.apps.length
        ? 'Finding your apps…'
        : 'Summon'
      : mode === 'clipboard'
        ? `${clips.length} item${clips.length === 1 ? '' : 's'} · stored on this PC`
        : mode === 'emoji'
          ? (emojis[selected]?.name ?? 'Emoji')
          : 'Settings')

  let body: React.ReactNode
  if (mode === 'settings') {
    body = (
      <SettingsView
        settings={settings}
        hotkeyOk={hotkeyOk}
        version={version}
        appCount={catalog.apps.length}
        clipCount={clips.length}
        indexing={catalog.indexing}
        onChange={updateSettings}
        onClearClipboard={ops.clearClipboard}
        onReindex={ops.reindex}
        onQuit={ops.quit}
      />
    )
  } else if (mode === 'emoji') {
    body = (
      <EmojiGrid
        emojis={emojis}
        selected={selected}
        heading={query ? `${emojis.length} result${emojis.length === 1 ? '' : 's'}` : 'All emoji'}
        onHover={setSelected}
        onRun={(i) => {
          const e = emojis[i]
          if (!e) return
          window.summon.recordUse(`emoji:${e.char}`)
          ops.paste(e.char)
        }}
      />
    )
  } else if (mode === 'clipboard') {
    body = (
      <ClipboardView
        sections={sections}
        entries={clips}
        selected={selected}
        confirmKey={confirmingPrimary ? confirm!.itemKey : null}
        enabled={settings.clipboardHistory}
        now={now}
        onHover={setSelected}
        onRun={(i) => runAction(flat[i], 0)}
      />
    )
  } else {
    body = (
      <div className="flex h-full flex-col">
        {!query && !hotkeyOk && (
          <button
            onClick={() => switchMode('settings')}
            className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-left text-[13px] text-fg"
          >
            <AlertTriangle size={16} className="shrink-0 text-danger" />
            <span className="flex-1">
              <b>{settings.hotkey}</b> is already used by another app, so Summon can’t use it. Click to choose a new shortcut.
            </span>
          </button>
        )}
        {!query && welcome && hotkeyOk && (
          <div className="mx-4 mt-3 rounded-xl border border-line bg-hover px-4 py-3">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-fg">
              <Logo size={18} /> Welcome to Summon
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Press <Kbd>{settings.hotkey.replace('+', ' + ')}</Kbd> from anywhere to open this bar. Then just type. Try one of
              these:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex)
                    focusInput()
                  }}
                  className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[12px] text-fg hover:border-accent/60"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1">
          <ResultList
            sections={sections}
            selected={selected}
            confirmKey={confirmingPrimary ? confirm!.itemKey : null}
            onHover={setSelected}
            onRun={(i) => runAction(flat[i], 0)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4" onMouseDown={(e) => e.target === e.currentTarget && window.summon.hide()}>
      <div
        ref={panelRef}
        className={`panel relative flex h-full flex-col overflow-hidden rounded-2xl bg-panel ${ready ? '' : 'opacity-0'}`}
      >
        <header className="flex h-14 shrink-0 items-center gap-3 px-4">
          {mode === 'root' ? (
            <Search size={19} className="shrink-0 text-faint" />
          ) : (
            <button
              onClick={() => switchMode('root')}
              aria-label="Back"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-active text-muted hover:text-fg"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {mode !== 'root' && (
            <span className="shrink-0 rounded-md bg-accent/15 px-2 py-0.5 text-[12px] font-medium text-accent">
              {MODE_LABEL[mode]}
            </span>
          )}
          {mode === 'settings' ? (
            <span className="flex-1" />
          ) : (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDER[mode]}
              spellCheck={false}
              autoFocus
              className="h-full min-w-0 flex-1 bg-transparent text-[18px] text-fg outline-none"
            />
          )}
          {catalog.indexing && mode === 'root' && <Loader2 size={16} className="shrink-0 animate-spin text-faint" />}
        </header>
        <div className="h-px shrink-0 bg-line" />
        <main className="min-h-0 flex-1">{body}</main>
        <footer className="flex h-10 shrink-0 items-center gap-2 border-t border-line px-3 text-[12px] text-muted">
          <Logo size={16} />
          <span className="truncate">{status}</span>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {primary && mode !== 'settings' && (
              <button
                onClick={() => runAction(current, 0)}
                className={`flex items-center gap-1.5 ${confirmingPrimary ? 'font-medium text-danger' : 'text-fg'}`}
              >
                {confirmingPrimary ? `Confirm ${primary.title}` : primary.title} <Kbd>↵</Kbd>
              </button>
            )}
            {current && current.actions.length > 1 && mode !== 'settings' && (
              <>
                <span className="h-4 w-px bg-line" />
                <button
                  onClick={() => {
                    setActionsOpen((o) => !o)
                    setActionIndex(0)
                  }}
                  className="flex items-center gap-1.5 text-muted hover:text-fg"
                >
                  Actions <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </button>
              </>
            )}
            {mode === 'settings' && (
              <span className="flex items-center gap-1.5">
                Back <Kbd>Esc</Kbd>
              </span>
            )}
          </div>
        </footer>
        {actionsOpen && current && (
          <ActionPanel
            title={current.title}
            actions={current.actions}
            selected={actionIndex}
            confirmId={confirm?.itemKey === current.key ? confirm.actionId : null}
            onHover={setActionIndex}
            onRun={(i) => runAction(current, i)}
          />
        )}
      </div>
    </div>
  )
}
