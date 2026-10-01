// Launches the built app in a throwaway profile, drives the command bar through
// its main features and saves a screenshot of each. Usage:
//   npm run build
//   node scripts/smoke-test.mjs [out-dir]
import { _electron as electron } from 'playwright-core'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(process.argv[2] ?? join(root, '.smoke'))
mkdirSync(outDir, { recursive: true })

// Seed a clipboard history so that view has something to show.
const profile = join(tmpdir(), `summon-smoke-${Date.now()}`)
mkdirSync(profile, { recursive: true })
const minutes = (n) => Date.now() - n * 60_000
writeFileSync(
  join(profile, 'clipboard.json'),
  JSON.stringify([
    { id: 'c1', text: 'https://github.com/electron/electron/releases', at: minutes(1) },
    { id: 'c2', text: '#8B6DFF', at: minutes(4) },
    { id: 'c3', text: 'Meeting moved to Thursday 3pm — same room, bring the Q3 numbers.', at: minutes(12) },
    { id: 'c4', text: 'export function greet(name: string) {\n  return `Hello, ${name}!`\n}\n', at: minutes(45) },
    { id: 'c5', text: '4242 4242', at: minutes(180) }
  ])
)

const app = await electron.launch({
  args: [root],
  cwd: root,
  env: { ...process.env, SUMMON_USER_DATA: profile, SUMMON_KEEP_OPEN: '1' }
})
const page = await app.firstWindow()
const problems = []
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`[console.${msg.type()}] ${msg.text()}`)
})
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`))
await page.waitForLoadState('domcontentloaded')

// Wait for the first app index to finish.
const started = Date.now()
for (;;) {
  const boot = await page.evaluate(() => window.summon.boot())
  if (!boot.catalog.indexing && boot.catalog.apps.length) {
    const withIcons = boot.catalog.apps.filter((a) => a.icon).length
    const uwp = boot.catalog.apps.filter((a) => a.kind === 'uwp').length
    console.log(
      `indexed ${boot.catalog.apps.length} apps (${uwp} Store/shell, ${withIcons} with icons), ` +
        `${boot.catalog.recent.length} recent files in ${Date.now() - started} ms; hotkey ${boot.settings.hotkey} ok=${boot.hotkeyOk}`
    )
    break
  }
  if (Date.now() - started > 60_000) {
    console.log('indexing did not finish within 60 s')
    break
  }
  await page.waitForTimeout(250)
}
await page.waitForTimeout(400)

const input = page.locator('input')
let n = 0
async function shot(name) {
  await page.waitForTimeout(250)
  const file = join(outDir, `${String(++n).padStart(2, '0')}-${name}.png`)
  await page.screenshot({ path: file })
  console.log(`saved ${file}`)
}
async function type(text) {
  await input.fill(text)
}

await shot('welcome')
for (const [name, q] of [
  ['app-search', 'note'],
  ['initials', 'vsc'],
  ['calculator', '20% of 150 + 2^8'],
  ['units', '10 km to miles'],
  ['color', '#8b6dff'],
  ['timer', 'timer 25m focus'],
  ['web-prefix', 'yt lofi beats'],
  ['commands', 'lock']
]) {
  await type(q)
  await shot(name)
}

// Action panel on a desktop app (Store apps only have "Open").
await type('vsc')
await page.keyboard.press('Control+k')
await shot('actions')
await page.keyboard.press('Escape')

// Emoji picker via ":".
await type(':party')
await shot('emoji')
await page.keyboard.press('Escape')

// Clipboard history + confirm on "Clear All History" (harmless: throwaway profile).
await type('clipboard')
await page.keyboard.press('Enter')
await shot('clipboard')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('ArrowDown')
await shot('clipboard-code')
await type('thursday')
await shot('clipboard-search')
await page.keyboard.press('Control+k')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('Enter')
await shot('clipboard-confirm-clear')
await page.keyboard.press('Escape') // close the actions panel
await page.keyboard.press('Escape') // cancel the pending confirmation
await page.keyboard.press('Escape') // back to the main list

// Timer: start one and check the countdown shows on the home screen.
await type('timer 25m focus')
await page.keyboard.press('Enter')
await shot('timer-started')

// Settings, then light theme.
await page.keyboard.press('Control+,')
await shot('settings')
await page.getByRole('button', { name: 'Light' }).click()
await page.keyboard.press('Escape')
await type('sqrt(2) * 100')
await shot('light-calculator')
await type('72f in c')
await shot('light-units')
await type('')
await shot('light-home')

// Countdown must tick.
const timerText = () =>
  page.evaluate(() => [...document.querySelectorAll('[role=option]')].map((e) => e.textContent).find((t) => t.includes('left')))
const before = await timerText()
await page.waitForTimeout(2100)
const after = await timerText()
console.log(`timer countdown: "${before}" -> "${after}" ${before !== after ? 'OK' : 'FROZEN'}`)

// ":" jump must keep typing appending, not replace the text.
await input.fill('')
await input.pressSequentially(':par', { delay: 30 })
await input.pressSequentially('ty', { delay: 30 })
console.log(`emoji query after typing ":party": "${await input.inputValue()}"`)

console.log(problems.length ? `\n${problems.length} console problem(s):\n${problems.join('\n')}` : '\nno console errors')
await app.close()
rmSync(profile, { recursive: true, force: true })
