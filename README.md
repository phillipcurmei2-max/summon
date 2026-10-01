# Summon

**Your whole PC, one keystroke away.** Summon is a fast, keyboard-first command bar for Windows 10 and 11. Press <kbd>Alt</kbd>+<kbd>Space</kbd> anywhere and type.

**[Download for Windows](https://github.com/phillipcurmei2-max/summon/releases/latest/download/Summon-Setup.exe)** · [Website](https://phillipcurmei2-max.github.io/summon/)

- **Launch apps**: every desktop and Store app in Start, with their real icons, plus recently opened files. Matches prefixes, any word, initials (`vsc` → Visual Studio Code) and loose letters, and learns what you use most.
- **Calculator**: `20% of 150 + 2^8`, `sqrt(2)*100`, `5!`, `3x4`. A hand-written parser, never `eval`.
- **Conversions**: length, mass, volume, temperature, speed, data, time, area (`10 km to miles`, `72f in c`), plus colours (`#8b6dff`, `rgb(…)`, `hsl(…)`).
- **Clipboard history**: text you copy, stored only on this PC, searchable, pasted straight back into the app you were in. Content from password managers that mark the clipboard as private is skipped.
- **Emoji picker**: type `:party`.
- **Timers**: `timer 25m focus`, `remind me in 10 min to stretch`, with a Windows notification when it's done.
- **System commands**: lock, sleep, restart, shut down, sign out, toggle dark mode, screenshot, empty the Recycle Bin. Destructive commands need a second <kbd>Enter</kbd>.
- **Web**: `yt`, `gh`, `wiki`, `maps`, `r`, `ask` (Claude) prefixes, typed URLs, and a search fallback.
- **Actions**: <kbd>Ctrl</kbd>+<kbd>K</kbd> on any result: run as administrator, open file location, copy path, paste vs copy.

No accounts, no telemetry, no servers.

## Development

```bash
npm install
node node_modules/electron/install.js   # Electron 44 no longer downloads its binary on install
npm run dev                             # hot-reloading app
npm test                                # unit tests for the calculator, units, colours, timers, matching
npm run typecheck
npm run smoke                           # builds, drives the real app with Playwright, saves screenshots to .smoke/
npm run package                         # release/Summon-Setup.exe
npm run site                            # rebuilds site/demo.js (the website's live demo reuses the app's search code)
```

Stack: Electron 44, electron-vite, React 19, TypeScript, Tailwind CSS 4.

| Path | What |
| --- | --- |
| `src/main/index.ts` | Window, global hotkey, tray, IPC, timers |
| `src/main/apps.ts` | App index (Start Menu shortcuts + `Get-StartApps`, icons from the shell's AppsFolder) and recent files |
| `src/main/clipboard.ts` | Clipboard history watcher and the auto-paste keystroke |
| `src/main/system.ts` | Lock / sleep / restart / dark-mode commands |
| `src/renderer/src/lib/` | Pure logic: fuzzy matching, calculator, units, colours, timers, emoji, search |
| `src/renderer/src/App.tsx` | The command bar UI and keyboard handling |
| `site/` | The website (static, deployed to GitHub Pages) |

Test runs can use a throwaway profile with `SUMMON_USER_DATA=<dir>`. Add `SUMMON_KEEP_OPEN=1` to keep the window open when it loses focus.

## Known limitations

- Builds aren't code-signed yet, so SmartScreen warns on first install, and Smart App Control (if enabled) may block the app.
- Clipboard history is text-only.

## License

MIT
