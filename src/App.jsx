import { useEffect, useState } from 'react'
import Landing from './Landing.jsx'
import Dashboard from './Dashboard.jsx'
export default function App() {
  const get = () => (location.hash === '#app' ? 'app' : 'home')
  const [page, setPage] = useState(get)
  useEffect(() => { const f = () => { setPage(get()); window.scrollTo(0, 0) }
    addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => { const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.1 })
    document.querySelectorAll('section, .card').forEach(el => { el.classList.add('rv'); io.observe(el) }); return () => io.disconnect() }, [page])
  return page === 'app' ? <Dashboard /> : <Landing />
}
