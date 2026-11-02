import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { DEPT, FACULTIES, courseFields } from './data'
import { COURSE_DATE, COURSE_TIME, INSTAPAY_URL, PHONE, RECORDED_FEE } from './config'
import { cooldownLeft, copyText, submit } from './submit'

/* ---------- context: any button can open a form ---------- */
const ModalCtx = createContext(null)
export const useModal = () => useContext(ModalCtx)

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null)
  const api = {
    book: (type) => setModal({ type: 'book', kind: type }),
    flow: (key, course) => setModal({ type: 'flow', key, course }),
  }
  const close = () => setModal(null)
  return (
    <ModalCtx.Provider value={api}>
      {children}
      {modal && (
        <Modal onClose={close}>
          {modal.type === 'book' && <BookingFlow kind={modal.kind} onClose={close} />}
          {modal.type === 'flow' && modal.key === 'recorded' && <RecordedFlow course={modal.course} onClose={close} />}
          {modal.type === 'flow' && modal.key !== 'recorded' && <FormFlow def={FLOWS[modal.key]} course={modal.course} onClose={close} />}
        </Modal>
      )}
    </ModalCtx.Provider>
  )
}

/* ---------- shell ---------- */
function Modal({ children, onClose }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.activeElement
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector('.x')?.focus({ preventScroll: true })
    return () => {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  return (
    <div className="modal" ref={ref} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">{children}</div>
    </div>
  )
}

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
)
const Tick = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
const Cross = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
)

function Head({ title, labels, step, onClose }) {
  return (
    <>
      <div className="mhead">
        <h3>{title}</h3>
        <button className="x" type="button" onClick={onClose} aria-label="Close"><XIcon /></button>
      </div>
      <div className="steps">
        {labels.map((l, i) => {
          const k = i + 1
          return (
            <div key={l} className={'step' + (k === step ? ' on' : '') + (k < step ? ' done' : '')}>
              <b>{k}</b><span>{l}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* last screen of every form */
function Result({ heading, lead, rows, res, onRetry, onClose }) {
  const [copied, setCopied] = useState(false)
  if (res.status !== 'sent') {
    return (
      <>
        <div className="done-mark bad"><Cross /></div>
        <h3 className="done-t">We could not send this</h3>
        <p className="done-lead">Please try again, or WhatsApp us on {PHONE}.</p>
        <div className="nav-row">
          <button className="btn line sm" type="button" onClick={async () => { await copyText(res.text); setCopied(true) }}>{copied ? 'Copied' : 'Copy details'}</button>
          <span style={{ display: 'flex', gap: 10 }}>
            {onRetry && <button className="btn line sm" type="button" onClick={onRetry}>Back</button>}
            <button className="btn primary sm" type="button" onClick={onClose}>Close</button>
          </span>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="done-mark"><Tick /></div>
      <p className="thanks">Thank you for choosing BECOME</p>
      <h3 className="done-t">{heading}</h3>
      {lead && <p className="done-lead">{lead}</p>}
      {rows?.length > 0 && (
        <dl className="sum">
          {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
      )}
      <div className="nav-row"><span /><button className="btn primary sm" type="button" onClick={onClose}>Done</button></div>
    </>
  )
}

function Chips({ name, items, value, onChange, multi }) {
  return (
    <div className="chips">
      {items.map(([v, l]) => (
        <label className="chip" key={v}>
          <input
            type={multi ? 'checkbox' : 'radio'}
            name={name}
            value={v}
            checked={multi ? value.includes(v) : value === v}
            onChange={() => onChange(multi ? (value.includes(v) ? value.filter((x) => x !== v) : [...value, v]) : v)}
          />
          <span>{l}</span>
        </label>
      ))}
    </div>
  )
}

/* hidden field that real people never see; bots tend to fill it */
const Honeypot = ({ value, onChange }) => (
  <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={value} onChange={(e) => onChange(e.target.value)} />
)

const waitMsg = (res) => `Please wait ${res.seconds} seconds before sending another request.`

/* ---------- booking: 3 screens ---------- */
const BOOK = {
  consult: ['Book your free consultation', 'Free consultation'],
  cv: ['Book your free CV review', 'Free CV review'],
  li: ['Book your free LinkedIn session', 'Free LinkedIn session'],
}
const TIMES = [['Morning', 'Morning'], ['Evening', 'Evening']]
const DAYS = [['Weekdays', 'Weekdays'], ['Weekend', 'Weekend']]
const BL = ['Choose', 'Your details', 'Confirmation']
const emailOk = (s) => /^\S+@\S+\.\S+$/.test(s)

function BookingFlow({ kind, onClose }) {
  const [title, name] = BOOK[kind] || BOOK.consult
  const [step, setStep] = useState(1)
  const [days, setDays] = useState('')
  const [time, setTime] = useState('')
  const [f, setF] = useState({ name: '', phone: '', email: '', note: '' })
  const [hp, setHp] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const rows = () => [['Booking', name], ['Available days', days], ['Available time', time], ['Name', f.name.trim()], ['WhatsApp', f.phone.trim()], ['Email', f.email.trim()], ...(f.note.trim() ? [['Note', f.note.trim()]] : [])]

  async function onSubmit(e) {
    e.preventDefault()
    if (!f.name.trim() || !f.phone.trim() || !emailOk(f.email.trim())) return setErr('Add your name, a WhatsApp number and a valid email to continue.')
    if (hp) { setRes({ status: 'sent', text: '' }); return setStep(3) }
    const left = cooldownLeft()
    if (left > 0) return setErr(waitMsg({ seconds: Math.ceil(left / 1000) }))
    setErr(''); setBusy(true)
    const r = await submit('Booking', rows())
    setBusy(false); setRes(r); setStep(3)
  }

  return (
    <>
      <Head title={title} labels={BL} step={step} onClose={onClose} />
      {step === 1 && (
        <>
          <span className="lab">Available days</span>
          <Chips name="days" items={DAYS} value={days} onChange={setDays} />
          <span className="lab">Available time</span>
          <Chips name="time" items={TIMES} value={time} onChange={setTime} />
          <div className="nav-row">
            <span className="hint">{days && time ? '' : 'Choose the days and the time that suit you.'}</span>
            <button className="btn primary" type="button" disabled={!days || !time} onClick={() => setStep(2)}>Next Step</button>
          </div>
        </>
      )}
      {step === 2 && (
        <form onSubmit={onSubmit} noValidate>
          <div className="row2">
            <div className="field"><label htmlFor="fName">Full name</label><input id="fName" autoComplete="name" maxLength={80} value={f.name} onChange={set('name')} autoFocus /></div>
            <div className="field"><label htmlFor="fPhone">WhatsApp number</label><input id="fPhone" type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={set('phone')} /></div>
          </div>
          <div className="field"><label htmlFor="fMail">Email</label><input id="fMail" type="email" autoComplete="email" maxLength={120} value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="fNote">Anything we should know? (optional)</label><textarea id="fNote" maxLength={600} value={f.note} onChange={set('note')} /></div>
          <Honeypot value={hp} onChange={setHp} />
          <p className="hint" style={{ color: 'var(--red)' }} role="alert">{err}</p>
          <div className="nav-row" style={{ marginTop: 14 }}>
            <button className="btn line" type="button" onClick={() => setStep(1)}>Back</button>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Confirm Booking'}</button>
          </div>
        </form>
      )}
      {step === 3 && res && (
        <Result heading="Your booking has successfully submitted" rows={rows().slice(0, 3)} res={res} onRetry={() => setStep(2)} onClose={onClose} />
      )}
    </>
  )
}

/* ---------- two-screen forms ---------- */
const sel = (list) => list.map((x) => [x, x])
const DEPTOPTS = [['software', 'Software'], ['business', 'Business'], ['arts', 'Digital Arts'], ['eng', 'Engineering']]

const FLOWS = {
  enroll: {
    title: (c) => 'Enroll in ' + c, labels: ['Your details', 'Confirmation'], submit: 'Enroll',
    fields: [[{ id: 'name', label: 'Name', type: 'text' }, { id: 'phone', label: 'Number', type: 'tel' }], { id: 'email', label: 'Email', type: 'email' }, { id: 'note', label: 'Any comments', type: 'textarea', opt: 1 }],
    build: (v, c) => ({
      rows: [['Course', c], ['Format', 'Live'], ['Name', v.name], ['Email', v.email], ['Number', v.phone], ['Comments', v.note || '-']],
      done: { heading: `You have enrolled successfully in ${c} course`, rows: [['Course', c], ['Format', 'Live'], ['Date', COURSE_DATE], ['Time', COURSE_TIME]] },
    }),
  },
  instructor: {
    title: () => 'Become an Instructor', labels: ['Application', 'Confirmation'], submit: 'Submit application',
    fields: [
      [{ id: 'name', label: 'Name', type: 'text' }, { id: 'phone', label: 'Number', type: 'tel' }],
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'faculty', label: 'Faculty', type: 'select', options: sel(FACULTIES) },
      { id: 'dept', label: 'Field / Department', type: 'select', options: DEPTOPTS },
      { id: 'years', label: 'Years of experience', type: 'number' },
      { id: 'courses', label: 'Trainer in', type: 'courses' },
    ],
    build: (v) => {
      const f = DEPT[v.dept].short
      return {
        rows: [['Name', v.name], ['Email', v.email], ['Number', v.phone], ['Faculty', v.faculty], ['Field / Department', f], ['Years of experience', v.years], ['Trainer in', v.courses.join(', ')]],
        done: { heading: 'Your application is successfully submitted', lead: 'We will contact you shortly after reviewing your application.', rows: [['Name', v.name], ['Field / Department', f], ['Trainer in', v.courses.join(', ')]] },
      }
    },
  },
  corporate: {
    title: () => 'Request Corporate Training', labels: ['Your request', 'Confirmation'], submit: 'Submit request',
    fields: [
      [{ id: 'name', label: 'Full name', type: 'text' }, { id: 'company', label: 'Company name', type: 'text' }],
      { id: 'email', label: 'Phone or email', type: 'text' },
      [{ id: 'trainees', label: 'Number of trainees', type: 'number' }, { id: 'within', label: 'Within', type: 'select', options: sel(['1 month', '2 months', '3 months', '6 months', '1 year']) }],
      { id: 'field', label: 'Field of training', type: 'select', options: sel(['Software', 'Business', 'Digital Arts', 'Engineering', 'Other']) },
      { id: 'note', label: 'Any comments', type: 'textarea', opt: 1 },
    ],
    build: (v) => ({
      rows: [['Full name', v.name], ['Company name', v.company], ['Phone or email', v.email], ['Number of trainees', v.trainees], ['Field of training', v.field], ['Within', v.within], ['Comments', v.note || '-']],
      done: { heading: 'Your request has been submitted successfully', lead: 'We will contact you as soon as we review your request.', rows: [['Company', v.company], ['Trainees', v.trainees], ['Field of training', v.field], ['Within', v.within]] },
    }),
  },
  partner: {
    title: () => 'Become a Partner', labels: ['Your details', 'Confirmation'], submit: 'Submit request',
    fields: [[{ id: 'name', label: 'Name', type: 'text' }, { id: 'email', label: 'Email', type: 'email' }], [{ id: 'company', label: 'Company name', type: 'text' }, { id: 'phone', label: 'Number', type: 'tel' }], { id: 'note', label: 'Any comments', type: 'textarea', opt: 1 }],
    build: (v) => ({
      rows: [['Name', v.name], ['Email', v.email], ['Company name', v.company], ['Number', v.phone], ['Comments', v.note || '-']],
      done: { heading: 'Your request has been submitted successfully', lead: 'We will contact you as soon as we review your request.', rows: [['Name', v.name], ['Company', v.company]] },
    }),
  },
}

const flat = (fields) => fields.flatMap((f) => (Array.isArray(f) ? f : [f]))
const LIMITS = { text: 100, tel: 25, email: 120, number: 6, textarea: 600 }

function Control({ f, v, set }) {
  const id = 'ff_' + f.id
  const label = f.label + (f.opt ? ' (optional)' : '')
  const on = (e) => set(f.id, e.target.value)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {f.type === 'textarea' && <textarea id={id} maxLength={LIMITS.textarea} value={v[f.id] || ''} onChange={on} />}
      {f.type === 'select' && (
        <select id={id} value={v[f.id] || ''} onChange={on}>
          <option value="">Choose</option>
          {f.options.map(([val, l]) => (<option key={val} value={val}>{l}</option>))}
        </select>
      )}
      {f.type !== 'textarea' && f.type !== 'select' && (
        <input id={id} type={f.type} maxLength={LIMITS[f.type] || 100} {...(f.type === 'number' ? { min: 0, inputMode: 'numeric' } : {})} value={v[f.id] || ''} onChange={on} />
      )}
    </div>
  )
}

function FormFlow({ def, course, onClose }) {
  const [step, setStep] = useState(1)
  const [v, setV] = useState({ courses: [] })
  const [hp, setHp] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState(null)
  const set = (id, val) => setV((p) => ({ ...p, [id]: val, ...(id === 'dept' ? { courses: [] } : {}) }))
  const title = def.title(course)

  async function onSubmit(e) {
    e.preventDefault()
    let msg = ''
    flat(def.fields).forEach((f) => {
      if (msg || f.opt) return
      if (f.type === 'courses') { if (!v.courses.length) msg = 'Choose at least one course you can train.'; return }
      const val = String(v[f.id] || '').trim()
      if (!val) msg = 'Please complete every field.'
      else if (f.type === 'email' && !emailOk(val)) msg = 'Enter a valid email address.'
    })
    if (msg) return setErr(msg)
    const clean = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' ? x.trim() : x]))
    const built = def.build(clean, course)
    if (hp) { setOut({ built, res: { status: 'sent', text: '' } }); return setStep(2) }
    const left = cooldownLeft()
    if (left > 0) return setErr(waitMsg({ seconds: Math.ceil(left / 1000) }))
    setErr(''); setBusy(true)
    const res = await submit(title, built.rows)
    setBusy(false); setOut({ built, res }); setStep(2)
  }

  return (
    <>
      <Head title={title} labels={def.labels} step={step} onClose={onClose} />
      {step === 1 && (
        <form onSubmit={onSubmit} noValidate>
          {def.fields.map((f, i) =>
            Array.isArray(f) ? (
              <div className="row2" key={i}>{f.map((g) => <Control key={g.id} f={g} v={v} set={set} />)}</div>
            ) : f.type === 'courses' ? (
              <div className="field" key={f.id}>
                <span className="lab" style={{ margin: 0 }}>{f.label}</span>
                {v.dept ? (
                  <Chips name="courses" multi items={DEPT[v.dept].tracks.map((t) => [t, t])} value={v.courses} onChange={(x) => set('courses', x)} />
                ) : (
                  <span className="hint">Choose a field to see its courses.</span>
                )}
              </div>
            ) : (
              <Control key={f.id} f={f} v={v} set={set} />
            ),
          )}
          <Honeypot value={hp} onChange={setHp} />
          <p className="hint" style={{ color: 'var(--red)' }} role="alert">{err}</p>
          <div className="nav-row" style={{ marginTop: 14 }}>
            <button className="btn line" type="button" onClick={onClose}>Cancel</button>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Sending...' : def.submit}</button>
          </div>
        </form>
      )}
      {step === 2 && out && (
        <Result heading={out.built.done.heading} lead={out.built.done.lead} rows={out.built.done.rows} res={out.res} onRetry={() => setStep(1)} onClose={onClose} />
      )}
    </>
  )
}

/* ---------- recorded course: pay, upload two screenshots, confirm ---------- */
const RL = ['Payment', 'Screenshots', 'Confirmation']
const price = RECORDED_FEE.toLocaleString('en-US') + ' EGP'
const MAX = 8 * 1024 * 1024

function RecordedFlow({ course, onClose }) {
  const title = 'Recorded: ' + course
  const [step, setStep] = useState(1)
  const [f, setF] = useState({ name: '', phone: '' })
  const [s1, setS1] = useState(null)
  const [s2, setS2] = useState(null)
  const [hp, setHp] = useState('')
  const [err, setErr] = useState('')
  const [phase, setPhase] = useState('loading')
  const [res, setRes] = useState(null)

  function confirm() {
    if (!f.name.trim() || !f.phone.trim()) return setErr('Add your name and WhatsApp number.')
    if (!s1 || !s2) return setErr('Upload both screenshots to continue.')
    if (![s1, s2].every((x) => x.type.startsWith('image/'))) return setErr('Screenshots must be images.')
    if ([s1, s2].some((x) => x.size > MAX)) return setErr('Each screenshot must be under 8 MB.')
    const left = cooldownLeft()
    if (left > 0) return setErr(waitMsg({ seconds: Math.ceil(left / 1000) }))
    setErr(''); setPhase('loading'); setStep(3)
  }

  useEffect(() => {
    if (step !== 3) return
    let alive = true
    const rows = [['Course', course], ['Format', 'Recorded'], ['Amount', price], ['Name', f.name.trim()], ['WhatsApp', f.phone.trim()]]
    const send = hp ? Promise.resolve({ status: 'sent', text: '' }) : submit('Recorded course payment', rows, { payment_screenshot: s1, details_screenshot: s2 })
    Promise.all([send, new Promise((r) => setTimeout(r, 2800))]).then(([r]) => {
      if (!alive) return
      setRes(r); setPhase(r.status === 'sent' ? 'ok' : 'failed')
    })
    return () => { alive = false }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head title={title} labels={RL} step={step} onClose={onClose} />
      {step === 1 && (
        <>
          <p className="done-lead" style={{ margin: '0 0 16px' }}>Pay <b style={{ color: 'var(--fg)' }}>{price}</b> through this Instapay link:</p>
          {INSTAPAY_URL ? (
            <a className="btn line" href={INSTAPAY_URL} target="_blank" rel="noopener noreferrer">Open Instapay link</a>
          ) : (
            <div className="callout">The Instapay link will appear here.</div>
          )}
          <p className="hint" style={{ marginTop: 16 }}>When the payment is complete, press Done and upload two screenshots.</p>
          <div className="nav-row">
            <button className="btn line" type="button" onClick={onClose}>Cancel</button>
            <button className="btn primary" type="button" onClick={() => setStep(2)}>Done</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="row2">
            <div className="field"><label htmlFor="rName">Full name</label><input id="rName" autoComplete="name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="rPhone">WhatsApp number</label><input id="rPhone" type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="shot1">Screenshot 1: the payment</label><input className="filein" id="shot1" type="file" accept="image/*" onChange={(e) => setS1(e.target.files[0] || null)} /></div>
          <div className="field"><label htmlFor="shot2">Screenshot 2: the payment details</label><input className="filein" id="shot2" type="file" accept="image/*" onChange={(e) => setS2(e.target.files[0] || null)} /></div>
          <Honeypot value={hp} onChange={setHp} />
          <p className="hint" style={{ color: 'var(--red)' }} role="alert">{err}</p>
          <div className="nav-row" style={{ marginTop: 14 }}>
            <button className="btn line" type="button" onClick={() => setStep(1)}>Back</button>
            <button className="btn primary" type="button" onClick={confirm}>Confirm</button>
          </div>
        </>
      )}
      {step === 3 && phase === 'loading' && (
        <>
          <p className="thanks">Thank you for choosing BECOME</p>
          <div className="spin" aria-hidden="true" />
          <h3 className="done-t">Confirming your payment</h3>
          <p className="done-lead">Please wait a moment. Do not close this window.</p>
        </>
      )}
      {step === 3 && phase !== 'loading' && res && (
        <Result
          heading="Your payment has been successfully done"
          lead="We will send your recorded sessions link to you shortly."
          rows={[['Course', course], ['Format', 'Recorded'], ['Amount', price]]}
          res={res}
          onRetry={() => setStep(2)}
          onClose={onClose}
        />
      )}
    </>
  )
}
