import { useState } from 'react'
import Globe from './Globe'
import { useModal } from './flows'
import { DEPT, INSTRUCTORS, PARTNERS, SESSIONS, courseFields } from './data'
import { PERSONAL_EMAIL, PHONE, PUBLIC_EMAIL, WHATSAPP_URL } from './config'
import { copyText } from './submit'
import mark from './assets/mark.png'
import fullLogo from './assets/full.png'

/* ---------- small pieces ---------- */
const Crumb = ({ children }) => <div className="crumb"><a href="#home">Home</a> / {children}</div>

function PageHero({ crumb, tag, title, lead }) {
  return (
    <section className="page-hero" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <Crumb>{crumb}</Crumb>
        <div className="eyebrow">{tag}</div>
        <h1>{title}</h1>
        {lead && <p className="lede">{lead}</p>}
      </div>
    </section>
  )
}

function Stats() {
  return (
    <div className="stats">
      <div className="stat"><b>100+</b><span>Students trained</span></div>
      <div className="stat"><b>4</b><span>Departments</span></div>
      <div className="stat"><b>10+</b><span>Partners</span></div>
    </div>
  )
}

function PartnerGrid({ keys, small }) {
  return (
    <div className={'pgrid' + (small ? ' sm' : '')}>
      {keys.map((k) => {
        const p = PARTNERS[k]
        return (
          <figure className="pcard" key={k}>
            <div className={'plogo' + (p.dark ? ' dark' : '')}><img src={p.img} alt={p.alt} loading="lazy" /></div>
            <figcaption>{p.name}</figcaption>
          </figure>
        )
      })}
    </div>
  )
}

/* ---------- header / footer ---------- */
const NAV = [['home', 'Home', '#home'], ['about', 'About Us', '#about'], ['instructors', 'Instructors', '#instructors'], ['partnerships', 'Partnerships', '#partnerships'], [null, 'Free Services', '#career'], ['contact', 'Contact Us', '#contact']]

export function Header({ page }) {
  const [open, setOpen] = useState(false)
  const links = NAV.map(([id, label, href]) => (
    <a key={label} href={href} aria-current={id && id === page ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>
  ))
  return (
    <header className="top">
      <div className="wrap bar">
        <a className="brand" href="#home" aria-label="BECOME Academy home"><img src={mark} alt="" height="32" /><span>BECOME</span></a>
        <nav id="nav" aria-label="Primary">{links}</nav>
        <div className="bar-r">
          <a className="btn primary sm" href="#courses" aria-current={page === 'courses' ? 'page' : undefined}>Explore Courses</a>
          <button className="burger" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 5h14M2 13h14" /></svg>
          </button>
        </div>
      </div>
      <div className={'mnav' + (open ? ' open' : '')} id="mnav">
        <div className="wrap">
          {links}
          <a href="#courses" onClick={() => setOpen(false)}>Explore Courses</a>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>&copy; BECOME Academy &middot; becomeacademy.net &middot; {PHONE}</span>
        <span><a href="#about">About</a> &nbsp;&middot;&nbsp; <a href="#courses">Courses</a> &nbsp;&middot;&nbsp; <a href="#instructors">Instructors</a> &nbsp;&middot;&nbsp; <a href="#partnerships">Partnerships</a> &nbsp;&middot;&nbsp; <a href="#contact">Contact</a></span>
      </div>
    </footer>
  )
}

/* ---------- home ---------- */
const FAQ = [
  ['What is the difference between Live and Recorded courses?', 'Live courses run in scheduled batches with an instructor, discussions and assignments. Recorded courses are taken at your own pace. Each format has its own price, availability and enrolment steps.'],
  ['Is the career consultation really free?', 'Yes. Career consultation, CV review and LinkedIn optimization are free career services open to students and visitors.'],
  ['Do I need experience before I join a course?', 'Each course lists its requirements and target audience, so you can see whether it fits your level before you enrol.'],
  ['How do I enroll?', 'Open a department, choose Live or Recorded on a course, select Enroll Now and fill in a short form.'],
  ['Will I get a certificate?', 'Where a course offers one, it is listed under Deliverables on the course page, together with projects and assessments.'],
  ['Can my company train its team with BECOME?', 'Yes. Open the Partnerships page and choose Request Corporate Training.'],
]
const WHY = [
  ['Practical learning', 'Sessions built around doing the task, with assignments you apply straight away.'],
  ['Real projects', 'Deliverables you can show to an employer.'],
  ['Onsite training', 'Hands-on training delivered in person with your instructor.'],
  ['Career support', 'Free consultation, CV review and LinkedIn optimization.'],
  ['Job opportunity', 'Introductions to hiring partners as you finish.'],
]

export function Home() {
  const m = useModal()
  return (
    <>
      <section className="hero" id="home">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">BECOME Academy</div>
              <h1>Your future starts with what you want to <em>become.</em></h1>
              <p className="lede">Practical learning, industry-focused tracks, and career development support designed to bridge the gap between education and the job market.</p>
              <div className="cta-row">
                <a className="btn primary" href="#courses">Explore Programs</a>
                <button className="btn line" type="button" onClick={() => m.book('consult')}>Book Free Consultation</button>
              </div>
            </div>
            <div className="globe-box">
              <Globe />
              <div className="globe-cap">Learners and partners, worldwide</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg2" id="why">
        <div className="wrap">
          <div className="sec-head"><div className="eyebrow">Why BECOME</div><h2>What you get.</h2></div>
          <div className="why-grid">
            {WHY.map(([h, p]) => (<div className="why-item" key={h}><h3>{h}</h3><p>{p}</p></div>))}
          </div>
        </div>
      </section>

      <section className="paper" id="career">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">Career Support Hub</div>
            <h2>Free help with your next step.</h2>
            <p className="lede">Open to students and visitors. Book a session in under a minute.</p>
          </div>
          <div className="career-grid">
            <article className="svc"><span className="free">Free</span><h3>Career Consultation</h3><p>Help choosing the right department, learning track or next career step.</p><button className="btn primary" type="button" onClick={() => m.book('consult')}>Book Your Free Session</button></article>
            <article className="svc"><span className="free">Free</span><h3>CV Review</h3><p>CV feedback, formatting recommendations and advice on presenting your skills and projects.</p><button className="btn primary" type="button" onClick={() => m.book('cv')}>Book CV Review</button></article>
            <article className="svc"><span className="free">Free</span><h3>LinkedIn Optimization</h3><p>Guidance on headlines, About sections, experience descriptions and professional visibility.</p><button className="btn primary" type="button" onClick={() => m.book('li')}>Book LinkedIn Session</button></article>
          </div>
        </div>
      </section>

      <section id="stats">
        <div className="wrap">
          <Stats />
          <p className="note">Concept preview. Figures are shown once verified.</p>
          <div className="sec-head" style={{ margin: 'clamp(40px,6vw,72px) 0 28px' }}>
            <div className="eyebrow">Partnership</div>
            <div className="pcount"><b>10+</b><h2 style={{ fontSize: 'clamp(1.6rem,3.2vw,2.6rem)' }}>partners working with BECOME</h2></div>
          </div>
          <PartnerGrid small keys={['SYND', 'ITIDA', 'CREATIVA']} />
          <div style={{ marginTop: 26 }}><a className="btn line sm" href="#partnerships">See all partners</a></div>
        </div>
      </section>

      <section className="bg2" id="faq">
        <div className="wrap">
          <div className="sec-head"><div className="eyebrow">FAQ</div><h2>Common questions.</h2></div>
          <div className="faq">
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className="final" id="final">
        <div className="wrap final-grid">
          <div>
            <div className="eyebrow">Ready to begin?</div>
            <h2>Start with a free conversation.</h2>
            <p className="lede">Call or WhatsApp {PHONE}, or book a free consultation and we will contact you.</p>
            <div className="cta-row">
              <button className="btn primary" type="button" onClick={() => m.book('consult')}>Book Free Consultation</button>
              <a className="btn line" href="#contact">Contact Us</a>
            </div>
          </div>
          <img src={fullLogo} alt="BECOME logo" width="200" />
        </div>
      </section>
    </>
  )
}

/* ---------- about ---------- */
export function About() {
  const m = useModal()
  return (
    <>
      <PageHero crumb="About Us" tag="About Us" title="Practical skills for real careers."
        lead="BECOME is a practical education and career development platform for learners who want skills the market asks for, taught through real projects and supported by people who have done the job." />
      <section style={{ paddingTop: 'clamp(40px,6vw,72px)', paddingBottom: 'clamp(40px,6vw,72px)' }}>
        <div className="wrap">
          <div className="why-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))' }}>
            <div className="why-item"><h3>Who we are</h3><p>A learning academy for students and early-career professionals across business, technology, digital arts and engineering.</p></div>
            <div className="why-item"><h3>Our mission</h3><p>Bridging the gap between academic education and the job market through practical learning.</p></div>
            <div className="why-item"><h3>Our vision</h3><p>Becoming a trusted career development and practical education platform.</p></div>
            <div className="why-item"><h3>Our learning approach</h3><p>Practical training, real-world projects, instructor guidance and career support.</p></div>
          </div>
          <div style={{ marginTop: 'clamp(40px,6vw,72px)', borderTop: '1px solid var(--line)', paddingTop: 28 }}>
            <span className="lab" style={{ marginTop: 0 }}>Our philosophy</span>
            <div className="phil" aria-label="Begin. Learn. Practice. Become."><span>BEGIN.</span><span>LEARN.</span><span>PRACTICE.</span><span>BECOME.</span></div>
          </div>
        </div>
      </section>
      <section className="bg2" style={{ paddingBlock: 'clamp(48px,7vw,88px)' }}>
        <div className="wrap">
          <div className="sec-head"><div className="eyebrow">Our impact</div><h2>The numbers so far.</h2></div>
          <Stats />
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}><div className="eyebrow">Real work</div><h2>Live sessions with our students.</h2></div>
          <div className="gallery">
            {SESSIONS.map((s, i) => (<img key={i} src={s} alt="Live online session with students" loading="lazy" />))}
          </div>
        </div>
      </section>
      <section className="page-end" style={{ paddingBlock: 'clamp(36px,5vw,60px)' }}>
        <div className="wrap">
          <h2>See what you can learn.</h2>
          <div className="cta-row" style={{ margin: 0 }}>
            <a className="btn primary" href="#courses">Explore Courses</a>
            <button className="btn line" type="button" onClick={() => m.book('consult')}>Book Free Consultation</button>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------- instructors ---------- */
export function Instructors() {
  const m = useModal()
  return (
    <>
      <PageHero crumb="Instructors" tag="Instructors" title="Learn from industry experts."
        lead="Every instructor has a public profile, so you know who you will learn from before you enrol." />
      <section style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
        <div className="wrap">
          <div className="inst-grid">
            {INSTRUCTORS.map((p) => (
              <article className="inst" key={p.name}>
                <div className="avatar"><img src={p.img} alt={p.name} width="520" height="520" loading="lazy" /></div>
                <h3>{p.name}</h3>
                <ul className="facts">{p.facts.map((f) => (<li key={f}>{f}</li>))}</ul>
              </article>
            ))}
          </div>
          <div className="split-cta">
            <p>Experienced professional? BECOME is growing its bench of instructors across all four departments.</p>
            <button className="btn line" type="button" onClick={() => m.flow('instructor')}>Become an Instructor</button>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------- partnerships ---------- */
export function Partnerships() {
  const m = useModal()
  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <Crumb>Partnerships</Crumb>
          <div className="eyebrow">Partnerships</div>
          <div className="pcount"><b>10+</b><h1 style={{ fontSize: 'clamp(2rem,4.6vw,3.8rem)' }}>partners working with BECOME</h1></div>
          <p className="lede">Professional bodies, universities and technology institutions that stand behind the academy.</p>
        </div>
      </section>
      <section style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
        <div className="wrap"><PartnerGrid keys={['SYND', 'CREATIVA', 'ITIDA', 'AIET', 'NW']} /></div>
      </section>
      <section className="bg2" style={{ paddingBlock: 'clamp(48px,7vw,88px)' }}>
        <div className="wrap">
          <div className="sec-head"><div className="eyebrow">Become a partner</div><h2>Two ways to build with us.</h2></div>
          <div className="part-grid">
            <article className="part"><div className="eyebrow" style={{ margin: 0 }}>Corporate Partners</div><h3>Train your team.</h3><p>Customised corporate training, employee upskilling, workshops, team development and training needs assessments.</p><button className="btn primary" type="button" onClick={() => m.flow('corporate')}>Request Corporate Training</button></article>
            <article className="part"><div className="eyebrow" style={{ margin: 0 }}>Academic &amp; Hiring Partners</div><h3>Connect students to careers.</h3><p>University collaborations, student programmes, career events, industry-led projects and recruitment connections.</p><button className="btn primary" type="button" onClick={() => m.flow('partner')}>Become a Partner</button></article>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------- courses: departments, then a department's courses ---------- */
export function Courses() {
  return (
    <>
      <PageHero crumb="Explore Courses" tag="Explore Courses" title="Four fields. Pick yours."
        lead="Choose a department to see its courses, then pick Live or Recorded and enroll." />
      <section style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
        <div className="wrap">
          <div className="dgrid">
            {Object.entries(DEPT).map(([k, d]) => (
              <a className="dbtn" key={k} href={'#courses-' + k} style={{ '--c': d.c }}>
                <div className="dsq"><img src={d.img} alt={d.name + ' department'} width="520" height="520" /></div>
                <h3><span className="dot" />{d.name}</h3>
                <p>{d.blurb}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function CourseCard({ title, d }) {
  const m = useModal()
  const [mode, setMode] = useState('live')
  const live = mode === 'live'
  return (
    <article className="card">
      <div className="card-top">
        <span className="dept-l"><span className="dot" style={{ '--c': d.c }} />{d.short}</span>
        <span className={'badge' + (live ? ' live' : '')}>{live ? 'Live' : 'Recorded'}</span>
      </div>
      <h4>{title}</h4>
      <div className="cardsw" role="group" aria-label={'Format for ' + title}>
        <button type="button" aria-pressed={live} onClick={() => setMode('live')}>Live</button>
        <button type="button" aria-pressed={!live} onClick={() => setMode('rec')}>Recorded</button>
      </div>
      <dl>{courseFields(title, mode).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
      <button className="btn primary sm" type="button" onClick={() => m.flow(live ? 'enroll' : 'recorded', title)}>{live ? 'Enroll Now' : 'Pay & Watch'}</button>
    </article>
  )
}

export function Department({ id }) {
  const d = DEPT[id]
  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="crumb"><a href="#home">Home</a> / <a href="#courses">Explore Courses</a> / {d.name}</div>
          <div className="eyebrow">{d.tag}</div>
          <h1>{d.name}</h1>
          <p className="lede">{d.blurb}</p>
        </div>
      </section>
      <section style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
        <div className="wrap">
          <div className="cards">{d.tracks.map((t) => (<CourseCard key={t} title={t} d={d} />))}</div>
          <p className="sample-note">Sample layout. Each course is filled with its final dates, instructor and fee as batches are confirmed. Live and Recorded editions keep separate pricing, availability and access.</p>
          <div style={{ marginTop: 22 }}><a className="btn line sm" href="#courses">All departments</a></div>
        </div>
      </section>
    </>
  )
}

/* ---------- contact ---------- */
function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false)
  return (
    <button className="btn line sm" type="button" onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1800) } }}>
      {done ? 'Copied' : label}
    </button>
  )
}

export function Contact() {
  const m = useModal()
  return (
    <>
      <PageHero crumb="Contact Us" tag="Contact Us" title="Talk to BECOME."
        lead="Call, WhatsApp or email us about courses, partnerships or becoming an instructor." />
      <section style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
        <div className="wrap">
          <div className="crow">
            <div><span className="k">Phone / WhatsApp</span><span className="v">{PHONE}</span></div>
            <div className="acts"><CopyBtn text={PHONE} label="Copy number" /><a className="btn primary sm" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></div>
          </div>
          <div className="crow">
            <div><span className="k">Email</span><span className="v">{PERSONAL_EMAIL}</span></div>
            <div className="acts"><CopyBtn text={PERSONAL_EMAIL} label="Copy email" /></div>
          </div>
          <div className="crow">
            <div><span className="k">Academy email</span><span className="v">{PUBLIC_EMAIL}</span></div>
            <div className="acts"><CopyBtn text={PUBLIC_EMAIL} label="Copy email" /></div>
          </div>
          <div className="cta-row"><button className="btn primary" type="button" onClick={() => m.book('consult')}>Book Free Consultation</button></div>
        </div>
      </section>
    </>
  )
}
