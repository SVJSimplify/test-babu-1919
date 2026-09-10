import React, { useEffect, useMemo, useState } from 'react'
import { BASES, FLAVORS, ARTS, toSKU, sanitizeName } from './lib/catalog.js'

const ROUTES = ['home', 'customize', 'science', 'plan', 'faq', 'disclaimer']
function useHash() {
  const get = () => (window.location.hash || '#home').replace('#', '').split('?')[0] || 'home'
  const [r, setR] = useState(get())
  useEffect(() => {
    const f = () => setR(ROUTES.includes(get()) ? get() : 'home')
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return [r, (x) => { window.location.hash = x }]
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

function Tube({ art, name }) {
  return (
    <div className="tube">
      <div className={`tubeart ${art.toLowerCase()}`}>
        <div className="tubelabel">{name || 'MONO.'}</div>
      </div>
      <div className="small muted">preview — {ARTS[art]} · B/W only</div>
    </div>
  )
}

function Home({ go, setPreset }) {
  const [goal, setGoal] = useState('Stay fresh')
  return (
    <div className="wrap">
      <div className="hero">
        <div>
          <h1>Toothpaste, reduced to what works.</h1>
          <p>Fluoride toothpaste that helps protect teeth when you brush twice daily. 3 fixed bases. Pick a need. Pick a flavor. Put your name on it.</p>
          <div className="row">
            <button className="btn" onClick={() => go('customize')}>Find your base</button>
            <button className="btn sec" onClick={() => go('science')}>See what is inside</button>
          </div>
          <p className="small muted">No custom % mixing. Every batch made to the same sheet.</p>
        </div>
        <Tube art="MO" name="MONO." />
      </div>
      <h2>01 — 3 questions, 1 base</h2>
      <div className="grid3">
        {['Stay fresh', 'Brighter look', 'Gentle comfort'].map((g) => (
          <div key={g} className={`opt ${goal === g ? 'sel' : ''}`} onClick={() => setGoal(g)}>
            <b>{g}</b>
            <div className="small muted">{g === 'Stay fresh' ? 'Protect P' : g === 'Brighter look' ? 'Bright B' : 'Calm C'}</div>
          </div>
        ))}
      </div>
      <p><button className="btn" onClick={() => { setPreset(goal === 'Stay fresh' ? 'P' : goal === 'Brighter look' ? 'B' : 'C'); go('customize') }}>Continue</button></p>
      <h2>02 — 3 fixed GMP bases</h2>
      <div className="grid3">
        {Object.values(BASES).map((b) => (
          <div className="card" key={b.id}>
            <div className="sku">MONO {b.name}</div>
            <p><b>{b.tag}</b></p>
            <p className="small">{b.desc}</p>
            <p className="small muted">{b.fluoridePpm} ppm F · RDA {b.rda} · pH {b.ph}</p>
            <button className="btn sec" onClick={() => { setPreset(b.id); go('customize') }}>Customize</button>
          </div>
        ))}
      </div>
      <h2>03 — Proof, not promises</h2>
      <div className="grid3">
        <div className="card mist"><b>Fixed formulas</b><p className="small">No scoop-your-own actives. Home mixing breaks ppm + stability.</p></div>
        <div className="card mist"><b>Published %</b><p className="small">Every % on /science with evidence grade A/B/C.</p></div>
        <div className="card mist"><b>Batch QR</b><p className="small">Fluoride assay + micro COA per lot (placeholder until production).</p></div>
      </div>
      <h2>Daily brushers <span className="small muted">— taste and routine, not health outcomes.</span></h2>
      <div className="grid3">
        {[['AR', 5, 'Low foam, no burn. Finally finished 2 minutes.'], ['SK', 4, 'Calm + light mint. Comfort with continued use.'], ['JM', 5, 'My name on the tube. Kids stopped stealing mine.']].map(([n, s, t]) => (
          <div className="card" key={n}><b>{n}</b> <span className="small">{'★'.repeat(s)}</span><p className="small">{t}</p></div>
        ))}
      </div>
    </div>
  )
}

function Customizer({ preset }) {
  const [need, setNeed] = useState(preset || 'P')
  useEffect(() => { if (preset) setNeed(preset) }, [preset])
  const [flavor, setFlavor] = useState('M')
  const [intensity, setIntensity] = useState(2)
  const [sls, setSls] = useState('F')
  const [art, setArt] = useState('MO')
  const [label, setLabel] = useState('ALEX')
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('mono-cart') || '[]') } catch { return [] } })
  const base = BASES[need]
  const sku = useMemo(() => toSKU({ need, flavor, intensity, sls, art }), [need, flavor, intensity, sls, art])
  const [step, setStep] = useState(1)
  const add = (pack) => {
    const item = { sku, label: sanitizeName(label), pack, price: pack === '3-pack' ? 29 : pack === 'sub' ? 10 : 12, ts: Date.now() }
    const next = [...cart, item]
    setCart(next)
    localStorage.setItem('mono-cart', JSON.stringify(next))
  }
  return (
    <div className="wrap">
      <h1>Customize</h1>
      <div className="steps"><span className={step >= 1 ? 'on' : ''} /><span className={step >= 2 ? 'on' : ''} /><span className={step >= 3 ? 'on' : ''} /></div>
      {step === 1 && (
        <div>
          <h2>01 Need = fixed base (locked %)</h2>
          <div className="grid3">
            {Object.values(BASES).map((b) => (
              <div key={b.id} className={`opt ${need === b.id ? 'sel' : ''}`} onClick={() => setNeed(b.id)}>
                <div className="sku">{b.name} · {b.id}</div>
                <div className="small">{b.desc}</div>
                <div className="small muted">{b.fluoridePpm} ppm · RDA {b.rda} · pH {b.ph}</div>
              </div>
            ))}
          </div>
          <p><button className="btn" onClick={() => setStep(2)}>Next: formula + flavor</button></p>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>02 Formula (read-only) + flavor</h2>
          <table className="t"><thead><tr><th>INCI</th><th>%</th><th>Function</th></tr></thead>
            <tbody>{base.formula.map((f) => (<tr key={f.inci}><td>{f.inci}</td><td>{f.pct}</td><td>{f.fn}</td></tr>))}</tbody>
          </table>
          <h3>Flavor</h3>
          <div className="row">{Object.entries(FLAVORS).map(([k, v]) => (<div key={k} className={`opt ${flavor === k ? 'sel' : ''}`} onClick={() => setFlavor(k)}><b>{v.name}</b><div className="small muted">{v.note}</div></div>))}</div>
          <h3>Intensity (factory-dosed, not post-fill)</h3>
          <div className="row">{[1, 2, 3].map((i) => (<div key={i} className={`opt ${intensity === i ? 'sel' : ''}`} onClick={() => setIntensity(i)}><b>{i} {i === 1 ? 'Light' : i === 2 ? 'Daily' : 'Strong'}</b></div>))}</div>
          <h3>Foam</h3>
          <div className="row">
            <div className={`opt ${sls === 'F' ? 'sel' : ''}`} onClick={() => setSls('F')}><b>SLS-free</b><div className="small muted">low foam, same base</div></div>
            <div className={`opt ${sls === 'S' ? 'sel' : ''}`} onClick={() => setSls('S')}><b>Classic SLS</b><div className="small muted">more foam</div></div>
          </div>
          <p className="row"><button className="btn sec" onClick={() => setStep(1)}>Back</button><button className="btn" onClick={() => setStep(3)}>Next: design</button></p>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>03 Design (B/W only)</h2>
          <div>
            <h3>Tube art</h3>
            <div className="row">{Object.entries(ARTS).map(([k, v]) => (<div key={k} className={`opt ${art === k ? 'sel' : ''}`} onClick={() => setArt(k)}><b>{v}</b><div className="small muted">{k}</div></div>))}</div>
            <h3>Name on label (A-Z 0-9, max 16)</h3>
            <input className="txt" value={label} onChange={(e) => setLabel(sanitizeName(e.target.value))} placeholder="YOUR NAME" />
            <div style={{ marginTop: 16 }}><Tube art={art} name={label || 'MONO.'} /></div>
          </div>
          <div style={{ marginTop: 16 }}><VerifyPanel sku={sku} base={base} /></div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => add('single')}>Add — $12</button>
            <button className="btn sec" onClick={() => add('3-pack')}>3-pack — $29</button>
            <button className="btn sec" onClick={() => add('sub')}>Subscribe — $10/tube</button>
            <button className="btn sec" onClick={() => setStep(2)}>Back</button>
          </div>
          <h3>Cart [{cart.length}] — local only, no backend</h3>
          {cart.map((c, i) => (<p key={i} className="small"><span className="sku">{c.sku}</span> · {c.label} · {c.pack} · ${c.price}</p>))}
          {cart.length > 0 && <button className="btn sec" onClick={() => { setCart([]); localStorage.removeItem('mono-cart') }}>Clear cart</button>}
        </div>
      )}
    </div>
  )
}

function Science() {
  return (
    <div className="wrap">
      <h1>Science — every % published</h1>
      <p className="muted">Grades: A strong consensus · B moderate · C emerging/cosmetic. Fluoride helps protect against cavities with 2x/day brushing. No bleach, no regrow-enamel, no cures.</p>
      {Object.values(BASES).map((b) => (
        <div key={b.id} style={{ marginBottom: 24 }}>
          <h2>{b.name} · {b.fluoridePpm} ppm · RDA {b.rda} · pH {b.ph}</h2>
          <table className="t"><thead><tr><th>INCI</th><th>%</th><th>Function</th><th>Grade</th></tr></thead>
            <tbody>{b.formula.map((f) => (<tr key={f.inci}><td>{f.inci}</td><td>{f.pct}</td><td>{f.fn}</td><td>{f.grade}</td></tr>))}</tbody>
          </table>
        </div>
      ))}
      <h2>Why fluoride 1450 ppm only</h2>
      <p className="small">Cochrane 2019: 1000–1500 ppm reduces caries vs placebo; under 1000 ppm no convincing effect. No fluoride-free at MVP — n-HA alone is not ADA-accepted for anticaries.</p>
      <h2>Safety and limits</h2>
      <table className="t"><tbody>
        <tr><td>RDA</td><td>250 or less safe lifetime (ADA/ISO 11609). Ours 65–110. No charcoal.</td></tr>
        <tr><td>Fluoride package</td><td>276 mg total F per tube max (FDA M021). 120 g x 1450 ppm is about 174 mg — compliant.</td></tr>
        <tr><td>Directions</td><td>Adults + 6y: brush 2x/day, spit, do not swallow. 2–6y: pea-size, supervised. Under 2y: ask dentist.</td></tr>
        <tr><td>SLS</td><td>Safe as formulated; irritant for some. SLS-free option offered.</td></tr>
        <tr><td>Home mixing</td><td>Unsafe: breaks ppm uniformity, stability, micro. Factory base choice only.</td></tr>
      </tbody></table>
      <div style={{ marginTop: 16 }}><VerifyPanel sku="MONO-P-M2-F-MO" base={BASES.P} /></div>
    </div>
  )
}

function Plan() {
  return (
    <div className="wrap">
      <h1>Business plan — lean, realistic</h1>
      <p className="muted">MONO. — black-and-white DTC. Customization without custom drug compounding.</p>
      <div className="grid3">
        <div className="card"><b>Model</b><p className="small">3 base SKUs x 3 factory-dosed flavors. Tube art + name = cosmetic layer. $12 / $29 3-pack / $10 sub.</p></div>
        <div className="card"><b>Why hard</b><p className="small">Fluoride = OTC drug (21 CFR 355). GMP facility, stability + micro USP 61/62, Drug Facts, lot traceability required.</p></div>
        <div className="card"><b>Start cost</b><p className="small">About $49k–157k to first shippable lot (CM MOQ 5–10k/SKU, testing, liability, labels).</p></div>
      </div>
      <h2>Unit math at $12</h2>
      <table className="t"><tbody>
        <tr><td>COGS (paste + tube + carton)</td><td>$3.20</td></tr>
        <tr><td>Pick/pack/ship</td><td>$4.50–6.00</td></tr>
        <tr><td>Contribution pre-CAC</td><td>$2.50–3.70 — needs AOV $28+, 2-packs, sub churn under 8%/mo</td></tr>
      </tbody></table>
      <h2>What we will NOT claim</h2>
      <p className="small">No guaranteed shades, no enamel regrow, no cavity cure, no kills-99.9%, no FDA approved (monograph is not approval), no dentist guaranteed. Allowed: helps protect / helps polish / freshens, with twice-daily brushing. Habit promise only: brush 2x/day 14 days, feel fresher or refund.</p>
      <h2>Verification gates before ship</h2>
      <p className="small">Fluoride total + available assay · pH/viscosity · micro USP 61/62 · 40C/75% 3-mo accelerated + real-time · RDA ISO 11609 · dentist label review · COA per lot · complaint/recall SOP.</p>
    </div>
  )
}

function Faq() {
  const items = [
    ['Do you guarantee whiter teeth?', 'No. Polish of surface stains for brighter-looking smile. No bleach, no shade guarantee.'],
    ['Fluoride-free option?', 'No. 1450 ppm NaF only at MVP. Evidence for caries is fluoride.'],
    ['SLS-free = no irritation for all?', 'No. Milder for many, no universal promise. Stop if irritated, see dentist.'],
    ['Can I pick my own %?', 'No. Locked factory sheets. Home mixing is unsafe.'],
    ['Sensitivity cure?', 'No cure. Potassium nitrate 5% helps comfort with continued use. Pain over 2 weeks: see dentist.'],
    ['Kids / pregnancy?', '6y+ per directions; 2–6y pea-size supervised; under 2y + pregnancy: ask dentist/OB.'],
    ['Backend / account?', 'None. Cart lives in your browser localStorage only.'],
  ]
  return (
    <div className="wrap"><h1>FAQ</h1>
      {items.map(([q, a]) => (<div className="card" key={q} style={{ marginBottom: 12 }}><b>{q}</b><p className="small">{a}</p></div>))}
    </div>
  )
}

function Disclaimer() {
  return (
    <div className="wrap"><h1>Disclaimer</h1>
      <div className="card mist">
        <p className="small">Cosmetic/anticavity toothpaste. Not intended to diagnose, treat, cure or prevent disease. Fluoride helps protect against cavities when used as directed; results vary with diet, technique, dentist care. Bleeding, pain, loose teeth, persistent sensitivity: see a dentist promptly. 14-day promise covers fresh-breath routine feel only — full refund, no treatment guarantee. Not medical or regulatory advice. Verify Drug Facts + COA per lot before use.</p>
      </div>
    </div>
  )
}

export default function App() {
  const [route, go] = useHash()
  const [preset, setPreset] = useState('P')
  return (
    <div>
      <header className="top"><div className="wrap nav">
        <div className="brand" onClick={() => go('home')}>MONO.</div>
        <div className="links">
          {[['home', 'Shop'], ['customize', 'Customize'], ['science', 'Science'], ['plan', 'Plan'], ['faq', 'FAQ'], ['disclaimer', 'Disclaimer']].map(([k, l]) => (
            <button key={k} className={route === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>
          ))}
        </div>
      </div></header>
      {route === 'home' && <Home go={go} setPreset={setPreset} />}
      {route === 'customize' && <Customizer preset={preset} />}
      {route === 'science' && <Science />}
      {route === 'plan' && <Plan />}
      {route === 'faq' && <Faq />}
      {route === 'disclaimer' && <Disclaimer />}
      <footer><div className="wrap">
        <div className="small">MONO. — B/W only. Cosmetic product. No disease claims. <a href="#disclaimer">Disclaimer</a> · <a href="#science">Science</a></div>
        <div className="small muted">© 2026 MONO. Demo storefront — formulas require GMP + counsel sign-off before sale. No backend: Vite static.</div>
      </div></footer>
    </div>
  )
}
