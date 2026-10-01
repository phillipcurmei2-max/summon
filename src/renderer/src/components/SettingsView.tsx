import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { SearchEngine, Settings, ThemePref } from '@shared/types'
import { Kbd, Logo } from './Icon'

interface Props {
  settings: Settings
  hotkeyOk: boolean
  version: string
  appCount: number
  clipCount: number
  indexing: boolean
  onChange(patch: Partial<Settings>): Promise<boolean>
  onClearClipboard(): void
  onReindex(): void
  onQuit(): void
}

const CODE_KEYS: Record<string, string> = {
  Space: 'Space',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Enter: 'Enter',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Insert: 'Insert',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown'
}

/** Turns a keydown into an Electron accelerator ("Ctrl+Shift+K"), or null for bare modifiers. */
function toAccelerator(e: KeyboardEvent): string | null {
  let key: string | undefined
  if (/^Key[A-Z]$/.test(e.code)) key = e.code.slice(3)
  else if (/^Digit\d$/.test(e.code)) key = e.code.slice(5)
  else if (/^F\d{1,2}$/.test(e.code)) key = e.code
  else key = CODE_KEYS[e.code]
  if (!key) return null
  const mods = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Super'].filter(Boolean)
  // A global shortcut without a modifier would swallow that key everywhere (F-keys excepted).
  if (!mods.length && !/^F\d/.test(key)) return null
  return [...mods, key].join('+')
}

function HotkeyRecorder({ value, onChange }: { value: string; onChange(v: string): Promise<boolean> }): React.JSX.Element {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!recording) return
    void window.summon.suspendHotkey(true)
    const onKey = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        setRecording(false)
        return
      }
      const accel = toAccelerator(e)
      if (!accel) return
      setRecording(false)
      void onChange(accel).then((ok) => setError(ok ? null : `${accel.replace(/\+/g, ' + ')} is already used by another app.`))
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      void window.summon.suspendHotkey(false)
    }
  }, [recording, onChange])

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => {
          setError(null)
          setRecording((r) => !r)
        }}
        className={`flex h-8 items-center gap-1 rounded-lg border px-2 text-[13px] ${
          recording ? 'border-accent text-accent' : 'border-line bg-raised text-fg hover:bg-hover'
        }`}
      >
        {recording ? (
          <span className="px-1">Press a shortcut… (Esc to cancel)</span>
        ) : (
          value.split('+').map((k) => <Kbd key={k}>{k}</Kbd>)
        )}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange(v: boolean): void; label: string }): React.JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-active'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${checked ? 'left-[18px]' : 'left-0.5'}`}
      />
    </button>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange
}: {
  value: T
  options: { value: T; label: string }[]
  onChange(v: T): void
}): React.JSX.Element {
  return (
    <div className="flex rounded-lg bg-active p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`h-7 rounded-md px-3 text-[13px] ${o.value === value ? 'bg-raised text-fg shadow-sm' : 'text-muted hover:text-fg'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="min-w-0">
        <div className="text-[14px] text-fg">{title}</div>
        {detail && <div className="mt-0.5 text-[12.5px] text-faint">{detail}</div>}
      </div>
      {children}
    </div>
  )
}

const button = 'h-8 rounded-lg border border-line bg-raised px-3 text-[13px] text-fg hover:bg-hover disabled:opacity-50'

export function SettingsView(props: Props): React.JSX.Element {
  const { settings, hotkeyOk, onChange } = props
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="scroll h-full overflow-y-auto px-6 pb-4">
      {!hotkeyOk && (
        <div className="mt-4 flex gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-fg">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
          <span>
            <b>{settings.hotkey}</b> is taken by another app (PowerToys Run uses it too). Pick a different shortcut below.
          </span>
        </div>
      )}
      <div className="divide-y divide-line">
        <Row title="Summon shortcut" detail="Press it anywhere to open the command bar.">
          <HotkeyRecorder value={settings.hotkey} onChange={(hotkey) => onChange({ hotkey })} />
        </Row>
        <Row title="Launch at login" detail="Start Summon quietly in the tray when Windows starts.">
          <Toggle label="Launch at login" checked={settings.launchAtLogin} onChange={(v) => void onChange({ launchAtLogin: v })} />
        </Row>
        <Row
          title="Clipboard history"
          detail={`Keeps text you copy on this PC only. Password managers are skipped. ${props.clipCount} item${props.clipCount === 1 ? '' : 's'} saved.`}
        >
          <div className="flex items-center gap-3">
            <button
              className={button}
              disabled={!props.clipCount}
              onClick={() => {
                if (!confirmClear) return setConfirmClear(true)
                props.onClearClipboard()
                setConfirmClear(false)
              }}
              onBlur={() => setConfirmClear(false)}
            >
              {confirmClear ? 'Click again to clear' : 'Clear'}
            </button>
            <Toggle label="Clipboard history" checked={settings.clipboardHistory} onChange={(v) => void onChange({ clipboardHistory: v })} />
          </div>
        </Row>
        <Row title="Paste automatically" detail="Choosing a clipboard item or emoji pastes it into the app you were using.">
          <Toggle label="Paste automatically" checked={settings.autoPaste} onChange={(v) => void onChange({ autoPaste: v })} />
        </Row>
        <Row title="Web search">
          <Segmented<SearchEngine>
            value={settings.searchEngine}
            onChange={(v) => void onChange({ searchEngine: v })}
            options={[
              { value: 'google', label: 'Google' },
              { value: 'duckduckgo', label: 'DuckDuckGo' },
              { value: 'bing', label: 'Bing' }
            ]}
          />
        </Row>
        <Row title="Appearance">
          <Segmented<ThemePref>
            value={settings.theme}
            onChange={(v) => void onChange({ theme: v })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' }
            ]}
          />
        </Row>
        <Row title="App index" detail={props.indexing ? 'Scanning your apps…' : `${props.appCount} apps and Store apps found.`}>
          <button className={button} disabled={props.indexing} onClick={props.onReindex}>
            Rescan
          </button>
        </Row>
        <div className="flex items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <div className="text-[14px] font-medium text-fg">Summon {props.version}</div>
              <div className="text-[12.5px] text-faint">Everything stays on your PC. No accounts, no tracking.</div>
            </div>
          </div>
          <button className={button} onClick={props.onQuit}>
            Quit Summon
          </button>
        </div>
      </div>
    </div>
  )
}
