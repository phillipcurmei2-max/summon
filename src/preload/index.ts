import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { SummonApi } from './api'

function on<T extends unknown[]>(channel: string, cb: (...args: T) => void): () => void {
  const listener = (_e: IpcRendererEvent, ...args: unknown[]): void => cb(...(args as T))
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api: SummonApi = {
  boot: () => ipcRenderer.invoke('boot'),
  open: (target, usageId) => ipcRenderer.invoke('open', target, usageId),
  hide: () => ipcRenderer.send('hide'),
  recordUse: (id) => ipcRenderer.send('usage', id),
  copy: (text) => ipcRenderer.invoke('copy', text),
  paste: (text) => ipcRenderer.invoke('paste', text),
  setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
  suspendHotkey: (suspended) => ipcRenderer.invoke('hotkey:suspend', suspended),
  deleteClip: (id) => ipcRenderer.send('clipboard:delete', id),
  clearClipboard: () => ipcRenderer.send('clipboard:clear'),
  startTimer: (ms, label) => ipcRenderer.invoke('timer:start', ms, label),
  cancelTimer: (id) => ipcRenderer.send('timer:cancel', id),
  reveal: (path) => ipcRenderer.send('reveal', path),
  runAsAdmin: (path) => ipcRenderer.send('runAsAdmin', path),
  reindex: () => ipcRenderer.send('reindex'),
  quit: () => ipcRenderer.send('quit'),
  onShow: (cb) => on('summon:show', cb),
  onHidden: (cb) => on('summon:hidden', cb),
  onCatalog: (cb) => on('catalog', cb),
  onClipboard: (cb) => on('clipboard', cb),
  onUsage: (cb) => on('usage', cb),
  onTimers: (cb) => on('timers', cb),
  onSettings: (cb) => on('settings', cb),
  onTheme: (cb) => on('theme', cb)
}

contextBridge.exposeInMainWorld('summon', api)
