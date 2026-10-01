import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A tiny JSON file store in userData. Writes are debounced and atomic
 * (write to .tmp, then rename) so a crash mid-write never corrupts a file.
 */
export class JsonFile<T> {
  private readonly path: string
  private timer: NodeJS.Timeout | null = null
  data: T
  /** False when the file did not exist yet — i.e. the first run. */
  readonly loaded: boolean = false

  constructor(name: string, fallback: T) {
    const dir = app.getPath('userData')
    mkdirSync(dir, { recursive: true })
    this.path = join(dir, name)
    this.data = fallback
    if (existsSync(this.path)) {
      try {
        const parsed = JSON.parse(readFileSync(this.path, 'utf8')) as T
        this.data =
          fallback && typeof fallback === 'object' && !Array.isArray(fallback)
            ? { ...fallback, ...parsed }
            : parsed
        this.loaded = true
      } catch {
        // A corrupt file falls back to defaults rather than breaking startup.
      }
    }
  }

  save(delay = 400): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.flush(), delay)
  }

  flush(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    const tmp = `${this.path}.tmp`
    writeFileSync(tmp, JSON.stringify(this.data))
    renameSync(tmp, this.path)
  }
}
