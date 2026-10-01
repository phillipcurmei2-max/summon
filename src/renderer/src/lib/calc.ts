/**
 * A small, safe calculator — a hand-written parser, never eval().
 * Supports + - * / ^ mod, %, !, parentheses, implicit multiplication (2pi, 3(4+5)),
 * "20% of 150", × ÷ and x as multiply, and common functions/constants.
 */

type Token =
  | { t: 'num'; v: number }
  | { t: 'op'; v: string }
  | { t: 'id'; v: string }
  | { t: '('; v: '(' }
  | { t: ')'; v: ')' }
  | { t: ','; v: ',' }

const FUNCS: Record<string, (...a: number[]) => number> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  min: Math.min,
  max: Math.max
}

const CONSTS: Record<string, number> = { pi: Math.PI, π: Math.PI, e: Math.E, tau: Math.PI * 2 }

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i))
    if (num) {
      tokens.push({ t: 'num', v: parseFloat(num[0]) })
      i += num[0].length
      continue
    }
    // "3x4" and "3 x 4" mean multiply.
    if (/^x(?=[\s\d(.])/i.test(src.slice(i)) && tokens.length) {
      tokens.push({ t: 'op', v: '*' })
      i++
      continue
    }
    const id = /^[a-zπ][a-z0-9]*/i.exec(src.slice(i))
    if (id) {
      const word = id[0].toLowerCase()
      if (word === 'mod') tokens.push({ t: 'op', v: 'mod' })
      else if (word === 'of') tokens.push({ t: 'op', v: '*' })
      else tokens.push({ t: 'id', v: word })
      i += id[0].length
      continue
    }
    if (ch === '(' || ch === ')' || ch === ',') {
      tokens.push({ t: ch, v: ch } as Token)
      i++
      continue
    }
    if (ch === '*' && src[i + 1] === '*') {
      tokens.push({ t: 'op', v: '^' })
      i += 2
      continue
    }
    const op = { '+': '+', '-': '-', '−': '-', '*': '*', '×': '*', '·': '*', '/': '/', '÷': '/', '^': '^', '%': '%', '!': '!' }[ch]
    if (!op) throw new Error(`Unexpected "${ch}"`)
    tokens.push({ t: 'op', v: op })
    i++
  }
  return tokens
}

class Parser {
  private pos = 0
  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    const value = this.expr()
    if (this.pos < this.tokens.length) throw new Error('Unexpected input')
    return value
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private isOp(v: string): boolean {
    const tok = this.peek()
    return tok?.t === 'op' && tok.v === v
  }

  private expr(): number {
    let left = this.term()
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.tokens[this.pos++].v
      const right = this.term()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  private term(): number {
    let left = this.unary()
    for (;;) {
      const tok = this.peek()
      if (tok?.t === 'op' && (tok.v === '*' || tok.v === '/' || tok.v === 'mod' || (tok.v === '%' && this.startsOperand(1)))) {
        this.pos++
        const right = this.unary()
        if (tok.v === '*') left *= right
        else if (tok.v === '/') left /= right
        else left = ((left % right) + right) % right
      } else if (tok && (tok.t === 'num' || tok.t === 'id' || tok.t === '(')) {
        // Implicit multiplication: 2pi, 3(4+5), (1+2)(3+4)
        left *= this.unary()
      } else {
        return left
      }
    }
  }

  private startsOperand(offset: number): boolean {
    const tok = this.tokens[this.pos + offset]
    return !!tok && (tok.t === 'num' || tok.t === 'id' || tok.t === '(')
  }

  private unary(): number {
    if (this.isOp('-')) {
      this.pos++
      return -this.unary()
    }
    if (this.isOp('+')) {
      this.pos++
      return this.unary()
    }
    return this.power()
  }

  private power(): number {
    const base = this.postfix()
    if (this.isOp('^')) {
      this.pos++
      return Math.pow(base, this.unary())
    }
    return base
  }

  private postfix(): number {
    let value = this.primary()
    for (;;) {
      if (this.isOp('!')) {
        this.pos++
        value = factorial(value)
      } else if (this.isOp('%') && !this.startsOperand(1)) {
        this.pos++
        value /= 100
      } else {
        return value
      }
    }
  }

  private primary(): number {
    const tok = this.tokens[this.pos++]
    if (!tok) throw new Error('Unexpected end')
    if (tok.t === 'num') return tok.v
    if (tok.t === '(') {
      const value = this.expr()
      if (this.peek()?.t !== ')') throw new Error('Missing )')
      this.pos++
      return value
    }
    if (tok.t === 'id') {
      if (tok.v in CONSTS) return CONSTS[tok.v]
      const fn = FUNCS[tok.v]
      if (!fn) throw new Error(`Unknown "${tok.v}"`)
      if (this.peek()?.t !== '(') return fn(this.power())
      this.pos++
      const args = [this.expr()]
      while (this.peek()?.t === ',') {
        this.pos++
        args.push(this.expr())
      }
      if (this.peek()?.t !== ')') throw new Error('Missing )')
      this.pos++
      return fn(...args)
    }
    throw new Error('Unexpected token')
  }
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

const MATHY = /[+\-−*/^%×÷!()]|\b(sqrt|cbrt|abs|round|floor|ceil|sin|cos|tan|asin|acos|atan|ln|log|log2|exp|min|max|mod|of)\b|\d\s*x\s*\d|\d\s*(pi|π|tau)\b/i

export interface CalcResult {
  value: number
  text: string
}

/** Returns a result only for input that is clearly a calculation (not a bare number). */
export function calculate(input: string): CalcResult | null {
  // Thousands separators: 1,234,567 → 1234567 (commas followed by exactly 3 digits).
  const src = input.trim().replace(/(\d),(?=\d{3}(?!\d))/g, '$1').replace(/=\s*$/, '')
  if (!src || !MATHY.test(src) || !/[\dπ]|pi|tau/i.test(src)) return null
  let value: number
  try {
    value = new Parser(tokenize(src)).parse()
  } catch {
    return null
  }
  if (!Number.isFinite(value)) return null
  return { value, text: formatNumber(value) }
}

export function formatNumber(value: number): string {
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-9) return value.toExponential(6).replace(/\.?0+e/, 'e')
  const clean = Number(value.toPrecision(12))
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }).format(clean)
}

/** Plain digits, no separators — what you'd want to paste into another calculator or a cell. */
export function rawNumber(value: number): string {
  return String(Number(value.toPrecision(12)))
}
