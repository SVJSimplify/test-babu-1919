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
  S: { name: 'Spearmint', note: 'cool sweet-mint, mild', group: 'clinical' },
  G: { name: 'Wintergreen', note: 'warm mint, low dose', group: 'clinical' },
  B: { name: 'Berry Frost', note: 'sweet berry + cool', group: 'clinical' },
  N: { name: 'Neem-Mint', note: 'mild herbal, taste only', group: 'botanical' },
  T: { name: 'Tulsi-Mint', note: 'sweet herbal, taste only', group: 'botanical' },
  V: { name: 'Clove-Mint', note: 'warm spice, taste only', group: 'botanical' },
  F: { name: 'Fennel Sweet-Mint', note: 'sweet licorice-like, taste only', group: 'botanical' },
  K: { name: 'Coconut-Mint', note: 'creamy mild, taste only', group: 'botanical' },
  A: { name: 'Aloe-Mint', note: 'low-tingle, taste only', group: 'botanical' },
  W: { name: 'Cinnamon-Mint', note: 'warm, low dose, taste only', group: 'botanical' },
  H: { name: 'Herbal Blend', note: 'charcoal-free mix, taste only', group: 'botanical' },
  C: { name: 'Cardamom-Mint', note: 'sweet-spicy, taste only', group: 'botanical' },
  J: { name: 'Ginger-Mint', note: 'mild warmth, taste only', group: 'botanical' },
  O: { name: 'Rose-Mint', note: 'light floral, taste only', group: 'botanical' },
}
export const CLINICAL = ['M', 'Y', 'E', 'S', 'G', 'B']
export const BOTANICAL = ['N', 'T', 'V', 'F', 'K', 'A', 'W', 'H', 'C', 'J', 'O']
export const ARTS = { MO: 'Mono', SP: 'Split', DO: 'Dots' }

export function toSKU(c) {
  return `MONO-${c.need}-${c.flavor}${c.intensity}-${c.sls}-${c.art}`
}
const CUSTOM_RE = /^MONO-[PBC]-[ABCEFGHJKMNOSTVWY][123]-[FS]-(MO|SP|DO)$/
const BUNDLE_RE = /^BUNDLE-(?:[PBC]-3PK|CALM-KIT|FAMILY-4PK)$/
const MERCH_RE = /^MERCH-[A-Z0-9]{3,8}$/
export function validSKU(s) {
  return CUSTOM_RE.test(s) || BUNDLE_RE.test(s) || MERCH_RE.test(s)
}
export const isMerch = (s) => MERCH_RE.test(s || '')
export function sanitizeName(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 16)
}
export function sanitizeNote(s) {
  return (s || '').replace(/https?:\S+/gi, '').slice(0, 140)
}

export const FREE_SHIP = 35
export const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(n % 1 === 0 ? 0 : 2)}`
