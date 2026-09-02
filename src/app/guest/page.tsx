import Link from 'next/link'
import { queueZones } from '@/lib/demo-data'

export default function GuestPage() {
  return (
    <main>
      <div className="container">
        <nav className="nav"><div className="brand">🎢 GRS SMART PARK</div><Link className="pill" href="/">Home</Link></nav>
        <section className="section">
          <div className="eyebrow">Guest app</div>
          <h1 style={{fontSize:'52px'}}>Plan your visit</h1>
          <p className="lead">Choose your experience, get a digital pass, monitor wait pressure and request help when you need it.</p>
        </section>

        <section className="grid section">
          <div className="card span-6">
            <h2>Start a booking</h2>
            <p className="muted">Production flow will connect this UI to the Booking model, payment gateway and QR pass.</p>
            <div className="actions"><span className="btn btn-primary">Choose experience →</span></div>
          </div>
          <div className="card span-6">
            <h2>My digital pass</h2>
            <p className="muted">Booking: GRS-DEMO-2048</p>
            <p className="muted">Status: Confirmed · 2 Adults · 1 Child</p>
            <span className="badge">QR validation ready</span>
          </div>
        </section>

        <section className="section">
          <div className="section-title"><div><h2>Live queue pressure</h2><div className="muted">Demo data now; future source is the operations service.</div></div></div>
          <div className="grid">
            {queueZones.map((z) => <article className="card span-3" key={z.zone}>
              <div className="muted">{z.zone}</div>
              <div className="kpi">{z.minutes} min</div>
              <span className={`badge ${z.risk === 'High' ? 'badge-high' : z.risk === 'Medium' ? 'badge-med' : ''}`}>{z.risk} risk</span>
            </article>)}
          </div>
        </section>

        <section className="section">
          <div className="card">
            <h2>Need help?</h2>
            <p className="muted">Guest service workflow for lost & found, medical help, locker issues, food complaints, ride issues and cleaning.</p>
            <div className="actions">
              <span className="btn btn-primary">Create service request →</span>
              <span className="btn">View my requests</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
