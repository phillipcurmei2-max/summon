import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  Notification,
  protocol,
  screen,
  shell,
  Tray
} from 'electron'
import { readFile } from 'node:fs/promises'
import { appendFileSync, copyFileSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { extname, join, normalize, sep } from 'node:path'
import {
  DEFAULT_SETTINGS,
  type AppEntry,
  type BootState,
  type Catalog,
  type OpenTarget,
  type RecentFile,
  type Settings,
  type ShowReason,
  type TimerInfo,
  type UsageStat
} from '@shared/types'
import { indexApps, indexRecent } from './apps'
import { ClipboardHistory, sendPasteKeystroke } from './clipboard'
import { JsonFile } from './store'
import { launchStoreApp, runAsAdmin, runSystemCommand } from './system'

const APP_SCHEME = 'app'
const rendererDir = join(import.meta.dirname, '../renderer')
const resourcesDir = join(import.meta.dirname, '../../resources')
const preloadPath = join(import.meta.dirname, '../preload/index.cjs')
const devUrl = process.env['ELECTRON_RENDERER_URL']

// The panel is drawn by the page with a soft shadow, so the window is a little
// larger than the panel and fully transparent around it.
const PANEL_W = 760
const PANEL_H = 480
const SHADOW = 16

protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, codeCache: true } }
])

// Lets automated tests run beside a normal Summon without touching its data.
if (process.env['SUMMON_USER_DATA']) app.setPath('userData', process.env['SUMMON_USER_DATA'])

// A background helper failing must never pop up Electron's "JavaScript error"
// dialog over whatever the user is doing — log it and carry on.
function logError(err: unknown): void {
  try {
    const line = `[${new Date().toISOString()}] ${err instanceof Error ? (err.stack ?? err.message) : String(err)}
`
    appendFileSync(join(app.getPath('userData'), 'summon.log'), line)
  } catch {
    // Nowhere left to report it.
  }
}
process.on('uncaughtException', logError)
process.on('unhandledRejection', logError)

const keepOpenOnBlur = process.env['SUMMON_KEEP_OPEN'] === '1'
const startHidden = process.argv.includes('--hidden')

let win: BrowserWindow | null = null
let tray: Tray | null = null
let hotkeyOk = false
let quitting = false

let settingsFile: JsonFile<Settings>
let usageFile: JsonFile<Record<string, UsageStat>>
let catalogFile: JsonFile<{ apps: AppEntry[]; recent: RecentFile[] }>
let history: ClipboardHistory
let indexing = false
let lastIndexed = 0

interface RunningTimer extends TimerInfo {
  handle: NodeJS.Timeout
}
const timers = new Map<string, RunningTimer>()

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function send(channel: string, ...args: unknown[]): void {
  if (win && !win.isDestroyed()) win.webContents.send(channel, ...args)
}

function createWindow(): void {
  win = new BrowserWindow({
    width: PANEL_W + SHADOW * 2,
    height: PANEL_H + SHADOW * 2,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    title: 'Summon',
    icon: join(resourcesDir, 'icon.png'),
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      backgroundThrottling: false
    }
  })

  win.on('blur', () => {
    if (keepOpenOnBlur || win?.webContents.isDevToolsOpened()) return
    hide()
  })
  win.on('close', (event) => {
    if (quitting) return
    event.preventDefault()
    hide()
  })

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || app.isPackaged) return
    if (input.key === 'F12') {
      win?.webContents.openDevTools({ mode: 'detach' })
      event.preventDefault()
    }
  })

  if (devUrl) void win.loadURL(devUrl)
  else void win.loadURL(`${APP_SCHEME}://summon/index.html`)
}

function position(): void {
  if (!win) return
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const { x, y, width, height } = display.workArea
  const w = PANEL_W + SHADOW * 2
  win.setBounds({
    x: Math.round(x + (width - w) / 2),
    y: Math.round(y + height * 0.18 - SHADOW),
    width: w,
    height: PANEL_H + SHADOW * 2
  })
}

function show(reason: ShowReason, view?: 'clipboard' | 'settings'): void {
  if (!win) return
  position()
  send('summon:show', reason, view)
  win.show()
  win.focus()
  win.moveTop()
  // Keep the app index fresh without scanning on every keystroke.
  if (Date.now() - lastIndexed > 10 * 60_000) void reindex()
}

function hide(): void {
  if (!win || !win.isVisible()) return
  win.hide()
  send('summon:hidden')
}

function toggle(): void {
  if (win?.isVisible() && win.isFocused()) hide()
  else show('hotkey')
}

// ---------------------------------------------------------------------------
// Hotkey, tray, login item
// ---------------------------------------------------------------------------

function registerHotkey(accelerator: string): boolean {
  globalShortcut.unregisterAll()
  try {
    hotkeyOk = globalShortcut.register(accelerator, toggle)
  } catch {
    hotkeyOk = false
  }
  updateTray()
  return hotkeyOk
}

function applyLoginItem(enabled: boolean): void {
  // In development this would register electron.exe itself, and a test run
  // (throwaway profile) must never touch the real startup list.
  if (!app.isPackaged || process.env['SUMMON_USER_DATA']) return
  app.setLoginItemSettings({ openAtLogin: enabled, args: ['--hidden'] })
}

function trayImage(): Electron.NativeImage {
  const img = nativeImage.createFromPath(join(resourcesDir, 'tray.png'))
  const hi = join(resourcesDir, 'tray@2x.png')
  if (existsSync(hi)) img.addRepresentation({ scaleFactor: 2, buffer: nativeImage.createFromPath(hi).toPNG() })
  return img
}

function updateTray(): void {
  if (!tray) return
  const settings = settingsFile.data
  tray.setToolTip(hotkeyOk ? `Summon — ${settings.hotkey}` : 'Summon')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: hotkeyOk ? `Open Summon\t${settings.hotkey}` : 'Open Summon', click: () => show('tray') },
      { label: 'Clipboard History', click: () => show('tray', 'clipboard') },
      { label: 'Settings…', click: () => show('settings', 'settings') },
      { type: 'separator' },
      {
        label: 'Launch at login',
        type: 'checkbox',
        checked: settings.launchAtLogin,
        click: (item) => updateSettings({ launchAtLogin: item.checked })
      },
      { type: 'separator' },
      { label: 'Quit Summon', click: () => app.quit() }
    ])
  )
}

function createTray(): void {
  tray = new Tray(trayImage())
  tray.on('click', () => show('tray'))
  updateTray()
}

// ---------------------------------------------------------------------------
// Settings, indexing, usage
// ---------------------------------------------------------------------------

function updateSettings(patch: Partial<Settings>): { settings: Settings; hotkeyOk: boolean } {
  const prev = settingsFile.data
  const next = { ...prev, ...patch }
  settingsFile.data = next
  settingsFile.save(0)

  if (patch.hotkey !== undefined && patch.hotkey !== prev.hotkey) {
    if (!registerHotkey(next.hotkey)) {
      // Keep the old shortcut working if the new one is taken.
      settingsFile.data = { ...next, hotkey: prev.hotkey }
      registerHotkey(prev.hotkey)
      settingsFile.save(0)
      send('settings', settingsFile.data)
      return { settings: settingsFile.data, hotkeyOk: false }
    }
  }
  if (patch.launchAtLogin !== undefined) applyLoginItem(next.launchAtLogin)
  if (patch.clipboardHistory !== undefined) {
    if (next.clipboardHistory) history.start()
    else history.stop()
  }
  if (patch.theme !== undefined) nativeTheme.themeSource = next.theme
  updateTray()
  send('settings', settingsFile.data)
  return { settings: settingsFile.data, hotkeyOk: true }
}

function catalog(): Catalog {
  return { apps: catalogFile.data.apps, recent: catalogFile.data.recent, indexing }
}

async function reindex(): Promise<void> {
  if (indexing) return
  indexing = true
  send('catalog', catalog())
  try {
    const [apps, recent] = await Promise.all([indexApps(catalogFile.data.apps), indexRecent()])
    catalogFile.data = { apps, recent }
    catalogFile.save()
    lastIndexed = Date.now()
  } finally {
    indexing = false
    send('catalog', catalog())
  }
}

function recordUse(id: string): void {
  const stat = usageFile.data[id] ?? { count: 0, last: 0 }
  usageFile.data[id] = { count: stat.count + 1, last: Date.now() }
  usageFile.save()
  send('usage', usageFile.data)
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function openExternalSafely(url: string): void {
  if (/^(https?|mailto|ms-settings):/i.test(url)) void shell.openExternal(url)
}

async function open(target: OpenTarget, usageId?: string): Promise<{ ok: boolean; error?: string }> {
  if (usageId) recordUse(usageId)
  hide()
  switch (target.type) {
    case 'app': {
      if (target.app.kind === 'uwp') {
        launchStoreApp(target.app.target)
        return { ok: true }
      }
      const error = await shell.openPath(target.app.target)
      return error ? { ok: false, error } : { ok: true }
    }
    case 'path': {
      const error = await shell.openPath(target.path)
      return error ? { ok: false, error } : { ok: true }
    }
    case 'url':
      openExternalSafely(target.url)
      return { ok: true }
    case 'system':
      runSystemCommand(target.command)
      return { ok: true }
  }
}

function timerList(): TimerInfo[] {
  return [...timers.values()].map(({ id, label, endsAt, durationMs }) => ({ id, label, endsAt, durationMs }))
}

function startTimer(durationMs: number, label: string): TimerInfo {
  const id = `t${Date.now().toString(36)}`
  const info: TimerInfo = { id, label, endsAt: Date.now() + durationMs, durationMs }
  const handle = setTimeout(() => {
    timers.delete(id)
    send('timers', timerList())
    notifyTimerDone(label, durationMs)
  }, durationMs)
  timers.set(id, { ...info, handle })
  send('timers', timerList())
  return info
}

// Live notifications are kept referenced so they aren't garbage-collected while on screen.
const shownNotifications = new Set<Notification>()

function xmlEscape(text: string): string {
  return text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}

/** Windows can't read images inside app.asar, so the toast gets a copy of the icon in userData. */
function toastIconUrl(): string | null {
  try {
    const target = join(app.getPath('userData'), 'notification-icon.png')
    if (!existsSync(target)) copyFileSync(join(resourcesDir, 'icon.png'), target)
    return pathToFileURL(target).href
  } catch {
    return null
  }
}

/**
 * A finished timer should be hard to miss: a "reminder" toast plays the reminder
 * sound and stays on screen until it's dismissed, instead of sliding away.
 */
function notifyTimerDone(label: string, durationMs: number): void {
  const title = label ? `⏰ ${label}` : '⏰ Time’s up'
  const body = `Your ${formatDuration(durationMs)} timer is done.`
  const icon = toastIconUrl()
  const toastXml =
    `<toast scenario="reminder" launch="summon-timer">` +
    `<visual><binding template="ToastGeneric"><text>${xmlEscape(title)}</text><text>${xmlEscape(body)}</text>` +
    (icon ? `<image placement="appLogoOverride" src="${xmlEscape(icon)}"/>` : '') +
    `</binding></visual>` +
    `<audio src="ms-winsoundevent:Notification.Reminder"/>` +
    `<actions><action content="Dismiss" arguments="dismiss" activationType="system"/></actions>` +
    `</toast>`

  let notification: Notification
  try {
    notification = new Notification({ toastXml })
  } catch {
    notification = new Notification({ title, body, icon: join(resourcesDir, 'icon.png') })
  }
  shownNotifications.add(notification)
  const release = (): void => void shownNotifications.delete(notification)
  notification.on('close', release)
  notification.on('click', () => {
    release()
    show('tray')
  })
  notification.on('failed', (_e, error) => {
    release()
    logError(`timer notification failed: ${error}`)
    new Notification({ title, body, icon: join(resourcesDir, 'icon.png') }).show()
  })
  notification.show()
}

function cancelTimer(id: string): void {
  const timer = timers.get(id)
  if (!timer) return
  clearTimeout(timer.handle)
  timers.delete(id)
  send('timers', timerList())
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60_000)
  if (mins < 1) return `${Math.round(ms / 1000)} second`
  if (mins < 60) return `${mins} minute`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} h ${m} min` : `${h} hour`
}

function registerIpc(): void {
  ipcMain.handle('boot', (): BootState => ({
    version: app.getVersion(),
    settings: settingsFile.data,
    hotkeyOk,
    firstRun: !settingsFile.loaded,
    catalog: catalog(),
    clipboard: history.entries,
    usage: usageFile.data,
    timers: timerList(),
    dark: nativeTheme.shouldUseDarkColors
  }))
  ipcMain.handle('open', (_e, target: OpenTarget, usageId?: string) => open(target, usageId))
  ipcMain.on('hide', () => hide())
  ipcMain.on('usage', (_e, id: string) => recordUse(id))
  ipcMain.handle('copy', async (_e, text: string) => {
    await clipboard.writeText(text)
    hide()
  })
  ipcMain.handle('paste', async (_e, text: string): Promise<'pasted' | 'copied'> => {
    await clipboard.writeText(text)
    hide()
    if (!settingsFile.data.autoPaste) return 'copied'
    // Give Windows a moment to hand focus back to the previous app.
    await new Promise((r) => setTimeout(r, 120))
    return (await sendPasteKeystroke()) ? 'pasted' : 'copied'
  })
  ipcMain.handle('settings:set', (_e, patch: Partial<Settings>) => updateSettings(patch))
  ipcMain.handle('hotkey:suspend', (_e, suspended: boolean) => {
    // While recording a new shortcut, the current one must not fire.
    if (suspended) globalShortcut.unregisterAll()
    else registerHotkey(settingsFile.data.hotkey)
  })
  ipcMain.on('clipboard:delete', (_e, id: string) => history.remove(id))
  ipcMain.on('clipboard:clear', () => history.clear())
  ipcMain.handle('timer:start', (_e, ms: number, label: string) => startTimer(ms, label))
  ipcMain.on('timer:cancel', (_e, id: string) => cancelTimer(id))
  ipcMain.on('reveal', (_e, path: string) => {
    hide()
    shell.showItemInFolder(path)
  })
  ipcMain.on('runAsAdmin', (_e, path: string) => {
    hide()
    runAsAdmin(path)
  })
  ipcMain.on('reindex', () => void reindex())
  ipcMain.on('quit', () => app.quit())
}

// ---------------------------------------------------------------------------
// Renderer protocol + hardening
// ---------------------------------------------------------------------------

const APP_MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
}

function handleAppProtocol(): void {
  protocol.handle(APP_SCHEME, async (request) => {
    const { pathname } = new URL(request.url)
    const target = normalize(join(rendererDir, decodeURIComponent(pathname)))
    if (!target.startsWith(rendererDir + sep) || !existsSync(target)) {
      return new Response('Not found', { status: 404 })
    }
    return new Response(await readFile(target), {
      headers: { 'Content-Type': APP_MIME[extname(target).toLowerCase()] ?? 'application/octet-stream' }
    })
  })
}

function hardenContents(): void {
  app.on('web-contents-created', (_e, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      openExternalSafely(url)
      return { action: 'deny' }
    })
    contents.on('will-navigate', (event, url) => {
      if (devUrl && url.startsWith(devUrl)) return
      event.preventDefault()
    })
  })
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => show('second-instance'))

  app.whenReady().then(() => {
    app.setAppUserModelId('com.summon.launcher')
    Menu.setApplicationMenu(null)

    settingsFile = new JsonFile<Settings>('settings.json', DEFAULT_SETTINGS)
    usageFile = new JsonFile<Record<string, UsageStat>>('usage.json', {})
    catalogFile = new JsonFile('catalog.json', { apps: [] as AppEntry[], recent: [] as RecentFile[] })
    history = new ClipboardHistory((entries) => send('clipboard', entries))
    const firstRun = !settingsFile.loaded
    if (firstRun) settingsFile.save(0)

    nativeTheme.themeSource = settingsFile.data.theme
    nativeTheme.on('updated', () => send('theme', nativeTheme.shouldUseDarkColors))

    handleAppProtocol()
    hardenContents()
    registerIpc()
    createWindow()
    createTray()
    registerHotkey(settingsFile.data.hotkey)
    if (settingsFile.data.clipboardHistory) history.start()
    if (firstRun) applyLoginItem(settingsFile.data.launchAtLogin)

    win?.webContents.once('did-finish-load', () => {
      if (!startHidden) show(firstRun ? 'first-run' : 'tray')
    })
    void reindex()
  })

  app.on('before-quit', () => {
    quitting = true
    history?.flush()
  })
  app.on('will-quit', () => globalShortcut.unregisterAll())
  // Summon lives in the tray; closing the window never quits it.
  app.on('window-all-closed', () => {})
}
