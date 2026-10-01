import { app, nativeImage, shell } from 'electron'
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import type { AppEntry, RecentFile } from '@shared/types'

const SHORTCUT_EXTS = new Set(['.lnk', '.url', '.appref-ms'])
const ICON_PX = 48

// Start-menu clutter nobody wants to launch from a command bar.
const JUNK = /\b(uninstall|uninst|readme|read me|release notes|changelog|license|licence|documentation|manuals?|what's new|website|support|help and support)\b/i

function startMenuRoots(): string[] {
  const programData = process.env['ProgramData'] ?? 'C:\\ProgramData'
  return [
    join(programData, 'Microsoft\\Windows\\Start Menu\\Programs'),
    join(app.getPath('appData'), 'Microsoft\\Windows\\Start Menu\\Programs')
  ]
}

async function walk(dir: string, depth: number, out: string[]): Promise<void> {
  if (depth > 5) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, depth + 1, out)
    else if (SHORTCUT_EXTS.has(extname(entry.name).toLowerCase())) out.push(full)
  }
}

function readShortcut(path: string): { target?: string; icon?: string } {
  if (extname(path).toLowerCase() !== '.lnk') return {}
  try {
    const link = shell.readShortcutLink(path)
    return { target: link.target || undefined, icon: link.icon || undefined }
  } catch {
    return {}
  }
}

interface Shortcut {
  name: string
  path: string
  exe?: string
  iconFile?: string
}

async function scanStartMenu(): Promise<Shortcut[]> {
  const files: string[] = []
  for (const root of startMenuRoots()) await walk(root, 0, files)

  const shortcuts: Shortcut[] = []
  for (const file of files) {
    const name = basename(file, extname(file))
    if (JUNK.test(name)) continue
    const { target, icon } = readShortcut(file)
    // Shortcuts that point at a document or web page (e.g. "Visit our website") aren't apps.
    if (target && /\.(txt|html?|pdf|chm|url|rtf|md)$/i.test(target)) continue
    const exe = target && /\.exe$/i.test(target) ? target : undefined
    const iconFile = [icon, exe].find((p) => p && /\.(ico|exe)$/i.test(p) && existsSync(p))
    shortcuts.push({ name, path: file, exe, iconFile })
  }
  return shortcuts
}

// ---------------------------------------------------------------------------
// The shell's AppsFolder lists every app in Start — desktop and Store alike —
// and can render each one's real icon, exactly as Start shows it.
// ---------------------------------------------------------------------------

interface StartApp {
  Name: string
  AppID: string
}

function getStartApps(): Promise<StartApp[]> {
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        '[Console]::OutputEncoding = [Text.Encoding]::UTF8; @(Get-StartApps | Select-Object Name, AppID) | ConvertTo-Json -Compress'
      ],
      { windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 30_000 },
      (err, stdout) => {
        if (err || !stdout.trim()) return resolve([])
        try {
          const parsed = JSON.parse(stdout) as StartApp | StartApp[]
          resolve((Array.isArray(parsed) ? parsed : [parsed]).filter((a) => a?.Name && a.AppID))
        } catch {
          resolve([])
        }
      }
    )
  })
}

// Desktop apps without a shortcut show up with AppIDs like "{GUID}\app.exe".
const KNOWN_FOLDERS: Record<string, string | undefined> = {
  '{6D809377-6AF0-444B-8957-A3773F02200E}': process.env['ProgramW6432'] ?? process.env['ProgramFiles'],
  '{7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}': process.env['ProgramFiles(x86)'],
  '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}': join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32'),
  '{F38BF404-1D43-42F2-9305-67DE0B28FC23}': process.env['SystemRoot']
}

function exeFromAppId(appId: string): string | undefined {
  let path = appId
  const known = /^(\{[0-9A-F-]+\})\\(.*)$/i.exec(appId)
  if (known) {
    const base = KNOWN_FOLDERS[known[1].toUpperCase()]
    if (!base) return undefined
    path = join(base, known[2])
  }
  return /^[a-z]:\\.*\.exe$/i.test(path) && existsSync(path) ? path : undefined
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

async function shellIcon(parsingName: string): Promise<string | undefined> {
  try {
    const img = await withTimeout(nativeImage.createThumbnailFromPath(parsingName, { width: ICON_PX, height: ICON_PX }), 5000)
    return img.isEmpty() ? undefined : img.toDataURL()
  } catch {
    return undefined
  }
}

async function fileIcon(path: string): Promise<string | undefined> {
  try {
    const img = await app.getFileIcon(path, { size: 'large' })
    return img.isEmpty() ? undefined : img.toDataURL()
  } catch {
    return undefined
  }
}

/**
 * Builds the app list from Start (Get-StartApps), enriched with Start Menu
 * shortcuts where one exists — those give us a file location, "Run as
 * administrator" and launch arguments. Shortcuts Start doesn't list are kept too.
 */
export async function indexApps(previous: AppEntry[]): Promise<AppEntry[]> {
  const [shortcuts, startApps] = await Promise.all([scanStartMenu(), getStartApps()])
  const shortcutByName = new Map<string, Shortcut>()
  // First one wins; the all-users Start Menu is scanned before the per-user one.
  for (const s of shortcuts) if (!shortcutByName.has(s.name.toLowerCase())) shortcutByName.set(s.name.toLowerCase(), s)

  const byName = new Map<string, AppEntry & { iconFile?: string }>()
  for (const start of startApps) {
    const key = start.Name.toLowerCase()
    if (JUNK.test(start.Name) || byName.has(key)) continue
    const lnk = shortcutByName.get(key)
    byName.set(
      key,
      lnk
        ? { id: `app:${lnk.path.toLowerCase()}`, name: lnk.name, kind: 'shortcut', target: lnk.path, appId: start.AppID, exe: lnk.exe }
        : { id: `app:uwp:${start.AppID.toLowerCase()}`, name: start.Name, kind: 'uwp', target: start.AppID, appId: start.AppID, exe: exeFromAppId(start.AppID) }
    )
  }
  for (const [key, lnk] of shortcutByName) {
    if (byName.has(key)) continue
    byName.set(key, { id: `app:${lnk.path.toLowerCase()}`, name: lnk.name, kind: 'shortcut', target: lnk.path, exe: lnk.exe, iconFile: lnk.iconFile ?? lnk.path })
  }

  const oldIcons = new Map(previous.map((a) => [a.id, a.icon]))
  const apps = [...byName.values()]
  await Promise.all(
    apps.map(async (entry) => {
      entry.icon =
        oldIcons.get(entry.id) ??
        (entry.appId ? await shellIcon(`shell:AppsFolder\\${entry.appId}`) : undefined) ??
        (entry.iconFile ? await fileIcon(entry.iconFile) : undefined)
      delete entry.iconFile
    })
  )
  return apps.sort((a, b) => a.name.localeCompare(b.name))
}

/** Files and folders from Windows' own "Recent" list — what you touched lately. */
export async function indexRecent(limit = 60): Promise<RecentFile[]> {
  const dir = join(app.getPath('appData'), 'Microsoft\\Windows\\Recent')
  let names: string[]
  try {
    names = (await readdir(dir)).filter((n) => n.toLowerCase().endsWith('.lnk'))
  } catch {
    return []
  }
  const withTimes = await Promise.all(
    names.map(async (name) => {
      try {
        return { name, mtime: (await stat(join(dir, name))).mtimeMs }
      } catch {
        return { name, mtime: 0 }
      }
    })
  )
  withTimes.sort((a, b) => b.mtime - a.mtime)

  const out: RecentFile[] = []
  const seen = new Set<string>()
  for (const { name } of withTimes) {
    if (out.length >= limit) break
    const { target } = readShortcut(join(dir, name))
    if (!target || seen.has(target.toLowerCase())) continue
    try {
      const info = await stat(target)
      seen.add(target.toLowerCase())
      out.push({
        id: `file:${target.toLowerCase()}`,
        name: basename(target) || target,
        path: target,
        isDir: info.isDirectory(),
        // Photos and videos get a real preview when Windows has one cached.
        icon: (await shellIcon(target)) ?? (await fileIcon(target))
      })
    } catch {
      // The file has since been moved or deleted.
    }
  }
  return out
}
