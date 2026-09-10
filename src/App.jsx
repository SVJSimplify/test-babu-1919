import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { BASES, FLAVORS, CLINICAL, BOTANICAL, ARTS, PRODUCTS, toSKU, validSKU, sanitizeName, sanitizeNote, loadCart, saveCart, cartTotal } from './lib/catalog.js'

const ROUTES = ['home', 'shop', 'customize', 'science', 'plan', 'faq', 'disclaimer']
const NAV = [['home', 'Shop'], ['shop', 'All products'], ['customize', 'Customize'], ['science', 'Science'], ['plan', 'Plan'], ['faq', 'FAQ'], ['disclaimer', 'Disclaimer']]
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
function Reveal({ children }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.4, ease: 'easeOut' }}>{children}</motion.div>
}
function MBtn({ sec, block, ...rest }) {
  return <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className={(sec ? 'btn sec' : 'btn') + (block ? ' block' : '')} {...rest} />
}

function VerifyPanel({ sku, base }) {
  return (
    <div className="card mist">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="qr">QR /<br />LOT-0000<br />DEMO</div>
        <div>
          <div className="sku">{sku || 'MONO-P-M2-F-MO'}</div>
          <div className="small">Base {base.name} · Fixed sheet {base.sheet} · GMP made</div>
          <div className="row" style={{ marginTop: 8 }}>
            <span className="pill">Fluoride {base.fluoridePpm} ppm</span>
            <span className="pill">RDA {base.rda}</span>
            <span className="pill">pH {base.ph}</span>
          </div>
          <p className="small muted">Scan batch to lab sheet (placeholder, wireframe only).</p>
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
  const [cart, setCart] = useState(loadCart)
  const [msg, setMsg] = useState('')
  const add = (item) => {
    if (item.sku && !validSKU(item.sku)) { setMsg('Invalid SKU, not added'); return cart }
    const next = [...cart, { ...item, ts: Date.now() }]
    setCart(next); saveCart(next)
    setMsg(`Added ${item.label || item.sku} to cart`)
    return next
  }
  const removeAt = (ts) => { const next = cart.filter((i) => i.ts !== ts); setCart(next); saveCart(next) }
  const clear = () => { setCart([]); saveCart([]) }
  return { cart, add, removeAt, clear, msg }
}

function Home({ go, setPreset }) {
  const [goal, setGoal] = useState('Stay fresh')
  return (
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
      <Reveal><h2>01 — 3 questions, 1 base</h2></Reveal>
      <div className="grid3">
        {['Stay fresh', 'Brighter look', 'Gentle comfort'].map((g) => (
          <button type="button" key={g} aria-pressed={goal === g} className={`optbtn ${goal === g ? 'sel' : ''}`} onClick={() => setGoal(g)}>
            <b>{g}</b>
            <div className="small muted">{g === 'Stay fresh' ? 'Protect P' : g === 'Brighter look' ? 'Bright B' : 'Calm C'}</div>
          </button>
        ))}
      </div>
      <p><MBtn onClick={() => { setPreset(goal === 'Stay fresh' ? 'P' : goal === 'Brighter look' ? 'B' : 'C'); go('customize') }}>Continue</MBtn></p>
      <Reveal><h2>02 — 3 fixed GMP bases</h2></Reveal>
      <div className="grid3">
        {Object.values(BASES).map((b) => (
          <Reveal key={b.id}><div className="card shopcard">
            <div className="sku">MONO {b.name}</div>
            <p><b>{b.tag}</b></p>
            <p className="small">{b.desc}</p>
            <p className="small muted">{b.fluoridePpm} ppm F · RDA {b.rda} · pH {b.ph}</p>
            <MBtn block onClick={() => { setPreset(b.id); go('customize') }}>Customize {b.name}</MBtn>
          </div></Reveal>
        ))}
      </div>
      <Reveal><h2>03 — Proof, not promises</h2></Reveal>
      <div className="grid3">
        <div className="card mist"><b>Fixed formulas</b><p className="small">No scoop-your-own actives. Home mixing breaks ppm + stability.</p></div>
        <div className="card mist"><b>Published %</b><p className="small">Every % on /science with evidence grade A/B/C.</p></div>
        <div className="card mist"><b>Batch QR</b><p className="small">Fluoride assay + micro COA per lot (placeholder until production).</p></div>
      </div>
      <Reveal><h2>Daily brushers <span className="small muted">— taste and routine, not health outcomes.</span></h2></Reveal>
      <div className="grid3">
        {[['AR', 5, 'Low foam, no burn. Finally finished 2 minutes.'], ['SK', 4, 'Calm + light mint. Comfort with continued use.'], ['JM', 5, 'My name on the tube. Kids stopped stealing mine.']].map(([n, s, t]) => (
          <div className="card" key={n}><b>{n}</b> <span className="small">{'★'.repeat(s)}</span><p className="small">{t}</p></div>
        ))}
      </div>
    </div>
  )
}

function Shop({ cartApi }) {
  const { cart, add, removeAt, clear, msg } = cartApi
  const [filter, setFilter] = useState('all')
  const list = PRODUCTS.filter((p) => filter === 'all' ? true : p.need === filter)
  return (
    <div className="wrap">
      <h1>Shop</h1>
      <p className="muted">Fixed bases, fixed prices. Singles $12 · 3-packs $29 · subscription $10/tube · kits as marked.</p>
      <div className="row" role="group" aria-label="Filter by need">
        {[['all', 'All'], ['protect', 'Protect'], ['bright', 'Bright'], ['calm', 'Calm']].map(([k, l]) => (
          <button type="button" key={k} aria-pressed={filter === k} className={`optbtn ${filter === k ? 'sel' : ''}`} style={{ width: 'auto' }} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <p aria-live="polite" className="small">{msg}</p>
      <div className="shopgrid" style={{ marginTop: 12 }}>
        {list.map((p) => (
          <motion.article key={p.id} className="card shopcard" style={{ padding: 0, overflow: 'hidden' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.35 }} whileHover={{ y: -4 }}>
            <div className="minituve" aria-hidden="true"><div className={`minibody ${p.base === 'B' ? 'dot' : p.base === 'C' ? '' : 'stripe'}`} /></div>
            <div style={{ padding: 20 }}>
              {p.tag && <span className="pill">{p.tag}</span>}
              <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
              <p className="small muted">{p.flavor} · {p.pack}-pack · <b style={{ color: '#000' }}>${p.price}</b></p>
              <p className="small">{p.blurb}</p>
              <p className="small muted sku">{p.id}</p>
              <MBtn block onClick={() => add({ sku: p.id, label: p.name, pack: p.pack, price: p.price, flavor: p.flavor, art: p.art, photo: false, customNote: '' })} aria-label={`Add ${p.name} to cart`}>Add — ${p.price}</MBtn>
            </div>
          </motion.article>
        ))}
      </div>
      <h2>Cart [<span aria-live="polite" aria-atomic="true">{cart.length}</span>] — local only, no backend</h2>
      {cart.length === 0 && <p className="small muted">Empty. Adds from Shop or Customize land here, saved in this browser only.</p>}
      {cart.map((c) => (
        <p key={c.ts} className="small"><span className="sku">{c.sku}</span> · {c.label} · {c.flavor} · {c.pack}-pack · ${c.price}{c.photo ? ' · photo ref' : ''}{c.customNote ? ` · note: ${c.customNote}` : ''} <button type="button" className="btn sec" style={{ padding: '4px 10px' }} onClick={() => removeAt(c.ts)} aria-label={`Remove ${c.label}`}>Remove</button></p>
      ))}
      {cart.length > 0 && (
        <div className="row" style={{ alignItems: 'center' }}>
          <b>Total ${cartTotal(cart)}</b>
          <button type="button" className="btn sec" onClick={clear}>Clear cart</button>
          <button type="button" className="btn" disabled title="Demo only">Checkout — disabled in demo</button>
        </div>
      )}
      {cart.length > 0 && <p className="small muted">Checkout is disabled in demo — no backend, no payment. Your cart is saved only in this browser.</p>}
      <p className="small muted">One habit promise: brush twice daily for two minutes. That routine matters more than any tube.</p>
    </div>
  )
}

function Customizer({ preset, cartApi }) {
  const { add, msg } = cartApi
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
      try { localStorage.setItem('mono-photo', t) } catch { setPhotoErr('Photo too large to save locally; preview only.') }
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
      <p aria-live="polite" className="small">{msg}</p>
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
          <p><MBtn onClick={() => setStep(2)}>Next: taste + flavor</MBtn></p>
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
            <MBtn sec onClick={() => setShowBot(!showBot)} aria-expanded={showBot}>{showBot ? 'Hide botanical flavors' : 'Show botanical flavors — 2nd priority'}</MBtn>
            {showBot && (
              <div style={{ marginTop: 12 }}>
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
            )}
          </div>
          <h3>Describe your flavor idea (optional)</h3>
          <textarea className="txt" rows="2" maxLength={140} value={note} onChange={(e) => setNote(e.target.value.slice(0, 140))} placeholder="e.g. lighter clove, less sweet fennel..." aria-describedby="notehelp" />
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
          <p className="row"><MBtn sec onClick={() => setStep(1)}>Back</MBtn><MBtn onClick={() => setStep(3)}>Next: design</MBtn></p>
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
              <h3>Name on label (A–Z 0–9, max 16)</h3>
              <input className="txt" value={label} onChange={(e) => setLabel(sanitizeName(e.target.value))} placeholder="YOUR NAME" aria-label="Name on label" />
              <h3>Design reference photo (optional)</h3>
              <p className="small muted">Black-and-white text / simple line art only. Max 1 image, JPG/PNG, max 2MB. No logos, trademarks, faces, or copyrighted art. Reviewed before print. Demo: stays in your browser locally, never uploaded.</p>
              <input type="file" accept="image/png,image/jpeg" onChange={onPhoto} aria-label="Upload design reference photo" />
              {photoErr && <p className="small">{photoErr}</p>}
              {photo && <p><MBtn sec onClick={clearPhoto}>Remove photo</MBtn></p>}
            </div>
            <Tube art={art} name={label || 'MONO.'} photo={photo} />
          </div>
          <div style={{ marginTop: 16 }}><VerifyPanel sku={sku} base={base} /></div>
          <p aria-live="polite" className="small sku">{sku}</p>
          <div className="row" style={{ marginTop: 12 }}>
            <MBtn onClick={() => addPack('single', 12)}>Add — $12</MBtn>
            <MBtn sec onClick={() => addPack('3-pack', 29)}>3-pack — $29</MBtn>
            <MBtn sec onClick={() => addPack('sub', 10)}>Subscribe — $10/tube</MBtn>
            <MBtn sec onClick={() => setStep(2)}>Back</MBtn>
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
          <div className="tscroll"><table className="t"><thead><tr><th>INCI</th><th>%</th><th>Function</th><th>Grade</th></tr></thead>
            <tbody>{b.formula.map((f) => (<tr key={f.inci}><td>{f.inci}</td><td>{f.pct}</td><td>{f.fn}</td><td>{f.grade}</td></tr>))}</tbody>
          </table></div>
        </div></Reveal>
      ))}
      <h2>Flavor library</h2>
      <div className="tscroll"><table className="t"><thead><tr><th>Group</th><th>Flavors</th><th>Benefit claim</th></tr></thead><tbody>
        <tr><td>Clinical (1st)</td><td>Pure Mint, Yuzu Mint, Eucalyptus</td><td>Freshens breath/feeling (C)</td></tr>
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
      <p className="muted">MONO. — black-and-white DTC. Customization without custom drug compounding.</p>
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
  const items = [
    ['Do you guarantee whiter teeth?', 'No. Polish of surface stains for brighter-looking smile. No bleach, no shade guarantee.'],
    ['Fluoride-free option?', 'No. 1450 ppm NaF only at MVP. Evidence for caries is fluoride.'],
    ['Are botanical flavors stronger or more protective?', 'No. Taste only, same fluoride base. Natural does not mean safer — clove/cinnamon can irritate.'],
    ['SLS-free = no irritation for all?', 'No. Milder for many, no universal promise. Stop if irritated, see dentist.'],
    ['Can I pick my own active %?', 'No. Locked factory sheets. Home mixing is unsafe. You customize taste, intensity, foam, art, name, note and photo.'],
    ['Can I supply my own flavor oil or print file?', 'No oils. One B/W reference photo max, reviewed before print, may be simplified or declined.'],
    ['Sensitivity cure?', 'No cure. Potassium nitrate 5% helps comfort with continued use. Pain over 2 weeks: see dentist.'],
    ['Kids / pregnancy?', '6y+ per directions; 2–6y pea-size supervised; under 2y + pregnancy: ask dentist/OB.'],
    ['Backend / account?', 'None. Cart and photo live in your browser localStorage only. Nothing is uploaded in this demo.'],
  ]
  return (
    <div className="wrap"><h1>FAQ</h1>
      {items.map(([q, a]) => (<Reveal key={q}><div className="card" style={{ marginBottom: 12 }}><b>{q}</b><p className="small">{a}</p></div></Reveal>))}
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

export default function App() {
  const [route, go] = useHash()
  const [preset, setPreset] = useState('P')
  const cartApi = useCart()
  const mainRef = useRef(null)
  useEffect(() => { if (mainRef.current) mainRef.current.focus({ preventScroll: true }) }, [route])
  return (
    <MotionConfig reducedMotion="user">
      <div>
        <header className="top"><div className="wrap nav">
          <div className="brand" onClick={() => go('home')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') go('home') }} aria-label="MONO home">MONO.</div>
          <nav className="links" aria-label="Main">
            {NAV.map(([k, l]) => (
              <button type="button" key={k} className={route === k ? 'on' : ''} aria-current={route === k ? 'page' : undefined} onClick={() => go(k)}>{l}</button>
            ))}
            <span className="cartpill" aria-live="polite" aria-atomic="true">Cart {cartApi.cart.length}</span>
          </nav>
        </div></header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main key={route} ref={mainRef} tabIndex={-1} {...fade}>
            {route === 'home' && <Home go={go} setPreset={setPreset} />}
            {route === 'shop' && <Shop cartApi={cartApi} />}
            {route === 'customize' && <Customizer preset={preset} cartApi={cartApi} />}
            {route === 'science' && <Science />}
            {route === 'plan' && <Plan />}
            {route === 'faq' && <Faq />}
            {route === 'disclaimer' && <Disclaimer />}
          </motion.main>
        </AnimatePresence>
        <footer><div className="wrap">
          <div className="small">MONO. — B/W only. Cosmetic product. No disease claims. <a className="flink" href="#disclaimer">Disclaimer</a> · <a className="flink" href="#science">Science</a></div>
          <div className="small muted">© 2026 MONO. Demo storefront — formulas require GMP + counsel sign-off before sale. No backend: Vite static, cart + photo stay in your browser.</div>
        </div></footer>
      </div>
    </MotionConfig>
  )
}
