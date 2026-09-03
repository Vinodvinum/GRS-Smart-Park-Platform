import Link from 'next/link'
import { ArrowRight, CalendarDays, CircleHelp, MapPinned, Ticket } from 'lucide-react'
import { queueZones } from '@/lib/demo-data'
import { guestExperiences, facilities } from '@/lib/guest-data'
import { GuestShell } from '@/components/GuestShell'

export default function GuestPage() {
  return (
    <GuestShell>
      <main className="page">
        <div className="container">
          <section className="pageTitle guestWelcome">
            <div>
              <div className="kicker">YOUR GRS DAY</div>
              <h1>Plan the fun.<br />Enjoy the day.</h1>
              <p>Explore the real park experiences, build a simple itinerary and keep your visit essentials close at hand.</p>
              <div className="hero-actions">
                <Link href="/plan" className="primary"><CalendarDays size={16}/> Plan My Visit <ArrowRight size={15}/></Link>
                <Link href="/booking" className="secondary"><Ticket size={16}/> Book a visit</Link>
              </div>
            </div>
            <div className="guestWelcomeArt" role="img" aria-label="GRS Fantasy Park water rides" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,24,43,.04), rgba(7,22,39,.46)), url(${guestExperiences[0].image})` }}>
              <div><span>GRS FANTASY PARK</span><strong>Make room for a little more fun.</strong></div>
            </div>
          </section>

          <section className="section compactSection">
            <div className="section-head"><div><span className="eyebrow">DISCOVER</span><h2>Choose your experience.</h2></div><Link href="/experiences" className="textLink">View all <ArrowRight size={15}/></Link></div>
            <div className="experienceGrid experienceCatalogue">
              {guestExperiences.map((item) => (
                <Link href={`/experiences/${item.id}`} className="card experience experience-full" key={item.id}>
                  <div className="experienceImage" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="experienceBody"><div><b>{item.name}</b><small>{item.category}</small><p>{item.description}</p></div><ArrowRight size={17}/></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="section compactSection">
            <div className="section-head"><div><span className="eyebrow">LIVE PARK</span><h2>Know before you move.</h2></div><p>Queue indicators are shown from the operations intelligence layer. Live integration can replace demo snapshots when the park feed is connected.</p></div>
            <div className="grid queueGrid">
              {queueZones.map((z) => <article className="card queueCard" key={z.zone}>
                <div className="muted">{z.zone}</div>
                <div className="kpi">{z.minutes} <small>min</small></div>
                <span className={`badge ${z.risk === 'High' ? 'badge-high' : z.risk === 'Medium' ? 'badge-med' : ''}`}>{z.risk} risk</span>
              </article>)}
            </div>
          </section>

          <section className="section compactSection">
            <div className="section-head"><div><span className="eyebrow">PARK ESSENTIALS</span><h2>Everything you may need.</h2></div></div>
            <div className="facilityGrid">
              {facilities.map(([name, category, description]) => <article className="card facilityCard" key={name}><div className="facilityIcon"><MapPinned size={16}/></div><div><b>{name}</b><small>{category}</small><p>{description}</p></div></article>)}
            </div>
          </section>

          <section className="section compactSection">
            <div className="serviceBand card">
              <div><div className="kicker">NEED HELP?</div><h2>We’ll help you keep moving.</h2><p>Lost & found, medical help, locker issues, food, ride problems and cleaning requests are handled through the guest service workflow.</p></div>
              <div className="actions"><Link href="/help" className="primary"><CircleHelp size={16}/> Get help <ArrowRight size={15}/></Link><Link href="/my-visit" className="secondary">My Visit</Link></div>
            </div>
          </section>
        </div>
      </main>
    </GuestShell>
  )
}
