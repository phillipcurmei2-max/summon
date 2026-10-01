import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculate } from '../src/renderer/src/lib/calc.ts'
import { convertUnits } from '../src/renderer/src/lib/units.ts'
import { parseColor } from '../src/renderer/src/lib/color.ts'
import { parseTimer, formatClock } from '../src/renderer/src/lib/duration.ts'
import { fuzzyMatch } from '../src/renderer/src/lib/fuzzy.ts'

const calc = (s: string): number | undefined => calculate(s)?.value

test('calculator: arithmetic and precedence', () => {
  assert.equal(calc('2+3*4'), 14)
  assert.equal(calc('(2+3)*4'), 20)
  assert.equal(calc('2^10'), 1024)
  assert.equal(calc('2**3'), 8)
  assert.equal(calc('-2^2'), -4)
  assert.equal(calc('10/4'), 2.5)
  assert.equal(calc('7 mod 3'), 1)
  assert.equal(calc('10 % 3'), 1)
  assert.equal(calc('5!'), 120)
  assert.equal(calc('1,250 * 2'), 2500)
})

test('calculator: percent, implicit multiply, x, functions', () => {
  assert.equal(calc('20% of 150'), 30)
  assert.equal(calc('50%'), 0.5)
  assert.equal(calc('3x4'), 12)
  assert.equal(calc('3 x 4'), 12)
  assert.equal(calc('2(3+4)'), 14)
  assert.equal(calc('(1+1)(2+2)'), 8)
  assert.equal(calc('sqrt(16)'), 4)
  assert.equal(calc('sqrt 16'), 4)
  assert.equal(calc('max(3, 9, 2)'), 9)
  assert.ok(Math.abs(calc('2pi')! - 2 * Math.PI) < 1e-12)
  assert.equal(calculate('1/3')?.text, '0.3333333333')
  assert.equal(calculate('0.1+0.2')?.text, '0.3')
  assert.equal(calculate('1000000*3')?.text, '3,000,000')
})

test('calculator: ignores non-maths', () => {
  for (const s of ['42', 'chrome', '7-zip', 'e', 'visual studio', '1/0', 'sqrt(-1)', '', 'x']) {
    assert.equal(calculate(s), null, s)
  }
})

test('units', () => {
  const [km] = convertUnits('10 km to miles')
  assert.equal(km.to, 'mi')
  assert.ok(Math.abs(km.value - 6.21371) < 1e-4)
  assert.ok(Math.abs(convertUnits('72f in c')[0].value - 22.2222) < 1e-3)
  assert.ok(Math.abs(convertUnits('100 celsius to fahrenheit')[0].value - 212) < 1e-9)
  assert.ok(Math.abs(convertUnits('1 gib in mb')[0].value - 1073.741824) < 1e-6)
  assert.ok(Math.abs(convertUnits('5k to miles')[0].value - 3.10686) < 1e-4)
  assert.equal(convertUnits('10 kg to km').length, 0)
  assert.equal(convertUnits('10 km').map((c) => c.to).join(), 'mi')
  assert.equal(convertUnits('5 m').length, 0)
  assert.equal(convertUnits('2024 roadmap').length, 0)
})

test('colors', () => {
  assert.equal(parseColor('#f80')?.hex, '#FF8800')
  assert.equal(parseColor('#7C5CFF')?.rgb, 'rgb(124, 92, 255)')
  assert.equal(parseColor('rgb(255, 0, 0)')?.hsl, 'hsl(0, 100%, 50%)')
  assert.equal(parseColor('hsl(120, 100%, 25%)')?.hex, '#008000')
  assert.equal(parseColor('ff8800')?.hex, '#FF8800')
  assert.equal(parseColor('123456'), null)
  assert.equal(parseColor('chrome'), null)
})

test('timers', () => {
  assert.deepEqual(parseTimer('timer 5m'), { ms: 300_000, label: '' })
  assert.deepEqual(parseTimer('timer 5'), { ms: 300_000, label: '' })
  assert.deepEqual(parseTimer('timer 1h30m pizza'), { ms: 5_400_000, label: 'pizza' })
  assert.deepEqual(parseTimer('remind me in 10 min to call mum'), { ms: 600_000, label: 'call mum' })
  assert.deepEqual(parseTimer('timer 90 seconds tea'), { ms: 90_000, label: 'tea' })
  assert.equal(parseTimer('timer'), null)
  assert.equal(parseTimer('timer tea'), null)
  assert.equal(parseTimer('timetable'), null)
  assert.equal(formatClock(65_000), '1:05')
  assert.equal(formatClock(3_725_000), '1:02:05')
})

test('fuzzy ranking', () => {
  const score = (q: string, t: string): number => fuzzyMatch(q, t)?.score ?? -1
  assert.ok(score('chr', 'Google Chrome') > 0)
  assert.ok(score('vsc', 'Visual Studio Code') >= 700)
  assert.ok(score('code', 'Visual Studio Code') > score('code', 'Unicode Explorer'))
  assert.ok(score('note', 'Notepad') > score('note', 'OneNote'))
  assert.ok(score('chrme', 'Google Chrome') > 0)
  assert.equal(score('zzz', 'Google Chrome'), -1)
  assert.deepEqual(fuzzyMatch('vsc', 'Visual Studio Code')?.indices, [0, 7, 14])
  assert.ok(score('studio code', 'Visual Studio Code') > 500)
})
