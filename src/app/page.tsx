import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { guestExperiences } from '@/lib/guest-data'
import { AuthStatus } from '@/components/AuthStatus'
import { Brand } from '@/components/Brand'

const stats = [
  ['4', 'Experiences'],
  ['365', 'Days open'],
  ['4–6h', 'Fantasy Park play time'],
]

export default function HomePage() {
  const heroImage = guestExperiences[0].image

  return (
    <main>
      <nav className="topbar container">
        <Brand />
        <div className="navlinks">
          <Link href="/experiences" className="navlink">Experiences</Link>
          <Link href="/plan" className="navlink">Plan My Visit</Link>
          <Link href="/guide" className="navlink">Guide</Link>
          <Link href="/offers" className="navlink hide-mobile">Offers</Link>
          <Link href="/operations" className="navlink hide-mobile">Operations</Link>
          <AuthStatus />
        </div>
        <Link href="/booking" className="small-cta">Book a visit <span>→</span></Link>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> DIGITAL PARK EXPERIENCE</div>
          <h1>Make every visit<br /><em>feel effortless.</em></h1>
          <p>Discover real GRS experiences, plan your day, book your visit and keep everything you need for the park in one connected place.</p>
          <div className="hero-actions">
            <Link href="/plan" className="primary-cta">Plan my visit <span>→</span></Link>
            <Link href="/experiences" className="secondary-cta">Explore experiences</Link>
          </div>
          <div className="mini-stats">{stats.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
        </div>
        <div
          className="hero-art"
          role="img"
          aria-label="GRS Fantasy Park water rides"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(10,24,43,.04), rgba(7,22,39,.34)), url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="art-card"><span>GRS FANTASY PARK</span><strong>Water, rides & family fun</strong><small>Start with the experience you want. We’ll help you plan the rest.</small></div>
        </div>
      </section>

      <section className="section container" id="platform">
        <div className="section-head"><div><span className="eyebrow">ONE CONNECTED PLATFORM</span><h2>Everything around the visit.</h2></div><p>Guest experience on the front. Operations intelligence behind it.</p></div>
        <div className="experience-grid">
          {guestExperiences.map((x, i) => <Link href={`/experiences/${x.id}`} className={`card experience experience-full card-${i}`} key={x.id}>
            <div className="experienceImage" style={{ backgroundImage: `url(${x.image})` }} aria-hidden="true" />
            <div className="experienceBody"><div><b>{x.name}</b><small>{x.category}</small><p>{x.description}</p></div><ArrowRight size={17} /></div>
          </Link>)}
        </div>
      </section>

      <section className="section container feature-band">
        <div><span className="eyebrow">BUILT FOR THE WHOLE PARK</span><h2>From booking to operations.</h2><p>Bookings, digital passes, queue visibility, guest requests, incidents and management intelligence are designed as one system.</p></div>
        <div className="flow"><span>Discover</span><i>→</i><span>Plan</span><i>→</i><span>Book</span><i>→</i><span>Visit</span><i>→</i><span>Help</span></div>
      </section>

      <footer className="container footer"><span>GRS SMART PARK PLATFORM</span><span>Portfolio concept · GRS imagery · Demo operations data</span></footer>
    </main>
  )
}
