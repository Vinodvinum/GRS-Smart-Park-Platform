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
          <section className="pageTitle">
            <div className="kicker">YOUR GRS DAY</div>
            <h1>Plan the fun.<br />Enjoy the day.</h1>
            <p>Explore real GRS experiences, build a simple itinerary and keep your visit essentials close at hand.</p>
            <div className="hero-actions">
              <Link href="/plan" className="primary"><CalendarDays size={16}/> Plan My Visit <ArrowRight size={15}/></Link>
              <Link href="/booking" className="secondary"><Ticket size={16}/> Book a visit</Link>
            </div>
          </section>

          <section className="section">
            <div className="section-head"><div><span className="eyebrow">DISCOVER</span><h2>Choose your experience.</h2></div><Link href="/experiences" className="navlink">View all <ArrowRight size={15}/></Link></div>
            <div className="experienceGrid experienceCatalogue">
              {guestExperiences.map((item) => (
                <Link href={`/experiences/${item.id}`} className="card experience experience-full" key={item.id}>
                  <div className="experienceImage" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="experienceBody"><div><b>{item.name}</b><small>{item.category}</small><p>{item.description}</p></div><ArrowRight size={17}/></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head"><div><span className="eyebrow">LIVE PARK</span><h2>Know before you move.</h2></div><p>Queue indicators are shown from the operations intelligence layer. Live integration can replace demo snapshots when a park feed is connected.</p></div>
            <div className="grid">
              {queueZones.map((z) => <article className="card span-3" key={z.zone}>
                <div className="muted">{z.zone}</div>
                <div className="kpi">{z.minutes} <small>min</small></div>
                <span className={`badge ${z.risk === 'High' ? 'badge-high' : z.risk === 'Medium' ? 'badge-med' : ''}`}>{z.risk} risk</span>
              </article>)}
            </div>
          </section>

          <section className="section">
            <div className="section-head"><div><span className="eyebrow">PARK ESSENTIALS</span><h2>Everything you may need.</h2></div></div>
            <div className="grid">
              {facilities.map(([name, category, description]) => <article className="card span-4" key={name}><div className="eyebrow"><MapPinned size={14}/> {category}</div><h3>{name}</h3><p className="muted">{description}</p></article>)}
            </div>
          </section>

          <section className="section">
            <div className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'25px',padding:'28px'}}>
              <div><div className="kicker">NEED HELP?</div><h2>We’ll help you keep moving.</h2><p className="muted">Lost & found, medical help, locker issues, food, ride problems and cleaning requests are handled through the guest service workflow.</p></div>
              <div className="actions"><Link href="/help" className="primary"><CircleHelp size={16}/> Get help <ArrowRight size={15}/></Link><Link href="/my-visit" className="secondary">My Visit</Link></div>
            </div>
          </section>
        </div>
      </main>
    </GuestShell>
  )
}
