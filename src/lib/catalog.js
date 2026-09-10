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
  M: { name: 'Pure Mint', note: 'classic cool' },
  Y: { name: 'Yuzu Mint', note: 'citrus lift' },
  E: { name: 'Eucalyptus', note: 'herbal fresh' },
}
export const ARTS = { MO: 'Mono', SP: 'Split', DO: 'Dots' }

export function toSKU(c) {
  return `MONO-${c.need}-${c.flavor}${c.intensity}-${c.sls}-${c.art}`
}
export function validSKU(s) {
  return /^MONO-[PBC]-[MYE][123]-[FS]-(MO|SP|DO)$/.test(s)
}
export function sanitizeName(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 16)
}
