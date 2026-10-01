import { app, shell } from 'electron'
import { execFile, spawn } from 'node:child_process'
import type { SystemCommandId } from '@shared/types'

function run(file: string, args: string[] = []): void {
  const child = spawn(file, args, { detached: true, stdio: 'ignore', windowsHide: true })
  child.on('error', () => {})
  child.unref()
}

function powershell(script: string): void {
  run('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', script])
}

const PERSONALIZE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize'

function toggleDarkMode(): void {
  execFile('reg.exe', ['query', PERSONALIZE, '/v', 'AppsUseLightTheme'], { windowsHide: true }, (_err, stdout) => {
    const isLight = /0x1\b/.test(stdout ?? '')
    const next = isLight ? '0' : '1'
    for (const name of ['AppsUseLightTheme', 'SystemUsesLightTheme']) {
      run('reg.exe', ['add', PERSONALIZE, '/v', name, '/t', 'REG_DWORD', '/d', next, '/f'])
    }
  })
}

export function runSystemCommand(id: SystemCommandId): void {
  switch (id) {
    case 'lock':
      return run('rundll32.exe', ['user32.dll,LockWorkStation'])
    case 'sleep':
      // SetSuspendState via WinForms always sleeps; rundll32 powrprof hibernates when hibernation is on.
      return powershell(
        "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState('Suspend', $false, $false)"
      )
    case 'restart':
      return run('shutdown.exe', ['/r', '/t', '0'])
    case 'shutdown':
      return run('shutdown.exe', ['/s', '/t', '0'])
    case 'signout':
      return run('shutdown.exe', ['/l'])
    case 'recycle-bin':
      return run('explorer.exe', ['shell:RecycleBinFolder'])
    case 'empty-recycle-bin':
      return powershell('Clear-RecycleBin -Force -ErrorAction SilentlyContinue')
    case 'settings':
      void shell.openExternal('ms-settings:')
      return
    case 'task-manager':
      return run('taskmgr.exe')
    case 'control-panel':
      return run('control.exe')
    case 'explorer':
      return run('explorer.exe')
    case 'downloads':
      void shell.openPath(app.getPath('downloads'))
      return
    case 'documents':
      void shell.openPath(app.getPath('documents'))
      return
    case 'desktop':
      void shell.openPath(app.getPath('desktop'))
      return
    case 'screenshot':
      void shell.openExternal('ms-screenclip:')
      return
    case 'toggle-dark-mode':
      return toggleDarkMode()
  }
}

export function launchStoreApp(appId: string): void {
  run('explorer.exe', [`shell:AppsFolder\\${appId}`])
}

export function runAsAdmin(path: string): void {
  powershell(`Start-Process -FilePath '${path.replace(/'/g, "''")}' -Verb RunAs`)
}
