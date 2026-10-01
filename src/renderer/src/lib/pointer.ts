/**
 * Chromium fires synthetic mousemove events when content changes under a still
 * cursor. If hover moved the selection on those, the highlight would jump to
 * wherever the mouse happens to rest every time results update. Only a real
 * change in pointer position counts.
 */
let lastX = Number.NaN
let lastY = Number.NaN
let fresh = true

export function pointerMoved(e: { screenX: number; screenY: number }): boolean {
  const moved = !fresh && (e.screenX !== lastX || e.screenY !== lastY)
  fresh = false
  lastX = e.screenX
  lastY = e.screenY
  return moved
}

/** Called when the bar appears: the first event after that only records where the cursor is. */
export function resetPointer(): void {
  fresh = true
}
