import { app, clipboard } from 'electron'
import { execFile } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ClipEntry } from '@shared/types'
import { JsonFile } from './store'

const MAX_ENTRIES = 300
const MAX_CHARS = 200_000
const POLL_MS = 600

// Password managers (KeePass, 1Password, Bitwarden…) tag secrets with these
// clipboard formats so history tools skip them. We honour that.
const PRIVATE_FORMATS = ['ExcludeClipboardContentFromMonitorProcessing', 'Clipboard Viewer Ignore']

async function isPrivate(): Promise<boolean> {
  for (const format of PRIVATE_FORMATS) {
    try {
      if (await clipboard.has(`electron application/osclipboard;format="${format}"`)) return true
    } catch {
      // Unknown format names just mean "not present".
    }
  }
  return false
}

/**
 * Watches the system clipboard for text and keeps a searchable history on disk.
 * Windows has no reliable change event we can reach from Electron, so we poll —
 * reading text a couple of times a second is effectively free.
 */
export class ClipboardHistory {
  private readonly file = new JsonFile<ClipEntry[]>('clipboard.json', [])
  private timer: NodeJS.Timeout | null = null
  private last = ''
  private polling = false

  constructor(private readonly onChange: (entries: ClipEntry[]) => void) {}

  get entries(): ClipEntry[] {
    return this.file.data
  }

  start(): void {
    if (this.timer) return
    // Whatever is on the clipboard at launch isn't "new", so don't record it.
    this.polling = true
    void clipboard
      .readText()
      .then((text) => (this.last = text))
      .catch(() => {})
      .finally(() => (this.polling = false))
    this.timer = setInterval(() => void this.poll(), POLL_MS)
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  private async poll(): Promise<void> {
    if (this.polling) return
    this.polling = true
    try {
      const text = await clipboard.readText()
      if (text === this.last) return
      this.last = text
      if (!text.trim() || text.length > MAX_CHARS || (await isPrivate())) return
      this.add(text)
    } catch {
      // Another app can hold the clipboard open for a moment; try again next tick.
    } finally {
      this.polling = false
    }
  }

  private add(text: string): void {
    const rest = this.file.data.filter((e) => e.text !== text)
    const entry: ClipEntry = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text, at: Date.now() }
    this.file.data = [entry, ...rest].slice(0, MAX_ENTRIES)
    this.file.save()
    this.onChange(this.file.data)
  }

  remove(id: string): void {
    this.file.data = this.file.data.filter((e) => e.id !== id)
    this.file.save()
    this.onChange(this.file.data)
  }

  clear(): void {
    this.file.data = []
    this.file.save(0)
    this.onChange(this.file.data)
  }

  flush(): void {
    this.file.flush()
  }
}

let pasteScript: string | null = null

/**
 * Presses Ctrl+V in whichever window has focus. Summon has already hidden
 * itself by now, so that's the app the user was in before summoning.
 * WScript's SendKeys starts far faster than PowerShell.
 */
export function sendPasteKeystroke(): Promise<boolean> {
  if (!pasteScript) {
    pasteScript = join(app.getPath('userData'), 'paste.vbs')
    writeFileSync(pasteScript, 'CreateObject("WScript.Shell").SendKeys "^v"\r\n')
  }
  const script = pasteScript
  return new Promise((resolve) => {
    execFile('wscript.exe', ['//B', '//Nologo', script], { windowsHide: true, timeout: 5000 }, (err) =>
      resolve(!err)
    )
  })
}
