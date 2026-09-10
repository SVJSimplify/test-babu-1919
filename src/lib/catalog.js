export const BASES = {
  P: {
    id: 'P', name: 'Protect', fluoridePpm: 1450, rda: 85, ph: 7.8, sheet: 'v1.2',
    tag: 'Stay fresh daily',
    desc: 'Everyday fluoride base. Helps protect against cavities when you brush 2x/day.',
    formula: [
      { inci: 'Sodium Fluoride', pct: '0.32% (1450 ppm F)', fn: 'anticavity aid', grade: 'A' },
      { inci: 'Hydrated Silica', pct: '16%', fn: 'cleaning abrasive', grade: 'A' },
      { inci: 'Sorbitol / Glycerin', pct: '42%', fn: 'humectant', grade: 'A' },
      { inci: 'Sodium Lauroyl Sarcosinate / CAPB', pct: '1.5% (SLS-free opt)', fn: 'foam', grade: 'A' },
    ],
  },
  B: {
    id: 'B', name: 'Bright', fluoridePpm: 1450, rda: 110, ph: 7.6, sheet: 'v1.2',
    tag: 'Brighter look, gently',
    desc: 'Polishes surface stains from coffee/tea for brighter-looking smile. Does not bleach.',
    formula: [
      { inci: 'Sodium Fluoride', pct: '0.32% (1450 ppm F)', fn: 'anticavity aid', grade: 'A' },
      { inci: 'Hydrated Silica', pct: '19%', fn: 'polishing', grade: 'A' },
      { inci: 'Tetrasodium Pyrophosphate', pct: '2%', fn: 'tartar appearance aid', grade: 'B' },
      { inci: 'Sodium Bicarbonate', pct: '5%', fn: 'mild polish + feel', grade: 'B' },
    ],
  },
  C: {
    id: 'C', name: 'Calm', fluoridePpm: 1450, rda: 65, ph: 7.9, sheet: 'v1.2',
    tag: 'Gentle comfort',
    desc: 'Lower-abrasion base with potassium nitrate for sensitive-feeling teeth.',
    formula: [
      { inci: 'Potassium Nitrate', pct: '5%', fn: 'sensitivity comfort aid', grade: 'B' },
      { inci: 'Sodium Fluoride', pct: '0.32% (1450 ppm F)', fn: 'anticavity aid', grade: 'A' },
      { inci: 'Hydrated Silica', pct: '12%', fn: 'low-abrasive cleaning', grade: 'A' },
      { inci: 'Xylitol', pct: '5%', fn: 'sweetener / feel', grade: 'C' },
    ],
  },
}

export const FLAVORS = {
  M: { name: 'Pure Mint', note: 'classic cool', group: 'clinical' },
  Y: { name: 'Yuzu Mint', note: 'citrus lift', group: 'clinical' },
  E: { name: 'Eucalyptus', note: 'herbal fresh', group: 'clinical' },
  N: { name: 'Neem-Mint', note: 'mild herbal, taste only', group: 'botanical' },
  T: { name: 'Tulsi-Mint', note: 'sweet herbal, taste only', group: 'botanical' },
  V: { name: 'Clove-Mint', note: 'warm spice, taste only', group: 'botanical' },
  F: { name: 'Fennel Sweet-Mint', note: 'sweet licorice-like, taste only', group: 'botanical' },
  K: { name: 'Coconut-Mint', note: 'creamy mild, taste only', group: 'botanical' },
  A: { name: 'Aloe-Mint', note: 'low-tingle, taste only', group: 'botanical' },
  W: { name: 'Cinnamon-Mint', note: 'warm, low dose, taste only', group: 'botanical' },
  H: { name: 'Herbal Blend', note: 'charcoal-free mix, taste only', group: 'botanical' },
}
export const CLINICAL = ['M', 'Y', 'E']
export const BOTANICAL = ['N', 'T', 'V', 'F', 'K', 'A', 'W', 'H']
export const ARTS = { MO: 'Mono', SP: 'Split', DO: 'Dots' }

export function toSKU(c) {
  return `MONO-${c.need}-${c.flavor}${c.intensity}-${c.sls}-${c.art}`
}
const CUSTOM_RE = /^MONO-[PBC]-[MYENVFKAWH][123]-[FS]-(MO|SP|DO)$/
const BUNDLE_RE = /^BUNDLE-(?:[PBC]-3PK|CALM-KIT|FAMILY-4PK)$/
export function validSKU(s) {
  return CUSTOM_RE.test(s) || BUNDLE_RE.test(s)
}
export function sanitizeName(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 16)
}
export function sanitizeNote(s) {
  return (s || '').replace(/https?:\S+/gi, '').slice(0, 140)
}

export const PRODUCTS = [
  { id: 'MONO-P-M2-F-MO', name: 'Protect — Daily Mint', base: 'P', need: 'protect', pack: 1, price: 12, flavor: 'Pure Mint 2', art: 'Mono', blurb: 'Helps protect against cavities as part of a daily fluoride routine. Freshens breath.' },
  { id: 'MONO-B-Y2-F-MO', name: 'Bright — Citrus Polish', base: 'B', need: 'bright', pack: 1, price: 12, flavor: 'Yuzu Mint 2', art: 'Mono', blurb: 'Helps polish away surface stains from coffee and tea with regular brushing. No whitening promised — results vary by habit.' },
  { id: 'MONO-C-A1-F-MO', name: 'Calm — Gentle Mint', base: 'C', need: 'calm', pack: 1, price: 12, flavor: 'Aloe-Mint 1', art: 'Mono', blurb: 'A mild routine for sensitive mouths. Does not treat or cure sensitivity — see a dentist for pain.' },
  { id: 'BUNDLE-P-3PK', name: 'Protect 3-Pack', base: 'P', need: 'protect', pack: 3, price: 29, flavor: 'Pure Mint 2 x3', art: 'Mono', tag: 'Save $7', blurb: 'Same Protect routine, three tubes. Single-base pack only to keep batches simple.' },
  { id: 'BUNDLE-B-3PK', name: 'Bright 3-Pack', base: 'B', need: 'bright', pack: 3, price: 29, flavor: 'Yuzu Mint 2 x3', art: 'Mono', tag: 'Save $7', blurb: 'Same Bright routine, three tubes. Helps maintain a polished look with regular brushing.' },
  { id: 'BUNDLE-C-3PK', name: 'Calm 3-Pack', base: 'C', need: 'calm', pack: 3, price: 29, flavor: 'Aloe-Mint 1 x3', art: 'Mono', tag: 'Save $7', blurb: 'Same Calm routine, three tubes. A gentle staple to keep on hand.' },
  { id: 'BUNDLE-CALM-KIT', name: 'Sensitivity Starter Kit', base: 'C', need: 'calm', pack: 1, price: 16, flavor: 'Aloe-Mint 1', art: 'Mono', tag: 'Starter', blurb: 'One Calm tube plus a soft-brush routine card. Brush not shipped. Use a soft brush and gentle pressure.' },
  { id: 'BUNDLE-FAMILY-4PK', name: 'Family 4-Pack (2 Protect + 2 Calm)', base: 'P', need: 'all', pack: 4, price: 39, flavor: 'Mint 2 x2 + Mint 1 x2', art: 'Mono', tag: 'Save $9', blurb: 'Fixed set: 2x Protect + 2x Calm. No custom mixing. Helps the household keep a fresh daily routine.' },
]

const CART_KEY = 'mono-cart'
export function loadCart() {
  try { const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(v) ? v : [] }
  catch { return [] }
}
export function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)) }
export function cartTotal(c) { return c.reduce((s, i) => s + (i.price || 0), 0) }
