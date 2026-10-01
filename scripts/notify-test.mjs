// Starts a 3-second timer in a throwaway profile and reports whether Windows
// accepted the "time's up" notification. Usage: node scripts/notify-test.mjs [path-to-Summon.exe]
import { _electron as electron } from 'playwright-core'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const profile = mkdtempSync(join(tmpdir(), 'summon-notify-'))
const exe = process.argv[2]
const app = await electron.launch({
  ...(exe ? { executablePath: exe, args: [] } : { args: [root] }),
  cwd: root,
  env: { ...process.env, SUMMON_USER_DATA: profile, SUMMON_KEEP_OPEN: '1' }
})

// Watch the notification from inside the main process.
await app.evaluate(({ Notification }) => {
  globalThis.__notes = []
  const show = Notification.prototype.show
  Notification.prototype.show = function () {
    this.on('show', () => globalThis.__notes.push('shown'))
    this.on('failed', (_e, err) => globalThis.__notes.push('failed: ' + err))
    return show.call(this)
  }
})

const page = await app.firstWindow()
await page.waitForLoadState('domcontentloaded')
await page.waitForTimeout(1200)
await page.locator('input').fill('timer 3s Summon test')
await page.keyboard.press('Enter')
await page.waitForTimeout(6000)
const notes = await app.evaluate(() => globalThis.__notes)
const log = join(profile, 'summon.log')
console.log('notification events:', JSON.stringify(notes))
console.log('error log:', existsSync(log) ? readFileSync(log, 'utf8') : '(none)')
await app.close()
rmSync(profile, { recursive: true, force: true })
