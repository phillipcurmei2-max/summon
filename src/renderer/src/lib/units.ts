/** Unit conversion: "10 km to miles", "72f in c", "3 cups to ml", "1.5 gb in mb". */

type Category = 'length' | 'mass' | 'volume' | 'speed' | 'data' | 'time' | 'area' | 'temperature'

interface Unit {
  category: Category
  /** Multiply by this to get the category's base unit. */
  factor: number
  label: string
}

const U: Record<string, Unit> = {}

function def(category: Category, factor: number, label: string, ...aliases: string[]): void {
  for (const alias of aliases) U[alias] = { category, factor, label }
}

// length (base: metre)
def('length', 0.001, 'mm', 'mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres')
def('length', 0.01, 'cm', 'cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres')
def('length', 1, 'm', 'm', 'meter', 'meters', 'metre', 'metres')
def('length', 1000, 'km', 'km', 'kilometer', 'kilometers', 'kilometre', 'kilometres', 'k')
def('length', 0.0254, 'in', 'in', 'inch', 'inches', '"')
def('length', 0.3048, 'ft', 'ft', 'foot', 'feet', "'")
def('length', 0.9144, 'yd', 'yd', 'yard', 'yards')
def('length', 1609.344, 'mi', 'mi', 'mile', 'miles')
def('length', 1852, 'nmi', 'nmi', 'nautical mile', 'nautical miles')
// mass (base: gram)
def('mass', 0.001, 'mg', 'mg', 'milligram', 'milligrams')
def('mass', 1, 'g', 'g', 'gram', 'grams', 'gramme', 'grammes')
def('mass', 1000, 'kg', 'kg', 'kilo', 'kilos', 'kilogram', 'kilograms')
def('mass', 1_000_000, 't', 't', 'tonne', 'tonnes', 'metric ton', 'metric tons')
def('mass', 28.349523125, 'oz', 'oz', 'ounce', 'ounces')
def('mass', 453.59237, 'lb', 'lb', 'lbs', 'pound', 'pounds')
def('mass', 6350.29318, 'st', 'st', 'stone', 'stones')
// volume (base: millilitre)
def('volume', 1, 'ml', 'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres')
def('volume', 10, 'cl', 'cl', 'centiliter', 'centilitre')
def('volume', 1000, 'L', 'l', 'liter', 'liters', 'litre', 'litres')
def('volume', 4.92892, 'tsp', 'tsp', 'teaspoon', 'teaspoons')
def('volume', 14.7868, 'tbsp', 'tbsp', 'tablespoon', 'tablespoons')
def('volume', 240, 'cup', 'cup', 'cups')
def('volume', 29.5735, 'fl oz', 'floz', 'fl oz', 'fluid ounce', 'fluid ounces')
def('volume', 568.261, 'pint (UK)', 'pint', 'pints', 'pt')
def('volume', 473.176, 'pint (US)', 'us pint', 'us pints')
def('volume', 4546.09, 'gal (UK)', 'gallon', 'gallons', 'gal', 'uk gallon')
def('volume', 3785.41, 'gal (US)', 'us gallon', 'us gallons', 'us gal')
// speed (base: m/s)
def('speed', 1, 'm/s', 'm/s', 'mps', 'meters per second', 'metres per second')
def('speed', 1 / 3.6, 'km/h', 'km/h', 'kmh', 'kph', 'kmph', 'kilometers per hour', 'kilometres per hour')
def('speed', 0.44704, 'mph', 'mph', 'miles per hour')
def('speed', 0.514444, 'kn', 'knot', 'knots', 'kn', 'kt')
// data (base: byte)
def('data', 1 / 8, 'bit', 'bit', 'bits')
def('data', 1, 'B', 'b', 'byte', 'bytes')
def('data', 1e3, 'KB', 'kb', 'kilobyte', 'kilobytes')
def('data', 1e6, 'MB', 'mb', 'megabyte', 'megabytes')
def('data', 1e9, 'GB', 'gb', 'gigabyte', 'gigabytes')
def('data', 1e12, 'TB', 'tb', 'terabyte', 'terabytes')
def('data', 1024, 'KiB', 'kib', 'kibibyte', 'kibibytes')
def('data', 1024 ** 2, 'MiB', 'mib', 'mebibyte', 'mebibytes')
def('data', 1024 ** 3, 'GiB', 'gib', 'gibibyte', 'gibibytes')
def('data', 1024 ** 4, 'TiB', 'tib', 'tebibyte', 'tebibytes')
// time (base: second)
def('time', 0.001, 'ms', 'ms', 'millisecond', 'milliseconds')
def('time', 1, 's', 's', 'sec', 'secs', 'second', 'seconds')
def('time', 60, 'min', 'min', 'mins', 'minute', 'minutes')
def('time', 3600, 'h', 'h', 'hr', 'hrs', 'hour', 'hours')
def('time', 86400, 'days', 'd', 'day', 'days')
def('time', 604800, 'weeks', 'wk', 'week', 'weeks')
def('time', 31557600, 'years', 'yr', 'yrs', 'year', 'years')
// area (base: m²)
def('area', 1, 'm²', 'm2', 'm²', 'sqm', 'square meter', 'square meters', 'square metre', 'square metres')
def('area', 0.0929030, 'ft²', 'ft2', 'ft²', 'sqft', 'sq ft', 'square foot', 'square feet')
def('area', 1e6, 'km²', 'km2', 'km²', 'square kilometer', 'square kilometers', 'square kilometre', 'square kilometres')
def('area', 2589988.11, 'mi²', 'mi2', 'mi²', 'sq mi', 'square mile', 'square miles')
def('area', 4046.8564, 'acres', 'acre', 'acres', 'ac')
def('area', 10000, 'ha', 'ha', 'hectare', 'hectares')
// temperature (handled specially)
def('temperature', 0, '°C', 'c', '°c', 'celsius', 'centigrade', 'degc')
def('temperature', 0, '°F', 'f', '°f', 'fahrenheit', 'degf')
def('temperature', 0, 'K', 'kelvin', 'kelvins')

function toKelvin(v: number, label: string): number {
  if (label === '°C') return v + 273.15
  if (label === '°F') return (v - 32) * (5 / 9) + 273.15
  return v
}
function fromKelvin(k: number, label: string): number {
  if (label === '°C') return k - 273.15
  if (label === '°F') return (k - 273.15) * (9 / 5) + 32
  return k
}

/** When only a quantity is typed ("10 km"), what people usually want to see it in. */
const DEFAULT_TARGETS: Record<string, string[]> = {
  km: ['mi'], mi: ['km'], m: ['ft', 'in'], cm: ['in'], mm: ['in'], in: ['cm'], ft: ['m'], yd: ['m'],
  kg: ['lb', 'st'], lb: ['kg'], g: ['oz'], oz: ['g'], st: ['kg'],
  '°C': ['°F'], '°F': ['°C'], K: ['°C'],
  L: ['gal (US)', 'pint (UK)'], ml: ['fl oz', 'cup'], cup: ['ml'], 'fl oz': ['ml'], 'gal (US)': ['L'], 'gal (UK)': ['L'],
  'km/h': ['mph'], mph: ['km/h'], kn: ['km/h'],
  GB: ['GiB', 'MB'], MB: ['KB'], TB: ['GB'], GiB: ['GB'],
  h: ['min'], min: ['s'], days: ['h'], weeks: ['days'], years: ['days'],
  'm²': ['ft²'], 'ft²': ['m²'], acres: ['ha'], ha: ['acres']
}

function unitByLabel(label: string): Unit | undefined {
  return Object.values(U).find((u) => u.label === label)
}

function lookup(raw: string): Unit | undefined {
  const key = raw.trim().toLowerCase().replace(/^deg(?:rees?)?\s+/, 'deg').replace(/\s+/g, ' ')
  return U[key] ?? U[key.replace(/^deg/, '')] ?? U[key.replace(/\.$/, '')]
}

export interface Conversion {
  from: string
  to: string
  value: number
  input: number
  /** "1 km = 0.621371 mi", or the formula for temperatures. */
  rate: string
}

const TEMP_FORMULA: Record<string, string> = {
  '°C>°F': '°F = °C × 9/5 + 32',
  '°F>°C': '°C = (°F − 32) × 5/9',
  '°C>K': 'K = °C + 273.15',
  'K>°C': '°C = K − 273.15',
  '°F>K': 'K = (°F − 32) × 5/9 + 273.15',
  'K>°F': '°F = (K − 273.15) × 9/5 + 32'
}

function describe(from: Unit, to: Unit): string {
  if (from.category === 'temperature') return TEMP_FORMULA[`${from.label}>${to.label}`] ?? ''
  return `1 ${from.label} = ${Number((from.factor / to.factor).toPrecision(6))} ${to.label}`
}

function convert(n: number, from: Unit, to: Unit): number {
  if (from.category === 'temperature') return fromKelvin(toKelvin(n, from.label), to.label)
  return (n * from.factor) / to.factor
}

const NUM = String.raw`(-?(?:\d[\d,]*\.?\d*|\.\d+))`
const FULL = new RegExp(`^${NUM}\\s*(.+?)\\s+(?:to|in|into|as|->|=)\\s+(.+?)\\??$`, 'i')
const BARE = new RegExp(`^${NUM}\\s*([^\\d].*?)$`, 'i')

export function convertUnits(input: string): Conversion[] {
  const text = input.trim()
  const full = FULL.exec(text)
  if (full) {
    const n = parseFloat(full[1].replace(/,/g, ''))
    const from = lookup(full[2])
    const to = lookup(full[3])
    if (!from || !to || from.category !== to.category || Number.isNaN(n)) return []
    return [{ from: from.label, to: to.label, input: n, value: convert(n, from, to), rate: describe(from, to) }]
  }
  const bare = BARE.exec(text)
  if (bare) {
    const n = parseFloat(bare[1].replace(/,/g, ''))
    const from = lookup(bare[2])
    // Single-letter units are too ambiguous without an explicit "to" (e.g. "5 m" while typing "5 min").
    if (!from || Number.isNaN(n) || bare[2].trim().length < 2) return []
    return (DEFAULT_TARGETS[from.label] ?? []).flatMap((label) => {
      const to = unitByLabel(label)
      return to ? [{ from: from.label, to: to.label, input: n, value: convert(n, from, to), rate: describe(from, to) }] : []
    })
  }
  return []
}
