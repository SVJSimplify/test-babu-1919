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

export const RATE = 83
export const CUR_KEY = 'mono-cur'
export const THRESH = { USD: { free: 35, ship: 4.95 }, INR: { free: 999, ship: 49 } }
let ACTIVE_CUR = 'USD'
try { if (localStorage.getItem(CUR_KEY) === 'INR') ACTIVE_CUR = 'INR' } catch {}
export const getCur = () => ACTIVE_CUR
export const setCur = (c) => { ACTIVE_CUR = c === 'INR' ? 'INR' : 'USD'; try { localStorage.setItem(CUR_KEY, ACTIVE_CUR) } catch {} }
export const toInr = (usd) => Math.round((usd * RATE) / 10) * 10 - 1
export function fmtNative(n, cur) {
  const c = cur === 'INR' ? 'INR' : 'USD'
  if (c === 'INR') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
  const d = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
}
export const cash = (n) => fmtNative(n, ACTIVE_CUR)
export const money = (usd) => fmtNative(ACTIVE_CUR === 'INR' ? toInr(usd) : usd, ACTIVE_CUR)
export const freeShip = () => THRESH[ACTIVE_CUR].free
export const shipFee = () => THRESH[ACTIVE_CUR].ship
export function cartTotalActive(c) {
  return c.reduce((s, i) => {
    const q = Math.min(10, Math.max(1, i.qty || 1))
    const unit = ACTIVE_CUR === 'INR' ? toInr(i.price || 0) : (i.price || 0)
    return s + unit * q
  }, 0)
}

export const PRODUCTS = [
  { id: 'MONO-P-M2-F-MO', name: 'Protect — Daily Mint', base: 'P', need: 'protect', pack: 1, price: 12, flavor: 'Pure Mint 2', art: 'Mono', badge: 'Bestseller', rating: 4.8, reviews: 412, blurb: 'Helps protect against cavities as part of a daily fluoride routine. Freshens breath.' },
  { id: 'MONO-B-Y2-F-MO', name: 'Bright — Citrus Polish', base: 'B', need: 'bright', pack: 1, price: 12, flavor: 'Yuzu Mint 2', art: 'Mono', badge: 'New', rating: 4.7, reviews: 268, blurb: 'Helps polish away surface stains from coffee and tea with regular brushing. No whitening promised — results vary by habit.' },
  { id: 'MONO-C-A1-F-MO', name: 'Calm — Gentle Mint', base: 'C', need: 'calm', pack: 1, price: 12, flavor: 'Aloe-Mint 1', art: 'Mono', rating: 4.9, reviews: 351, blurb: 'A mild routine for sensitive mouths. Does not treat or cure sensitivity — see a dentist for pain.' },
  { id: 'BUNDLE-P-3PK', name: 'Protect 3-Pack', base: 'P', need: 'protect', pack: 3, price: 29, compareAt: 36, flavor: 'Pure Mint 2 x3', art: 'Mono', tag: 'Save $7', badge: 'Best value', rating: 4.9, reviews: 522, blurb: 'Same Protect routine, three tubes. Single-base pack only to keep batches simple.' },
  { id: 'BUNDLE-B-3PK', name: 'Bright 3-Pack', base: 'B', need: 'bright', pack: 3, price: 29, compareAt: 36, flavor: 'Yuzu Mint 2 x3', art: 'Mono', tag: 'Save $7', rating: 4.8, reviews: 194, blurb: 'Same Bright routine, three tubes. Helps maintain a polished look with regular brushing.' },
  { id: 'BUNDLE-C-3PK', name: 'Calm 3-Pack', base: 'C', need: 'calm', pack: 3, price: 29, compareAt: 36, flavor: 'Aloe-Mint 1 x3', art: 'Mono', tag: 'Save $7', rating: 4.9, reviews: 287, blurb: 'Same Calm routine, three tubes. A gentle staple to keep on hand.' },
  { id: 'BUNDLE-CALM-KIT', name: 'Sensitivity Starter Kit', base: 'C', need: 'calm', pack: 1, price: 16, flavor: 'Aloe-Mint 1', art: 'Mono', tag: 'Starter', badge: 'Starter', rating: 4.7, reviews: 156, blurb: 'One Calm tube plus a soft-brush routine card. Brush not shipped. Use a soft brush and gentle pressure.' },
  { id: 'BUNDLE-FAMILY-4PK', name: 'Family 4-Pack (2 Protect + 2 Calm)', base: 'P', need: 'all', pack: 4, price: 39, compareAt: 48, flavor: 'Mint 2 x2 + Mint 1 x2', art: 'Mono', tag: 'Save $9', badge: 'Best value', rating: 4.8, reviews: 203, blurb: 'Fixed set: 2x Protect + 2x Calm. No custom mixing. Helps the household keep a fresh daily routine.' },
]

export const MERCH = [
  { id: 'MERCH-TEE', name: 'Heavyweight Tee', base: 'M', need: 'all', pack: 1, price: 32, compareAt: 36, flavor: 'Black', art: 'Tee', sizes: ['S', 'M', 'L', 'XL'], badge: 'Bestseller', rating: 4.9, reviews: 1842, blurb: '240gsm boxy tee, tonal chest logo. Pre-shrunk.' },
  { id: 'MERCH-TOTE', name: 'Everyday Tote', base: 'M', need: 'all', pack: 1, price: 18, flavor: 'Natural', art: 'Tote', badge: '', rating: 4.8, reviews: 967, blurb: '12oz canvas, interior pocket, reinforced straps.' },
  { id: 'MERCH-MUG', name: 'Enamel Camp Mug', base: 'M', need: 'all', pack: 1, price: 22, flavor: 'White / 12oz', art: 'Mug', badge: 'Low stock', rating: 4.7, reviews: 543, blurb: '12oz enamel steel, dishwasher safe. MONO. wrap print.' },
  { id: 'MERCH-CASE', name: 'Travel Zip Case', base: 'M', need: 'all', pack: 1, price: 24, flavor: 'Black', art: 'Case', badge: 'New', rating: 4.8, reviews: 312, blurb: 'Water-resistant shell, fits paste + brush. Wipe clean.' },
  { id: 'MERCH-STK', name: 'Sticker Pack (5)', base: 'M', need: 'all', pack: 1, price: 8, flavor: 'B/W', art: 'Stickers', badge: '', rating: 4.9, reviews: 2103, blurb: 'Matte vinyl, waterproof. Logos + type marks.' },
  { id: 'MERCH-PST', name: 'Mono Poster A3', base: 'M', need: 'all', pack: 1, price: 16, flavor: 'White / A3', art: 'Poster', badge: 'Limited', rating: 4.6, reviews: 189, blurb: '200gsm matte, ships rolled. Fits standard A3 frame.' },
]

const CART_KEY = 'mono-cart'
const ORDER_KEY = 'mono-orders'
export function loadCart() {
  try { const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(v) ? v.filter((i) => i && i.sku) : [] }
  catch { return [] }
}
export function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)) } catch {} }
export function cartCount(c) { return c.reduce((s, i) => s + Math.min(10, Math.max(1, i.qty || 1)), 0) }
export function cartTotal(c) { return c.reduce((s, i) => s + (i.price || 0) * Math.min(10, Math.max(1, i.qty || 1)), 0) }
export function sameLine(a, b) {
  return a.sku === b.sku && (a.pack || '') === (b.pack || '') && (a.flavor || '') === (b.flavor || '') && (a.art || '') === (b.art || '') && !!a.photo === !!b.photo && (a.customNote || '') === (b.customNote || '')
}
export function loadOrders() {
  try { const v = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]'); return Array.isArray(v) ? v : [] }
  catch { return [] }
}
export function saveOrders(o) { try { localStorage.setItem(ORDER_KEY, JSON.stringify(o)) } catch {} }
export function newOrderId() {
  const raw = (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase().replace(/[^A-Z0-9]/g, '')
  return `MONO-${(raw + 'XXXXXX').slice(0, 6)}`
}
