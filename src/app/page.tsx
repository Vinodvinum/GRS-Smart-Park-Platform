import Link from 'next/link'
import { experiences } from '@/lib/demo-data'
import { AuthStatus } from '@/components/AuthStatus'

const stats = [
  ['4', 'Experiences'],
  ['24/7', 'Digital access'],
  ['Live', 'Operations'],
]

export default function HomePage() {
  return (
    <main>
      <nav className="topbar container">
        <Link href="/" className="brand"><span className="brand-mark">G</span><span>GRS <b>SMART PARK</b></span></Link>
        <div className="navlinks">
          <Link href="/guest" className="navlink">Guest</Link>
          <Link href="/operations" className="navlink">Operations</Link>
          <a href="#platform" className="navlink hide-mobile">Platform</a>
          <AuthStatus />
        </div>
        <Link href="/guest" className="small-cta">Explore park <span>→</span></Link>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> DIGITAL PARK EXPERIENCE</div>
          <h1>Make every visit<br /><em>feel effortless.</em></h1>
          <p>One connected platform for discovering GRS experiences, planning a visit, booking, getting help and keeping park operations moving.</p>
          <div className="hero-actions">
            <Link href="/guest" className="primary-cta">Plan my visit <span>→</span></Link>
            <Link href="/operations" className="secondary-cta">View operations</Link>
          </div>
          <div className="mini-stats">{stats.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
        </div>
        <div className="hero-art" aria-label="GRS park visual placeholder">
          <div className="sun" /><div className="wave wave-one" /><div className="wave wave-two" />
          <div className="slide slide-one" /><div className="slide slide-two" />
          <div className="art-card"><span>LIVE PARK</span><strong>Ready for adventure</strong><small>Plan your day around the moments that matter.</small></div>
        </div>
      </section>

      <section className="section container" id="platform">
        <div className="section-head"><div><span className="eyebrow">ONE CONNECTED PLATFORM</span><h2>Everything around the visit.</h2></div><p>Guest experience on the front. Operations intelligence behind it.</p></div>
        <div className="experience-grid">
          {experiences.map((x, i) => <Link href="/guest" className={`experience-card card-${i}`} key={x.id}><span className="number">0{i + 1}</span><div><h3>{x.name}</h3><p>{x.description}</p></div><span className="arrow">↗</span></Link>)}
        </div>
      </section>

      <section className="section container feature-band">
        <div><span className="eyebrow">BUILT FOR THE WHOLE PARK</span><h2>From booking to operations.</h2><p>Bookings, digital passes, queue visibility, guest requests, incidents and management intelligence are designed as one system.</p></div>
        <div className="flow"><span>Book</span><i>→</i><span>Visit</span><i>→</i><span>Help</span><i>→</i><span>Resolve</span><i>→</i><span>Learn</span></div>
      </section>

      <footer className="container footer"><span>GRS SMART PARK PLATFORM</span><span>Portfolio concept · Demo data only</span></footer>
    </main>
  )
}
