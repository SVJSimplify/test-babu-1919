import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring } from 'framer-motion'
import { BASES, FLAVORS, CLINICAL, BOTANICAL, ARTS, PRODUCTS, MERCH, money, cash, fmtNative, toInr, toSKU, validSKU, isMerch, sanitizeName, sanitizeNote, loadCart, saveCart, cartCount, cartTotal, cartTotalActive, sameLine, loadOrders, saveOrders, newOrderId, getCur, setCur, freeShip, shipFee } from './lib/catalog.js'

const ROUTES = ['home', 'shop', 'merch', 'customize', 'science', 'plan', 'faq', 'disclaimer', 'checkout']
const TITLES = { home: 'MONO. — Toothpaste, reduced to what works', shop: 'Shop — MONO.', merch: 'Merch — MONO.', customize: 'Customize — MONO.', science: 'Science — MONO.', plan: 'Our plan — MONO.', faq: 'FAQ — MONO.', disclaimer: 'Disclaimer — MONO.', checkout: 'Checkout — MONO.' }
const NAV = [['home', 'Shop'], ['shop', 'All products'], ['merch', 'Merch'], ['customize', 'Customize'], ['science', 'Science'], ['plan', 'Plan'], ['faq', 'FAQ']]
function useHash() {
  const get = () => (window.location.hash || '#home').replace('#', '').split('?')[0] || 'home'
  const [r, setR] = useState(ROUTES.includes(get()) ? get() : 'home')
  useEffect(() => {
    const f = () => setR(ROUTES.includes(get()) ? get() : 'home')
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return [r, (x) => { window.location.hash = x }]
}

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25, ease: 'easeOut' } }
const gridP = { h: {}, s: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }
const gridC = { h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } } }
function Reveal({ children }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.4, ease: 'easeOut' }}>{children}</motion.div>
}
function MBtn({ sec, block, ...rest }) {
  return <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className={(sec ? 'btn sec' : 'btn') + (block ? ' block' : '')} {...rest} />
}
function AddBtn({ onAdd, label, price }) {
  const [ok, setOk] = useState(false)
  const t = useRef(null)
  useEffect(() => () => { if (t.current) clearTimeout(t.current) }, [])
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="btn block" aria-live="polite"
      onClick={() => { onAdd(); setOk(true); if (t.current) clearTimeout(t.current); t.current = setTimeout(() => setOk(false), 1600) }}
      aria-label={ok ? `${label} added` : `Add ${label} to cart`}>
      <AnimatePresence mode="wait" initial={false}>
        {ok
          ? <motion.span key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>Added — check cart</motion.span>
          : <motion.span key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>Add — {money(price)}</motion.span>}
      </AnimatePresence>
    </motion.button>
  )
}
function Stars({ rating, reviews }) {
  return <p className="small"><span className="stars" aria-hidden="true">{'★'.repeat(Math.round(rating))}</span> <span className="sr-only">Rated {rating} out of 5. </span>{rating} ({reviews}) · <span className="muted">taste &amp; routine</span></p>
}
function VerifyPanel({ sku, base }) {
  return (
    <div className="card mist">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="qr">QR /<br />LOT-0000<br />SAMPLE</div>
        <div>
          <div className="sku">{sku || 'MONO-P-M2-F-MO'}</div>
          <div className="small">Base {base.name} · Fixed sheet {base.sheet} · GMP made</div>
          <div className="row" style={{ marginTop: 8 }}>
            <span className="pill">Fluoride {base.fluoridePpm} ppm</span>
            <span className="pill">RDA {base.rda}</span>
            <span className="pill">pH {base.ph}</span>
          </div>
          <p className="small muted">Sample shown. Scan a real tube to verify its batch.</p>
          <p className="small">Dentist label-accuracy review: DDS [Name, Lic #] — not personal advice.</p>
          <p className="small"><b>No guarantees. 14-day fresh-breath habit promise only.</b></p>
        </div>
      </div>
    </div>
  )
}
function Tube({ art, name, photo }) {
  return (
    <div className="tube">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={art + (name || '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className={`tubeart ${art.toLowerCase()}`}>
            <div className="tubelabel">{name || 'MONO.'}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="small muted">preview — {ARTS[art]} · B/W only</div>
      {photo && <img className="photoprev" src={photo} alt="Your design reference preview" />}
    </div>
  )
}
function fileToThumb(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'))
    if (file.size > 2 * 1024 * 1024) return reject(new Error('Over 2MB'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const max = 480
        const sc = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(img.width * sc))
        c.height = Math.max(1, Math.round(img.height * sc))
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        URL.revokeObjectURL(url)
        resolve(c.toDataURL('image/jpeg', 0.8))
      } catch (e) { reject(e) }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unreadable')) }
    img.src = url
  })
}

function useCart() {
  const [items, setItems] = useState(loadCart)
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const commit = (next) => { setItems(next); saveCart(next) }
  const add = (item, qty = 1, silent = false) => {
    if (item.sku && !validSKU(item.sku)) { setMsg('Invalid SKU, not added'); return }
    const next = [...items]
    const found = next.find((i) => sameLine(i, item))
    if (found) found.qty = Math.min(10, (found.qty || 1) + qty)
    else next.push({ ...item, qty: Math.min(10, Math.max(1, qty)), ts: Date.now() })
    commit(next)
    setMsg(`Added ${item.label || item.sku} to cart`)
    if (!silent) setOpen(true)
  }
  const setQty = (ts, qty) => {
    const q = Math.min(10, Math.max(1, qty))
    commit(items.map((i) => (i.ts === ts ? { ...i, qty: q } : i)))
  }
  const removeAt = (ts) => {
    const gone = items.find((i) => i.ts === ts)
    commit(items.filter((i) => i.ts !== ts))
    if (gone) setMsg(`${gone.label} removed`)
  }
  const clear = () => commit([])
  return { items, add, setQty, removeAt, clear, open, setOpen, msg, count: cartCount(items), total: cartTotal(items), totalA: cartTotalActive(items) }
}

function ProductCard({ p, onAdd, index }) {
  return (
    <motion.article className="card shopcard" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }} whileHover={{ y: -4 }}>
      <div className="minituve" aria-hidden="true"><motion.div className={`minibody ${p.base === 'B' ? 'dot' : p.base === 'C' ? '' : 'stripe'}`} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} /></div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ minHeight: 26 }}>{p.badge ? <span className={`badge ${p.badge === 'Best value' ? 'solid' : 'line'}`}>{p.badge}</span> : <span className="badge spacer">—</span>}</div>
        <h3 style={{ margin: '4px 0' }}>{p.name}</h3>
        <p className="small muted" style={{ margin: 0 }}>{p.flavor} · {p.pack}-pack</p>
        <Stars rating={p.rating} reviews={p.reviews} />
        <p className="small" style={{ margin: 0 }}>{p.blurb}</p>
        <p style={{ margin: '4px 0' }}><b>{money(p.price)}</b>{p.compareAt && <span className="small muted"> <s>{money(p.compareAt)}</s></span>}</p>
        <p className="small muted sku" style={{ margin: 0 }}>{p.id}</p>
        <div style={{ marginTop: 'auto', paddingTop: 8 }}><AddBtn onAdd={() => onAdd(p)} label={p.name} price={p.price} /></div>
      </div>
    </motion.article>
  )
}

function CartDrawer({ cart, go }) {
  const { items, setQty, removeAt, open, setOpen, msg, totalA, count } = cart
  const closeRef = useRef(null)
  const opener = useRef(null)
  useEffect(() => {
    if (open) {
      opener.current = document.activeElement
      document.body.style.overflow = 'hidden'
      if (closeRef.current) closeRef.current.focus()
    } else {
      document.body.style.overflow = ''
      if (opener.current && opener.current.focus) opener.current.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open ])
  const away = Math.max(0, freeShip() - totalA)
  const trap = (e) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key !== 'Tab') return
    const box = e.currentTarget
    const f = box.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const list = Array.from(f).filter((el) => !el.disabled)
    if (!list.length) return
    const first = list[0], last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <AnimatePresence>
      {open && (
        <div onKeyDown={trap}>
          <motion.div className="drawer-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setOpen(false)} aria-hidden="true" />
          <motion.aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" id="cart-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}>
            <div className="drawer-head">
              <h2 style={{ margin: 0 }}>Your cart ({count})</h2>
              <button type="button" ref={closeRef} className="btn sec" style={{ padding: '8px 16px' }} onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
            </div>
            <div className="drawer-body">
              <p aria-live="polite" className="small">{msg}</p>
              {items.length === 0 && (
                <div>
                  <p><b>Your cart is empty.</b></p>
                  <p className="small muted">Start with Protect — Daily Mint.</p>
                  <MBtn onClick={() => { setOpen(false); go('shop') }}>Shop bestsellers</MBtn>
                </div>
              )}
              {items.map((c) => (
                <div className="lineitem" key={c.ts}>
                  <div className={`minism ${isMerch(c.sku) ? '' : c.sku.includes('-B-') || c.sku.startsWith('BUNDLE-B') ? 'dot' : c.sku.includes('-C-') || c.sku.startsWith('BUNDLE-CALM') ? '' : 'stripe'}`} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <b className="small">{c.label}</b>
                    <p className="small muted" style={{ margin: '2px 0' }}>{isMerch(c.sku) ? c.flavor : `${c.flavor} · ${c.pack}-pack`} · {money(c.price)}{c.photo ? ' · photo ref' : ''}</p>
                    {c.customNote ? <p className="small muted" style={{ margin: '2px 0' }}>Note: {c.customNote}</p> : null}
                    <div className="row" style={{ alignItems: 'center', marginTop: 6 }}>
                      <span className="stepper">
                        <button type="button" disabled={(c.qty || 1) <= 1} onClick={() => setQty(c.ts, (c.qty || 1) - 1)} aria-label={`Decrease quantity for ${c.label}`}>−</button>
                        <output aria-live="polite" aria-label={`Quantity for ${c.label}`}>{c.qty || 1}</output>
                        <button type="button" disabled={(c.qty || 1) >= 10} onClick={() => setQty(c.ts, (c.qty || 1) + 1)} aria-label={`Increase quantity for ${c.label}`}>+</button>
                      </span>
                      <button type="button" className="tlink" onClick={() => removeAt(c.ts)} aria-label={`Remove ${c.label} from cart`}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="drawer-foot">
                {away > 0
                  ? <p className="small">You are <b>{cash(away)}</b> away from free shipping</p>
                  : <p className="small"><b>Free shipping unlocked ✓</b></p>}
                <div className="shipbar" role="progressbar" aria-valuemin={0} aria-valuemax={freeShip()} aria-valuenow={Math.min(totalA, freeShip())} aria-label="Progress to free shipping">
                  <div style={{ width: `${Math.min(100, (totalA / freeShip()) * 100)}%` }} />
                </div>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}><b>Subtotal</b><b>{cash(totalA)}</b></p>
                <div className="row">
                  <MBtn block onClick={() => { setOpen(false); go('checkout') }}>Checkout</MBtn>
                  <MBtn sec block onClick={() => setOpen(false)}>Continue shopping</MBtn>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

const AD_LINES = ['Brush twice.', 'Same base. Every tube.', 'Taste is a choice.', 'No color. No noise.']
function BrandAd({ go }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (reduced || paused) return
    const id = setInterval(() => setI((v) => (v + 1) % AD_LINES.length), 3000)
    return () => clearInterval(id)
  }, [reduced, paused])
  return (
    <section className="adfilm" aria-roledescription="carousel" aria-label="MONO brand messages"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="adfilm-in">
        <p className="eyebrow">MONO film — 01 / Routine</p>
        <div aria-live="off">
          {reduced ? (
            <blockquote>{AD_LINES[0]}</blockquote>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote key={i} aria-roledescription="slide" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
                {AD_LINES[i]}
              </motion.blockquote>
            </AnimatePresence>
          )}
        </div>
        <p className="sub small">Plain toothpaste. Pick a flavor, keep the routine.</p>
        <p><a href="#shop" className="cta" onClick={(e) => { e.preventDefault(); go('shop') }}>Shop the routine</a></p>
        {!reduced && (
          <div>
            <div className="addots" role="group" aria-label="Choose message">
              {AD_LINES.map((l, n) => (
                <button type="button" key={l} onClick={() => setI(n)} aria-label={`Show message ${n + 1}: ${l}`} aria-current={n === i ? 'true' : 'false'}><span style={{ width: n === i ? 28 : 12 }} /></button>
              ))}
            </div>
            <button type="button" className="adpause" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Play messages' : 'Pause messages'}</button>
          </div>
        )}
      </div>
    </section>
  )
}
function MethodStrip({ go }) {
  const bars = [['Base — 1st · 1450 ppm NaF, fixed', 100], ['Taste — 2nd · botanicals are taste-only', 50], ['Design — 3rd · aesthetics only', 20]]
  return (
    <div style={{ background: 'var(--mist)' }}><div className="wrap section">
      <Reveal><p className="small sku">Our methodology</p><h2>Fluoride first. Taste second. Design last.</h2>
        <p className="muted">Three fixed bases at 1450 ppm fluoride. Pick a clinical flavor first, a botanical second, your design last.</p></Reveal>
      <div className="grid3">
        {[['01 — Clinical base', 'The non-negotiable. Same fluoride level in every option, formulated to help protect with twice-daily brushing.'], ['02 — Taste', 'Choice, not therapy. Clinical flavors first, botanicals second for taste only.'], ['03 — Design', 'Yours. Tube, name, artwork. Personal preference only.']].map(([t, d]) => (
          <Reveal key={t}><div className="card"><b>{t}</b><p className="small">{d}</p></div></Reveal>
        ))}
      </div>
      <div className="methodbars" style={{ marginTop: 16 }} aria-label="What matters most">
        {bars.map(([t, w]) => (
          <div key={t}><span className="small" style={{ minWidth: 220 }}>{t}</span><span className="bar"><div style={{ width: `${w}%` }} /></span></div>
        ))}
      </div>
      <p><MBtn sec onClick={() => go('science')}>Read the science</MBtn></p>
    </div></div>
  )
}
const MERCH_GLYPH = { Tee: 'T', Tote: 'O', Mug: 'M', Case: 'C', Stickers: 'S', Poster: 'P' }
function MerchCard({ m, index, onAdd }) {
  const [size, setSize] = useState(m.sizes ? 'M' : 'OS')
  return (
    <motion.article className="card shopcard" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }} whileHover={{ y: -4 }}>
      <div className="merchsw" aria-hidden="true"><div className="merchglyph">{MERCH_GLYPH[m.art] || 'M'}</div></div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ minHeight: 26 }}>{m.badge ? <span className={`badge ${m.badge === 'Bestseller' ? 'solid' : 'line'}`}>{m.badge}</span> : <span className="badge spacer">—</span>}</div>
        <h3 style={{ margin: '4px 0' }}>{m.name}</h3>
        <p className="small muted" style={{ margin: 0 }}>{m.flavor}</p>
        <Stars rating={m.rating} reviews={m.reviews} />
        <p className="small" style={{ margin: 0 }}>{m.blurb}</p>
        <p style={{ margin: '4px 0' }}><b>{money(m.price)}</b>{m.compareAt && <span className="small muted"> <s>{money(m.compareAt)}</s></span>}</p>
        {m.sizes && (
          <div className="sizepills" role="group" aria-label={`${m.name} size`}>
            {m.sizes.map((s) => (
              <button type="button" key={s} className="sizepill" aria-pressed={size === s} aria-label={`Size ${s}`} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <AddBtn onAdd={() => onAdd(m, size)} label={size !== 'OS' ? `${m.name} size ${size}` : m.name} price={m.price} />
        </div>
      </div>
    </motion.article>
  )
}
function Merch({ cart }) {
  return (
    <div className="wrap">
      <h1>Merch. Black and white.</h1>
      <p className="muted">Wear the routine. Same free shipping over {cash(freeShip())}.</p>
      <p aria-live="polite" className="small">{cart.msg}</p>
      <div className="shopgrid" style={{ marginTop: 12 }}>
        {MERCH.map((m, i) => (
          <MerchCard key={m.id} m={m} index={i} onAdd={(x, size) => cart.add({ sku: x.id, label: x.name + (size && size !== 'OS' ? ` (${size})` : ''), pack: size || 'OS', price: x.price, flavor: x.flavor, art: x.art, photo: false, customNote: '' })} />
        ))}
      </div>
    </div>
  )
}

function Home({ go, cart }) {
  const [goal, setGoal] = useState('Stay fresh')
  const [email, setEmail] = useState('')
  const [news, setNews] = useState('')
  const best = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 3)
  const join = () => {
    if (/.+@.+\..+/.test(email.trim())) setNews('You are in. Please check your inbox to confirm.')
    else setNews('Enter an email like name@example.com.')
  }
  return (
    <div>
      <div className="wrap">
        <div className="hero">
          <motion.div initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}>
            <motion.h1 variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>Toothpaste, reduced to what works.</motion.h1>
            <motion.p variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>Fluoride toothpaste that helps protect teeth when you brush twice daily. 3 fixed bases. Pick a need. Pick a flavor. Put your name on it.</motion.p>
            <motion.div className="row" style={{ alignItems: 'center' }} variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
              <MBtn onClick={() => go('customize')}>Find your base</MBtn>
              <button type="button" className="tlink" onClick={() => go('shop')}>or browse all products</button>
              <button type="button" className="tlink" onClick={() => go('science')}>what is inside</button>
            </motion.div>
            <motion.p className="small muted" variants={{ h: { opacity: 0 }, s: { opacity: 1 } }}>No custom % mixing. Every batch made to the same sheet.</motion.p>
          </motion.div>
          <Tube art="MO" name="MONO." />
        </div>
      </div>
      <div className="wrap"><div className="trustgrid" role="list" aria-label="Why MONO">
        {[['1450 ppm fluoride', 'In every tube, to help care for enamel.'], ['SLS-free options', 'Low-foam picks for a milder taste.'], ['GMP-made', 'Fixed sheets, batch traceability.'], ['B/W design', 'One look. No clutter.']].map(([t, d]) => (
          <div role="listitem" key={t}><b className="small">{t}</b><p className="small muted" style={{ margin: '4px 0 0' }}>{d}</p></div>
        ))}
      </div></div>
      <BrandAd go={go} />
      <div className="wrap section" id="bestsellers">
        <Reveal><h2>Bestsellers</h2></Reveal>
        <motion.div className="shopgrid" variants={gridP} initial="h" whileInView="s" viewport={{ once: true, margin: '-60px' }}>
          {best.map((p, i) => (
            <motion.div key={p.id} variants={gridC}>
              <ProductCard p={p} index={i} onAdd={(x) => cart.add({ sku: x.id, label: x.name, pack: x.pack, price: x.price, flavor: x.flavor, art: x.art, photo: false, customNote: '' })} />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div style={{ background: 'var(--mist)' }}><div className="wrap section">
        <Reveal><h2>How it works</h2></Reveal>
        <div className="grid3">
          {[['01 — Pick your base', '3 fixed formulas. All with 1450 ppm fluoride.'], ['02 — Pick your taste', 'Clinical or botanical taste. Botanicals for flavor only.'], ['03 — Keep the habit', 'Brush twice daily for 2 minutes. Helps freshen breath and polish with daily brushing.']].map(([t, d]) => (
            <Reveal key={t}><div className="card"><b>{t}</b><p className="small">{d}</p></div>
          ))}
        </div>
        <p><MBtn sec onClick={() => go('customize')}>Start customizing</MBtn></p>
      </div></div>
      <MethodStrip go={go} />
      <div className="wrap section">
        <Reveal><h2>Loved for taste + routine</h2></Reveal>
        <p className="small muted">Real routines, in their words. Taste and routine only — not health outcomes.</p>
        <div className="grid3">
          {[['AR', 5, 'Low foam, no burn. Finally finished 2 minutes.'], ['SK', 4, 'Calm + light mint. Comfort with continued use.'], ['JM', 5, 'My name on the tube. Kids stopped stealing mine.']].map(([n, s, t]) => (
            <Reveal key={n}><div className="card"><b>{n}</b> <span className="small stars" aria-hidden="true">{'★'.repeat(s)}</span><p className="small">{t}</p></div></Reveal>
          ))}
        </div>
      </div>
      <div style={{ background: '#000', color: '#fff' }}><div className="wrap section">
        <h2 style={{ color: '#fff' }}>Get 10% off your first set.</h2>
        <p className="small" style={{ color: '#cfcfcf' }}>Routine notes, once a month. No noise.</p>
        <div className="newsrow">
          <label htmlFor="news-email" className="sr-only">Email</label>
          <input id="news-email" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" onClick={join}>Join</button>
        </div>
        <p aria-live="polite" className="small" style={{ color: '#fff' }}>{news}</p>
      </div></div>
    </div>
  )
}

function Shop({ cart }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('featured')
  const list = useMemo(() => {
    let r = PRODUCTS.filter((p) => filter === 'all' ? true : p.need === filter)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((p) => `${p.name} ${p.flavor}`.toLowerCase().includes(s))
    if (sort === 'price-asc') return [...r].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...r].sort((a, b) => b.price - a.price)
    if (sort === 'pack') return [...r].sort((a, b) => b.pack - a.pack)
    return r
  }, [q, filter, sort])
  const searchRef = useRef(null)
  const reset = () => { setQ(''); setFilter('all'); setSort('featured'); if (searchRef.current) searchRef.current.focus() }
  return (
    <div className="wrap">
      <h1>Shop</h1>
      <p className="muted">Fixed bases, fixed prices. Singles {money(12)} · 3-packs {money(29)} · subscription {money(10)}/tube · kits as marked.</p>
      <div className="searchrow">
        <div className="field grow" style={{ marginBottom: 0 }}>
          <label htmlFor="shop-q">Search products</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input ref={searchRef} id="shop-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="mint, calm, 3-pack…" style={{ fontSize: 16 }} />
            {q && <button type="button" className="btn sec" onClick={() => setQ('')} aria-label="Clear search">✕</button>}
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 180 }}>
          <label htmlFor="shop-sort">Sort products</label>
          <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="pack">Pack size</option>
          </select>
        </div>
      </div>
      <div className="row" role="group" aria-label="Filter by need" style={{ marginTop: 12 }}>
        {[['all', 'All'], ['protect', 'Protect'], ['bright', 'Bright'], ['calm', 'Calm']].map(([k, l]) => (
          <button type="button" key={k} aria-pressed={filter === k} className={`optbtn ${filter === k ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <p aria-live="polite" className="small">{list.length} of {PRODUCTS.length} products{cart.msg ? ` · ${cart.msg}` : ''}</p>
      {list.length === 0 && (
        <div className="card mist">
          <p><b>No matches{q ? ` for “${q.trim()}”` : ''}.</b></p>
          <MBtn sec onClick={reset}>Reset filters</MBtn>
        </div>
      )}
      <div className="shopgrid" style={{ marginTop: 12 }}>
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} onAdd={(x) => cart.add({ sku: x.id, label: x.name, pack: x.pack, price: x.price, flavor: x.flavor, art: x.art, photo: false, customNote: '' })} />
        ))}
      </div>
      <p className="small muted">One habit promise: brush twice daily for two minutes. That routine matters more than any tube.</p>
    </div>
  )
}

function Customizer({ preset, cart }) {
  const { add, msg } = cart
  const [need, setNeed] = useState(preset || 'P')
  useEffect(() => { if (preset) setNeed(preset) }, [preset])
  const [flavor, setFlavor] = useState('M')
  const [intensity, setIntensity] = useState(2)
  const [sls, setSls] = useState('F')
  const [art, setArt] = useState('MO')
  const [label, setLabel] = useState('ALEX')
  const [note, setNote] = useState('')
  const [ack, setAck] = useState(false)
  const [showBot, setShowBot] = useState(false)
  const [photo, setPhoto] = useState(() => { try { return localStorage.getItem('mono-photo') || '' } catch { return '' } })
  const [photoErr, setPhotoErr] = useState('')
  const base = BASES[need]
  const sku = useMemo(() => toSKU({ need, flavor, intensity, sls, art }), [need, flavor, intensity, sls, art])
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const goStep = (n) => { setDir(n >= step ? 1 : -1); setStep(n) }
  const stepV = {
    enter: (d) => ({ opacity: 0, x: 32 * (d >= 0 ? 1 : -1) }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: -32 * (d >= 0 ? 1 : -1) }),
  }
  const pickFlavor = (code) => {
    if (FLAVORS[code].group === 'botanical' && !ack) return
    setFlavor(code)
  }
  const onPhoto = async (e) => {
    setPhotoErr('')
    const f = e.target.files && e.target.files[0]
    if (!f) return
    try {
      const t = await fileToThumb(f)
      setPhoto(t)
      try { localStorage.setItem('mono-photo', t) } catch { setPhotoErr('Photo too large to keep on this device; preview only.') }
    } catch { setPhotoErr('Could not use that image (JPG/PNG, max 2MB).') }
  }
  const clearPhoto = () => { setPhoto(''); try { localStorage.removeItem('mono-photo') } catch { /* noop */ } }
  const addPack = (pack, price) => {
    add({ sku, label: sanitizeName(label) || 'MONO', pack: pack === 'single' ? 1 : pack === '3-pack' ? 3 : 1, price, flavor: `${FLAVORS[flavor].name} ${intensity}`, art: ARTS[art], photo: !!photo, customNote: sanitizeNote(note) })
  }
  return (
    <div className="wrap">
      <h1>Customize — everything except the drug base</h1>
      <p className="small muted">Actives stay locked (1450ppm fluoride, fixed sheets). You customize taste, intensity, foam, tube art, name, flavor note and design photo.</p>
      <div className="steps" aria-hidden="true"><span className={step >= 1 ? 'on' : ''} /><span className={step >= 2 ? 'on' : ''} /><span className={step >= 3 ? 'on' : ''} /></div>
      <ol className="small muted" style={{ paddingLeft: 20, margin: '0 0 8px' }} aria-label="Customizer steps">
        <li>Need {step === 1 ? '(current)' : ''}</li>
        <li>Taste {step === 2 ? '(current)' : ''}</li>
        <li>Design {step === 3 ? '(current)' : ''}</li>
      </ol>
      <p aria-live="polite" className="small">{msg}</p>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div key={step} custom={dir} variants={stepV} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: 'easeOut' }} className={step === 3 ? 'step3pad' : ''}>
          {step === 1 && (
            <div>
              <h2>01 Need = fixed base (locked %)</h2>
              <div className="grid3">
                {Object.values(BASES).map((b) => (
                  <button type="button" key={b.id} aria-pressed={need === b.id} className={`optbtn ${need === b.id ? 'sel' : ''}`} onClick={() => setNeed(b.id)}>
                    <div className="sku">{b.name} · {b.id}</div>
                    <div className="small">{b.desc}</div>
                    <div className="small muted">{b.fluoridePpm} ppm · RDA {b.rda} · pH {b.ph}</div>
                  </button>
                ))}
              </div>
              <p><MBtn onClick={() => goStep(2)}>Next: taste + flavor</MBtn></p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2>02 Taste — same fluoride base in every tube</h2>
              <div className="tscroll"><table className="t"><thead><tr><th>INCI</th><th>%</th><th>Function</th></tr></thead>
                <tbody>{base.formula.map((f) => (<tr key={f.inci}><td>{f.inci}</td><td>{f.pct}</td><td>{f.fn}</td></tr>))}</tbody>
              </table></div>
              <h3>Clinical fresh — first priority</h3>
              <div className="row" role="group" aria-label="Clinical flavors">
                {CLINICAL.map((k) => (
                  <button type="button" key={k} aria-pressed={flavor === k} className={`optbtn ${flavor === k ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setFlavor(k)}><b>{FLAVORS[k].name}</b><div className="small muted">{FLAVORS[k].note}</div></button>
                ))}
              </div>
              <div className="collapse">
                <MBtn sec onClick={() => setShowBot(!showBot)} aria-expanded={showBot} aria-controls="bot-panel">{showBot ? 'Hide botanical flavors' : 'Show botanical flavors — 2nd priority'}</MBtn>
                <AnimatePresence initial={false}>
                  {showBot && (
                    <motion.div id="bot-panel" key="bot" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
                      <div style={{ paddingTop: 12 }}>
                        <p className="small"><b>Botanical flavors — taste only, same protection.</b> Same 1450ppm fluoride base as above. Difference is taste only. No added therapeutic benefit. How you brush matters. Follow dentist advice.</p>
                        <label className="small" style={{ display: 'block', margin: '8px 0' }}>
                          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> I understand this is taste only.
                        </label>
                        <div className="row" role="group" aria-label="Botanical flavors">
                          {BOTANICAL.map((k) => (
                            <button type="button" key={k} disabled={!ack} aria-pressed={flavor === k} className={`optbtn ${flavor === k ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => pickFlavor(k)} title={ack ? FLAVORS[k].note : 'Tick the taste-only box first'}><b>{FLAVORS[k].name}</b><div className="small muted">{FLAVORS[k].note}</div></button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <h3><label htmlFor="flav-note" style={{ font: 'inherit', fontWeight: 'bold' }}>Describe your flavor idea (optional)</label></h3>
              <textarea id="flav-note" className="txt" rows="2" maxLength={140} value={note} onChange={(e) => setNote(e.target.value.slice(0, 140))} placeholder="e.g. lighter clove, less sweet fennel..." aria-describedby="notehelp" />
              <p id="notehelp" className="small muted">{note.length}/140 — Request only. Matched to our approved factory flavor library. No custom oils, no at-home drops, no change to the fluoride base. If it cannot be matched safely, your tube is made in Mild Mint and you are notified.</p>
              <h3>Intensity (factory-dosed, not post-fill)</h3>
              <div className="row" role="group" aria-label="Flavor intensity">
                {[1, 2, 3].map((i) => (
                  <button type="button" key={i} aria-pressed={intensity === i} className={`optbtn ${intensity === i ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setIntensity(i)}><b>{i} {i === 1 ? 'Light' : i === 2 ? 'Daily' : 'Strong'}</b></button>
                ))}
              </div>
              <h3>Foam</h3>
              <div className="row" role="group" aria-label="Foam">
                <button type="button" aria-pressed={sls === 'F'} className={`optbtn ${sls === 'F' ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setSls('F')}><b>SLS-free</b><div className="small muted">low foam, same base</div></button>
                <button type="button" aria-pressed={sls === 'S'} className={`optbtn ${sls === 'S' ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setSls('S')}><b>Classic SLS</b><div className="small muted">more foam</div></button>
              </div>
              <p className="row"><MBtn sec onClick={() => goStep(1)}>Back</MBtn><MBtn onClick={() => goStep(3)}>Next: design</MBtn></p>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2>03 Design (B/W only)</h2>
              <div className="design2">
                <div>
                  <h3>Tube art</h3>
                  <div className="row" role="group" aria-label="Tube art">
                    {Object.entries(ARTS).map(([k, v]) => (
                      <button type="button" key={k} aria-pressed={art === k} className={`optbtn ${art === k ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setArt(k)}><b>{v}</b><div className="small muted">{k}</div></button>
                    ))}
                  </div>
                  <h3><label htmlFor="tube-name" style={{ font: 'inherit', fontWeight: 'bold' }}>Name on label (A–Z 0–9, max 16)</label></h3>
                  <input id="tube-name" className="txt" value={label} onChange={(e) => setLabel(sanitizeName(e.target.value))} placeholder="YOUR NAME" />
                  <h3>Design reference photo (optional)</h3>
                  <p className="small muted" id="photo-hint">Black-and-white text / simple line art only. Max 1 image, JPG/PNG, max 2MB. No logos, trademarks, faces, or copyrighted art. Reviewed before print. Private preview — your photo never leaves this device.</p>
                  <input id="tube-photo" type="file" accept="image/png,image/jpeg" onChange={onPhoto} aria-describedby="photo-hint" aria-label="Upload design reference photo" />
                  {photoErr && <p className="small" role="alert">{photoErr}</p>}
                  {photo && <p><MBtn sec onClick={clearPhoto}>Remove photo</MBtn></p>}
                </div>
                <Tube art={art} name={label || 'MONO.'} photo={photo} />
              </div>
              <div style={{ marginTop: 16 }}><VerifyPanel sku={sku} base={base} /></div>
              <p aria-live="polite" className="small sku">{sku}</p>
              <div className="row" style={{ marginTop: 12 }}>
                <MBtn onClick={() => addPack('single', 12)}>Add — {money(12)}</MBtn>
                <MBtn sec onClick={() => addPack('3-pack', 29)}>3-pack — {money(29)}</MBtn>
                <MBtn sec onClick={() => addPack('sub', 10)}>Subscribe — {money(10)}/tube</MBtn>
                <MBtn sec onClick={() => goStep(2)}>Back</MBtn>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {step === 3 && (
        <div className="stickybar">
          <div className="stickybar-in">
            <div style={{ flex: 1 }}><p className="small" style={{ margin: 0 }}>{FLAVORS[flavor].name} {intensity}</p><p style={{ margin: 0 }}><b>{money(12)}</b></p></div>
            <MBtn onClick={() => addPack('single', 12)}>Add — {money(12)}</MBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function Science() {
  return (
    <div className="wrap">
      <Reveal><h1>Science — every % published</h1></Reveal>
      <p className="muted">Grades: A strong consensus · B moderate · C emerging/cosmetic. Fluoride helps protect against cavities with 2x/day brushing. No bleach, no regrow-enamel, no cures. Botanical flavors are taste only (grade C) — same fluoride base.</p>
      {Object.values(BASES).map((b) => (
        <Reveal key={b.id}><div style={{ marginBottom: 24 }}>
          <h2>{b.name} · {b.fluoridePpm} ppm · RDA {b.rda} · pH {b.ph}</h2>
          <div className="tscroll"><table className="t"><thead><tr><th scope="col">INCI</th><th scope="col">%</th><th scope="col">Function</th><th scope="col">Grade</th></tr></thead>
            <tbody>{b.formula.map((f) => (<tr key={f.inci}><td>{f.inci}</td><td>{f.pct}</td><td>{f.fn}</td><td>{f.grade}</td></tr>))}</tbody>
          </table></div>
        </div></Reveal>
      ))}
      <h2>Flavor library</h2>
      <div className="tscroll"><table className="t"><thead><tr><th scope="col">Group</th><th scope="col">Flavors</th><th scope="col">Benefit claim</th></tr></thead><tbody>
        <tr><td>Clinical (1st)</td><td>Pure Mint, Yuzu Mint, Eucalyptus, Spearmint, Wintergreen, Berry Frost</td><td>Freshens breath/feeling (C)</td></tr>
        <tr><td>Botanical (2nd)</td><td>{BOTANICAL.map((k) => FLAVORS[k].name).join(', ')}</td><td>Taste only — none</td></tr>
      </tbody></table></div>
      <h2>Why fluoride 1450 ppm only</h2>
      <p className="small">Cochrane 2019: 1000–1500 ppm reduces caries vs placebo; under 1000 ppm no convincing effect. No fluoride-free at MVP — n-HA alone is not ADA-accepted for anticaries.</p>
      <h2>Safety and limits</h2>
      <div className="tscroll"><table className="t"><tbody>
        <tr><td>RDA</td><td>250 or less safe lifetime (ADA/ISO 11609). Ours 65–110. No charcoal.</td></tr>
        <tr><td>Fluoride package</td><td>276 mg total F per tube max (FDA M021). 120 g x 1450 ppm is about 174 mg — compliant.</td></tr>
        <tr><td>Directions</td><td>Adults + 6y: brush 2x/day, spit, do not swallow. 2–6y: pea-size, supervised. Under 2y: ask dentist.</td></tr>
        <tr><td>SLS</td><td>Safe as formulated; irritant for some. SLS-free option offered.</td></tr>
        <tr><td>Botanicals</td><td>Clove/cinnamon carry eugenol/cinnamal allergy risk; fennel/tulsi carry trace allergens. Stop use if irritated.</td></tr>
        <tr><td>Wintergreen + new botanicals</td><td>Wintergreen (methyl salicylate) kept at a low dose; adult use, keep from children. Cardamom, ginger and rose carry trace fragrance allergens. Stop use if irritated.</td></tr>
        <tr><td>Home mixing</td><td>Unsafe: breaks ppm uniformity, stability, micro. Factory base choice only.</td></tr>
      </tbody></table></div>
      <div style={{ marginTop: 16 }}><VerifyPanel sku="MONO-P-M2-F-MO" base={BASES.P} /></div>
    </div>
  )
}

function Plan() {
  return (
    <div className="wrap">
      <Reveal><h1>Business plan — lean, realistic</h1></Reveal>
      <p className="muted">MONO. — black-and-white DTC. Customization without custom drug compounding. All figures in USD.</p>
      <div className="grid3">
        <div className="card"><b>Model</b><p className="small">3 base SKUs x clinical + botanical factory-dosed flavors. Tube art + name + photo ref = cosmetic layer. $12 / $29 3-pack / $10 sub.</p></div>
        <div className="card"><b>Why hard</b><p className="small">Fluoride = OTC drug (21 CFR 355). GMP facility, stability + micro USP 61/62, Drug Facts, lot traceability required. Each botanical flavor = one pre-validated SKU.</p></div>
        <div className="card"><b>Start cost</b><p className="small">About $49k–157k to first shippable lot (CM MOQ 5–10k/SKU, testing, liability, labels). Botanicals add stability cost per SKU — launch 2–3 flavors max.</p></div>
      </div>
      <h2>Unit math at $12</h2>
      <div className="tscroll"><table className="t"><tbody>
        <tr><td>COGS (paste + tube + carton)</td><td>$3.20</td></tr>
        <tr><td>Pick/pack/ship</td><td>$4.50–6.00</td></tr>
        <tr><td>Contribution pre-CAC</td><td>$2.50–3.70 — needs AOV $28+, 2-packs, sub churn under 8%/mo</td></tr>
      </tbody></table></div>
      <h2>What we will NOT claim</h2>
      <p className="small">No guaranteed shades, no enamel regrow, no cavity cure, no kills-99.9%, no FDA approved (monograph is not approval), no dentist guaranteed, no natural = safer. Allowed: helps protect / helps polish / freshens, with twice-daily brushing. Habit promise only: brush 2x/day 14 days, feel fresher or refund.</p>
      <h2>Verification gates before ship</h2>
      <p className="small">Fluoride total + available assay · pH/viscosity · micro USP 61/62 · 40C/75% 3-mo accelerated + real-time · RDA ISO 11609 · dentist label review · COA per lot · complaint/recall SOP.</p>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState(null)
  const items = [
    ['Do you guarantee whiter teeth?', 'No. Polish of surface stains for brighter-looking smile. No bleach, no shade guarantee.'],
    ['Fluoride-free option?', 'No. 1450 ppm NaF only at MVP. Evidence for caries is fluoride.'],
    ['Are botanical flavors stronger or more protective?', 'No. Taste only, same fluoride base. Natural does not mean safer — clove/cinnamon can irritate.'],
    ['Why are naturals second?', 'The evidence for caries protection at this level is fluoride with regular brushing. Botanicals are included for taste only — they do not change fluoride content or protection. Natural does not automatically mean safer.'],
    ['SLS-free = no irritation for all?', 'No. Milder for many, no universal promise. Stop if irritated, see dentist.'],
    ['Can I pick my own active %?', 'No. Locked factory sheets. Home mixing is unsafe. You customize taste, intensity, foam, art, name, note and photo.'],
    ['Can I supply my own flavor oil or print file?', 'No oils. One B/W reference photo max, reviewed before print, may be simplified or declined.'],
    ['How much is shipping?', `Orders over ${cash(freeShip())} ship free. A flat ${cash(shipFee())} rate applies below that.`],
    ['Sensitivity cure?', 'No cure. Potassium nitrate 5% helps comfort with continued use. Pain over 2 weeks: see dentist.'],
    ['Kids / pregnancy?', '6y+ per directions; 2–6y pea-size supervised; under 2y + pregnancy: ask dentist/OB.'],
    ['Do I need an account?', 'No. Your cart, photo and orders are saved only in this browser on your device.'],
  ]
  return (
    <div className="wrap"><h1>FAQ</h1>
      {items.map(([q, a], i) => (
        <div className="card" key={q} style={{ marginBottom: 12 }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} aria-controls={`faq-p-${i}`} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', fontWeight: 'bold', padding: '12px 0' }}>{q}</button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div id={`faq-p-${i}`} key="p" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
                <p className="small" style={{ marginTop: 0 }}>{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function Disclaimer() {
  return (
    <div className="wrap"><h1>Disclaimer</h1>
      <div className="card mist">
        <p className="small">Cosmetic/anticavity toothpaste. Not intended to diagnose, treat, cure or prevent disease. Fluoride helps protect against cavities when used as directed; results vary with diet, technique, dentist care. Bleeding, pain, loose teeth, persistent sensitivity: see a dentist promptly. 14-day promise covers fresh-breath routine feel only — full refund, no treatment guarantee. Botanical flavors are taste choices, not therapy. Design photos are print references only. Not medical or regulatory advice. Verify Drug Facts + COA per lot before use.</p>
      </div>
    </div>
  )
}

function Checkout({ cart, go }) {
  const { items, total, totalA, clear } = cart
  const [f, setF] = useState({ name: '', phone: '', address: '', city: '', pin: '', notes: '' })
  const [errs, setErrs] = useState({})
  const [placed, setPlaced] = useState(null)
  const [orders, setOrders] = useState(loadOrders)
  const sumRef = useRef(null)
  const lock = useRef(false)
  useEffect(() => { lock.current = false }, [items])
  const ship = items.length === 0 ? 0 : totalA >= freeShip() ? 0 : shipFee()
  const lineTot = (c) => getCur() === 'INR' ? toInr(c.price) * (c.qty || 1) : c.price * (c.qty || 1)
  const set = (k, v) => { setF({ ...f, [k]: v }); setErrs({ ...errs, [k]: '' }) }
  const validate = () => {
    const e = {}
    if (!/^[A-Za-z][A-Za-z .'-]{1,79}$/.test(f.name.trim())) e.name = 'Enter your full name (letters only).'
    if (!/^\+?[0-9][0-9\s-]{6,14}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits).'
    if (f.address.trim().length < 10) e.address = 'Enter your full street address (10+ characters).'
    if (f.city.trim().length < 2) e.city = 'Enter your city.'
    if (f.pin.trim().length < 3) e.pin = 'Enter a valid postal/PIN code.'
    return e
  }
  const submit = (ev) => {
    ev.preventDefault()
    if (lock.current) return
    const e = validate()
    setErrs(e)
    if (Object.keys(e).length) { if (sumRef.current) sumRef.current.focus(); return }
    lock.current = true
    const order = {
      id: newOrderId(),
      items: items.map((i) => ({ sku: i.sku, label: i.label, flavor: i.flavor, qty: i.qty || 1, price: i.price })),
      totalUsd: total,
      total: Math.round((totalA + ship) * 100) / 100,
      cur: getCur(),
      address: { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), city: f.city.trim(), pin: f.pin.trim(), notes: f.notes.trim() },
      ts: Date.now(), status: 'received',
    }
    const next = [order, ...orders]
    setOrders(next); saveOrders(next)
    clear()
    setPlaced(order)
    window.scrollTo(0, 0)
  }
  const field = (k, label, props, hint) => (
    <div className="field">
      <label htmlFor={'co-' + k}>{label}</label>
      {props.textarea
        ? <textarea id={'co-' + k} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? 'co-' + k + '-err' : undefined} rows={props.rows || 2} />
        : <input id={'co-' + k} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? 'co-' + k + '-err' : undefined} {...props} />}
      {hint && <p className="small muted" style={{ margin: '4px 0 0' }}>{hint}</p>}
      {errs[k] && <p className="small err" id={'co-' + k + '-err'}>{errs[k]}</p>}
    </div>
  )
  if (placed) {
    const o = placed
    return (
      <div className="wrap">
        <Reveal><h1>Order received. Thank you.</h1></Reveal>
        <p>Thanks {o.address.name}. Your order <b className="sku">{o.id}</b> is confirmed for delivery.</p>
        <p className="small">Delivering to: {o.address.address}, {o.address.city} — {o.address.pin}. We will contact you on {o.address.phone} if needed.</p>
        {o.address.notes && <p className="small">Delivery note saved: “{o.address.notes}”</p>}
        <div className="timeline" aria-label="Order status">
          <div className="done">Received</div><div>Packed</div><div>Shipped</div>
        </div>
        <p className="small muted">Status: Received. Next: Packed, then Shipped. Have your order ID ({o.id}) ready when your order arrives.</p>
        <div className="row">
          <MBtn onClick={() => go('shop')}>Continue shopping</MBtn>
          <MBtn sec onClick={() => setPlaced(null)}>View order history</MBtn>
        </div>
        <OrderHistory orders={orders} />
      </div>
    )
  }
  return (
    <div className="wrap">
      <h1>Checkout</h1>
      <p className="muted">Review your routine below. Brush twice daily for 2 minutes. Keep out of reach of children under 6.</p>
      {items.length === 0 && (
        <div className="card mist">
          <p><b>Your cart is empty.</b></p>
          <p className="small muted">Start with Protect — Daily Mint.</p>
          <MBtn onClick={() => go('shop')}>Shop bestsellers</MBtn>
        </div>
      )}
      {items.length > 0 && (
        <div className="design2">
          <form onSubmit={submit} noValidate>
            {Object.keys(errs).length > 0 && (
              <div className="errbox" role="alert" tabIndex={-1} ref={sumRef} aria-labelledby="err-h">
                <h2 id="err-h" style={{ margin: '0 0 8px' }}>{Object.keys(errs).length} field{Object.keys(errs).length > 1 ? 's need' : ' needs'} attention</h2>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.entries(errs).map(([k, v]) => (<li key={k}><button type="button" className="tlink" onClick={() => { const el = document.getElementById('co-' + k); if (el) el.focus() }}>{v}</button></li>))}
                </ul>
              </div>
            )}
            <h2>Contact + shipping</h2>
            {field('name', 'Full name', { type: 'text', autoComplete: 'name', maxLength: 80 })}
            {field('phone', 'Phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' }, 'We only call if there is a delivery question.')}
            {field('address', 'Street address', { textarea: true, autoComplete: 'street-address' })}
            <div className="row">
              <div style={{ flex: '1 1 140px' }}>{field('city', 'City', { type: 'text', autoComplete: 'address-level2' })}</div>
              <div style={{ flex: '1 1 120px' }}>{field('pin', 'Postal / PIN', { type: 'text', inputMode: 'numeric', autoComplete: 'postal-code' })}</div>
            </div>
            {field('notes', 'Delivery notes (optional)', { textarea: true })}
            <MBtn block type="submit">Place order — {cash(totalA + ship)}</MBtn>
          </form>
          <div>
            <h2>Order summary</h2>
            {items.map((c) => (
              <p key={c.ts} className="small"><b>{c.label}</b> × {c.qty || 1}<br />{isMerch(c.sku) ? c.flavor : `${c.flavor} · ${c.pack}-pack`} · {cash(lineTot(c))}</p>
            ))}
            <p className="small">Subtotal: {cash(totalA)}<br />Shipping: {ship === 0 ? 'Free' : cash(ship)}<br /><b>Total: {cash(totalA + ship)}</b></p>
          </div>
        </div>
      )}
      <OrderHistory orders={orders} />
    </div>
  )
}

function OrderHistory({ orders }) {
  if (!orders.length) return <div style={{ marginTop: 24 }}><h2>Order history</h2><p className="small muted">No orders yet.</p></div>
  return (
    <div style={{ marginTop: 24 }}>
      <h2>Order history</h2>
      {orders.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}><span className="sku">{o.id}</span> <span className="statuschip">{o.status}</span></p>
          <p className="small muted" style={{ margin: '4px 0' }}>{new Date(o.ts).toLocaleDateString()} · {o.items.reduce((s, i) => s + (i.qty || 1), 0)} items · <b style={{ color: '#000' }}>{fmtNative(o.total, o.cur || 'USD')}</b></p>
        </div>
      ))}
    </div>
  )
}

function SiteFooter({ go }) {
  const col = (h, links) => (
    <div>
      <h4>{h}</h4>
      {links.map(([r, l], i) => (<div key={l + '-' + i}><a href={'#' + r} onClick={(e) => { e.preventDefault(); go(r) }}>{l}</a></div>))}
    </div>
  )
  return (
    <footer className="site"><div className="wrap">
      <div className="footgrid">
        <div>
          <div className="brand" style={{ color: '#fff', marginBottom: 8 }}>MONO.</div>
          <p className="small" style={{ color: '#cfcfcf' }}>Black-and-white toothpaste. Fixed bases, your taste, your design.</p>
        </div>
        {col('Shop', [['shop', 'All products'], ['customize', 'Customize'], ['merch', 'Merch'], ['shop', '3-Packs']])}
        {col('Help', [['faq', 'FAQ'], ['disclaimer', 'Disclaimer'], ['checkout', 'Checkout'], ['science', 'Ingredients']])}
        {col('Company', [['plan', 'Our plan'], ['science', 'Science'], ['home', 'Bestsellers']])}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '24px 0' }} />
      <p className="small" style={{ color: '#cfcfcf' }}>© 2026 MONO. All rights reserved. Cosmetic product. Helps freshen breath and polish with daily brushing. Not a medical treatment. If irritation occurs, discontinue use.</p>
    </div></footer>
  )
}

export default function App() {
  const [route, go] = useHash()
  const [preset, setPreset] = useState('P')
  const [cur, setC] = useState(getCur())
  const [curMsg, setCurMsg] = useState('')
  const cart = useCart()
  const pickCur = (c) => {
    if (c === cur) return
    setCur(c); setC(getCur())
    setCurMsg(c === 'INR' ? 'Prices now in Indian rupees' : 'Prices now in US dollars')
  }
  const mainRef = useRef(null)
  const cartBtnRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 140, damping: 28 })
  useEffect(() => {
    document.title = TITLES[route] || TITLES.home
    window.scrollTo(0, 0)
    if (mainRef.current) mainRef.current.focus({ preventScroll: true })
  }, [route])
  const openCart = () => cart.setOpen(true)
  return (
    <MotionConfig reducedMotion="user">
      <div>
        <a href="#main" className="skip-link">Skip to content</a>
        <motion.div className="progressbar" style={{ scaleX: sx }} aria-hidden="true" />
        <div className="announce marquee" aria-label="Store notices">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <div key={n} aria-hidden={n === 1} style={{ display: 'inline-flex' }}>
                <span>Free shipping over {cash(freeShip())}</span><span>14-day fresh-breath promise</span><span>1450ppm fluoride in every tube</span><span>SLS-free options</span>
              </div>
            ))}
          </div>
        </div>
        <header className="top"><div className="wrap nav">
          <div className="brand" onClick={() => go('home')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') go('home') }} aria-label="MONO home">MONO.</div>
          <nav className="links" aria-label="Main">
            {NAV.map(([k, l]) => (
              <button type="button" key={k} className={route === k ? 'on' : ''} aria-current={route === k ? 'page' : undefined} onClick={() => go(k)}>{l}</button>
            ))}
            <div className="curgroup" role="group" aria-label="Currency">
              <button type="button" aria-pressed={cur === 'USD'} onClick={() => pickCur('USD')}><span aria-hidden="true">$ </span>USD</button>
              <button type="button" aria-pressed={cur === 'INR'} onClick={() => pickCur('INR')}><span aria-hidden="true">₹ </span>INR</button>
            </div>
            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{curMsg}</span>
            <button type="button" ref={cartBtnRef} onClick={openCart} aria-expanded={cart.open} aria-controls="cart-drawer" aria-haspopup="dialog" aria-label={`Open cart, ${cart.count} items`} style={{ background: '#000', color: '#fff', borderRadius: 999, padding: '8px 16px', minHeight: 44, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={cart.count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }} style={{ display: 'inline-block' }}>Cart {cart.count}</motion.span>
              </AnimatePresence>
            </button>
          </nav>
        </div></header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main id="main" tabIndex={-1} aria-label="Main content" key={route} ref={mainRef} {...fade}>
            {route === 'home' && <Home go={go} cart={cart} />}
            {route === 'shop' && <Shop cart={cart} />}
            {route === 'merch' && <Merch cart={cart} />}
            {route === 'customize' && <Customizer preset={preset} cart={cart} />}
            {route === 'science' && <Science />}
            {route === 'plan' && <Plan />}
            {route === 'faq' && <Faq />}
            {route === 'disclaimer' && <Disclaimer />}
            {route === 'checkout' && <Checkout cart={cart} go={go} />}
          </motion.main>
        </AnimatePresence>
        <CartDrawer cart={cart} go={go} />
        <SiteFooter go={go} />
      </div>
    </MotionConfig>
  )
}
