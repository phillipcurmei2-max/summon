/** Recognises a colour typed as hex, rgb() or hsl() and converts between them. */

export interface ParsedColor {
  r: number
  g: number
  b: number
  a: number
  hex: string
  rgb: string
  hsl: string
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const k = (n: number): number => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

function build(r: number, g: number, b: number, a = 1): ParsedColor {
  r = clamp(Math.round(r), 0, 255)
  g = clamp(Math.round(g), 0, 255)
  b = clamp(Math.round(b), 0, 255)
  a = clamp(a, 0, 1)
  const [h, s, l] = rgbToHsl(r, g, b)
  const alpha = a < 1 ? toHex(a * 255) : ''
  return {
    r,
    g,
    b,
    a,
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`.toUpperCase(),
    rgb: a < 1 ? `rgba(${r}, ${g}, ${b}, ${+a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`,
    hsl: a < 1 ? `hsla(${h}, ${s}%, ${l}%, ${+a.toFixed(2)})` : `hsl(${h}, ${s}%, ${l}%)`
  }
}

export function parseColor(input: string): ParsedColor | null {
  const text = input.trim().toLowerCase()

  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text)
  // Bare hex without "#" only when it's 6 digits and contains a letter, so "123456" stays a number.
  if (hex && (text.startsWith('#') || (hex[1].length === 6 && /[a-f]/.test(hex[1])))) {
    let h = hex[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join('')
    const n = (i: number): number => parseInt(h.slice(i, i + 2), 16)
    return build(n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1)
  }

  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+%?))?\s*\)?$/.exec(text)
  if (rgb) {
    const alpha = rgb[4] ? (rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4])) : 1
    return build(+rgb[1], +rgb[2], +rgb[3], alpha)
  }

  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:[\s,/]+([\d.]+%?))?\s*\)?$/.exec(text)
  if (hsl) {
    const [r, g, b] = hslToRgb(+hsl[1] % 360, clamp(+hsl[2], 0, 100), clamp(+hsl[3], 0, 100))
    const alpha = hsl[4] ? (hsl[4].endsWith('%') ? parseFloat(hsl[4]) / 100 : parseFloat(hsl[4])) : 1
    return build(r, g, b, alpha)
  }
  return null
}
