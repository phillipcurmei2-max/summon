import {
  Clipboard,
  Download,
  FileText,
  Folder,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Power,
  Recycle,
  RefreshCw,
  RotateCcw,
  Scissors,
  Settings,
  Settings2,
  Smile,
  Timer,
  Trash2,
  X,
  type LucideIcon
} from 'lucide-react'
import type { SystemCommandId } from '@shared/types'
import type { Ops, Tint } from './types'

export interface CommandDef {
  id: string
  title: string
  subtitle: string
  keywords: string[]
  icon: LucideIcon
  tint: Tint
  confirm?: boolean
  /** Built-in commands shown when the bar is empty. */
  featured?: boolean
  run(ops: Ops): void
}

function system(
  command: SystemCommandId,
  title: string,
  subtitle: string,
  keywords: string[],
  icon: LucideIcon,
  tint: Tint,
  extra: Partial<CommandDef> = {}
): CommandDef {
  return {
    id: `cmd:${command}`,
    title,
    subtitle,
    keywords,
    icon,
    tint,
    run: (ops) => ops.open({ type: 'system', command }, `cmd:${command}`),
    ...extra
  }
}

export const COMMANDS: CommandDef[] = [
  {
    id: 'cmd:clipboard',
    title: 'Clipboard History',
    subtitle: 'Search and paste anything you’ve copied',
    keywords: ['paste', 'copy', 'clip', 'history', 'clipboard'],
    icon: Clipboard,
    tint: 'violet',
    featured: true,
    run: (ops) => {
      ops.recordUse('cmd:clipboard')
      ops.setMode('clipboard')
    }
  },
  {
    id: 'cmd:emoji',
    title: 'Emoji Picker',
    subtitle: 'Find an emoji and paste it — or type “:”',
    keywords: ['emoji', 'emoticon', 'smiley', 'symbols', 'face'],
    icon: Smile,
    tint: 'yellow',
    featured: true,
    run: (ops) => {
      ops.recordUse('cmd:emoji')
      ops.setMode('emoji')
    }
  },
  {
    id: 'cmd:timer',
    title: 'Start a Timer',
    subtitle: 'Try “timer 25m focus” or “remind me in 10 min to stretch”',
    keywords: ['timer', 'countdown', 'alarm', 'remind', 'pomodoro', 'stopwatch'],
    icon: Timer,
    tint: 'orange',
    featured: true,
    run: (ops) => ops.setQuery('timer ')
  },
  system('lock', 'Lock Screen', 'Lock your PC', ['lock', 'away', 'secure'], Lock, 'blue', { featured: true }),
  system('sleep', 'Sleep', 'Put your PC to sleep', ['sleep', 'suspend', 'standby'], Moon, 'blue'),
  system('restart', 'Restart', 'Restart your PC', ['restart', 'reboot'], RotateCcw, 'red', { confirm: true }),
  system('shutdown', 'Shut Down', 'Turn off your PC', ['shutdown', 'shut down', 'power off', 'turn off'], Power, 'red', {
    confirm: true
  }),
  system('signout', 'Sign Out', 'Sign out of Windows', ['sign out', 'log out', 'logout', 'logoff'], LogOut, 'red', {
    confirm: true
  }),
  system('toggle-dark-mode', 'Toggle Dark Mode', 'Switch Windows between light and dark', ['dark mode', 'light mode', 'theme', 'appearance'], Monitor, 'gray', {
    featured: true
  }),
  system('screenshot', 'Take Screenshot', 'Snip part of the screen', ['screenshot', 'snip', 'capture', 'screen grab'], Scissors, 'pink'),
  system('empty-recycle-bin', 'Empty Recycle Bin', 'Permanently delete everything in the bin', ['empty', 'trash', 'bin', 'recycle', 'clean'], Trash2, 'red', {
    confirm: true
  }),
  system('recycle-bin', 'Open Recycle Bin', 'See deleted files', ['trash', 'bin', 'recycle', 'deleted'], Recycle, 'green'),
  system('downloads', 'Downloads', 'Open your Downloads folder', ['downloads', 'folder'], Download, 'blue'),
  system('documents', 'Documents', 'Open your Documents folder', ['documents', 'docs', 'folder'], FileText, 'blue'),
  system('desktop', 'Desktop Folder', 'Open your Desktop folder', ['desktop', 'folder'], Folder, 'blue'),
  system('settings', 'Windows Settings', 'Open the Windows Settings app', ['settings', 'preferences', 'control'], Settings, 'gray'),
  {
    id: 'cmd:summon-settings',
    title: 'Summon Settings',
    subtitle: 'Hotkey, clipboard, theme and more',
    keywords: ['summon', 'preferences', 'hotkey', 'shortcut', 'config', 'settings'],
    icon: Settings2,
    tint: 'violet',
    run: (ops) => ops.setMode('settings')
  },
  {
    id: 'cmd:reindex',
    title: 'Refresh App List',
    subtitle: 'Rescan installed apps and recent files',
    keywords: ['refresh', 'reindex', 'rescan', 'apps', 'reload'],
    icon: RefreshCw,
    tint: 'gray',
    run: (ops) => ops.reindex()
  },
  {
    id: 'cmd:quit',
    title: 'Quit Summon',
    subtitle: 'Close Summon completely',
    keywords: ['quit', 'exit', 'close summon'],
    icon: X,
    tint: 'gray',
    run: (ops) => ops.quit()
  }
]
