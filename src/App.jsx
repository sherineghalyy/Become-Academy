import { useEffect, useState } from 'react'
import { ModalProvider } from './flows'
import { DEPT } from './data'
import { About, Contact, Courses, Department, Footer, Header, Home, Instructors, Partnerships } from './pages'

// Hash routing: #about, #courses, #courses-software, ... Anything else scrolls the home page.
const PAGES = { about: About, instructors: Instructors, partnerships: Partnerships, courses: Courses, contact: Contact }

function useHash() {
  const read = () => decodeURIComponent(location.hash.slice(1))
  const [hash, setHash] = useState(read)
  useEffect(() => {
    const on = () => setHash(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === 'departments' ? 'courses' : hash
}

export default function App() {
  const hash = useHash()
  const dm = hash.match(/^courses-([a-z]+)$/)
  const dept = dm && DEPT[dm[1]] ? dm[1] : null
  const Page = PAGES[hash]
  const page = dept ? 'courses' : Page ? hash : 'home'

  useEffect(() => {
    if (Page || dept || !hash || hash === 'home') { window.scrollTo(0, 0); return }
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView()
  }, [hash]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalProvider>
      <Header page={page} />
      <main>{dept ? <Department id={dept} /> : Page ? <Page /> : <Home />}</main>
      <Footer />
    </ModalProvider>
  )
}
