'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, CreditCard, Loader2, Minus, Plus, ShieldCheck, Ticket } from 'lucide-react'

type Experience = { id:string; name:string; shortName?:string|null; description:string }

type CreatedBooking = { booking:{ id:string; bookingCode:string; visitDate:string; amount:string }; passToken:string; qrValue:string }

export function BookingClient() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [experienceId, setExperienceId] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(1)
  const [offerCode, setOfferCode] = useState('')
  const [step, setStep] = useState<'details'|'review'|'success'>('details')
  const [booking, setBooking] = useState<CreatedBooking|null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingExperiences, setLoadingExperiences] = useState(true)
  const [error, setError] = useState('')

  const selected = experiences.find(x => x.id === experienceId)
  const amount = useMemo(() => Math.max(0, adults * 799 + children * 499), [adults, children])

  useEffect(() => {
    const tomorrow = new Date(Date.now() + 86400000)
    setVisitDate(tomorrow.toISOString().slice(0,10))
    fetch('/api/experiences')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Could not load experiences')))
      .then(data => { const list: Experience[] = data?.data ?? []; setExperiences(list); if (list[0]) setExperienceId(list[0].id) })
      .catch(() => setError('Could not load the experience catalogue. Start the database and seed it first.'))
      .finally(() => setLoadingExperiences(false))
  }, [])

  function review() {
    setError('')
    if (!experienceId || !visitDate) return setError('Choose an experience and visit date.')
    setStep('review')
  }

  async function confirmBooking() {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        experienceId, visitDate: new Date(`${visitDate}T10:30:00`).toISOString(), adults, children, offerCode: offerCode || undefined
      })})
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Booking failed')
      localStorage.setItem('grs:lastBooking', JSON.stringify(data))
      setBooking(data); setStep('success')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create booking.') }
    finally { setLoading(false) }
  }

  return <main className="page bookingPage"><div className="container">
    <div className="bookingTop"><Link href="/experiences" className="backLink"><ArrowLeft size={15}/> Back to experiences</Link><div className="bookingSteps"><span className={step==='details'?'active':''}>1 Details</span><i/><span className={step==='review'?'active':''}>2 Review</span><i/><span className={step==='success'?'active':''}>3 Pass</span></div></div>
    {step !== 'success' ? <div className="bookingLayout">
      <section className="card bookingForm">
        <div className="kicker">BOOK YOUR VISIT</div><h1>{step==='details'?'Reserve your day.':'Review your booking.'}</h1><p className="bookingIntro">{step==='details'?'A simple, transparent booking flow. Payment is simulated until a real provider is approved.':'Check your visit details before creating the booking.'}</p>
        {error && <div className="formError" role="alert">{error}</div>}
        {step==='details' ? <>
          <label>Experience<select disabled={loadingExperiences} value={experienceId} onChange={e=>setExperienceId(e.target.value)}>{loadingExperiences?<option>Loading…</option>:experiences.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
          <label>Visit date<div className="dateInput"><CalendarDays size={16}/><input type="date" value={visitDate} min={new Date().toISOString().slice(0,10)} onChange={e=>setVisitDate(e.target.value)}/></div></label>
          <div className="guestCounters"><Counter label="Adults" value={adults} min={1} max={20} onChange={setAdults}/><Counter label="Children" value={children} min={0} max={20} onChange={setChildren}/></div>
          <label>Offer code <span className="optional">optional</span><input className="textInput" value={offerCode} onChange={e=>setOfferCode(e.target.value.toUpperCase())} placeholder="e.g. DEMO-FAMILY" /></label>
          <button className="primary fullButton" onClick={review}>Review booking <ArrowRight size={15}/></button>
        </> : <>
          <div className="reviewBox"><div><span>EXPERIENCE</span><b>{selected?.name}</b></div><div><span>VISIT DATE</span><b>{new Date(`${visitDate}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</b></div><div><span>GUESTS</span><b>{adults} Adults · {children} Children</b></div><div><span>PAYMENT</span><b>Demo payment</b></div></div>
          <div className="paymentMock"><CreditCard size={20}/><div><b>Demo payment method</b><small>No real payment is processed in this portfolio build.</small></div><CheckCircle2 size={18}/></div>
          <div className="reviewActions"><button className="secondary darkSecondary" onClick={()=>setStep('details')} disabled={loading}>Edit details</button><button className="primary" onClick={confirmBooking} disabled={loading}>{loading?<><Loader2 size={15} className="spin"/> Creating…</>:<>Confirm booking <ArrowRight size={15}/></>}</button></div>
        </>}
      </section>
      <aside className="card bookingSummary"><div className="kicker">ORDER SUMMARY</div><h2>{selected?.shortName || selected?.name || 'Your experience'}</h2><div className="summaryLine"><span>Adults × {adults}</span><b>₹{(adults*799).toLocaleString('en-IN')}</b></div><div className="summaryLine"><span>Children × {children}</span><b>₹{(children*499).toLocaleString('en-IN')}</b></div><div className="summaryTotal"><span>Total</span><strong>₹{amount.toLocaleString('en-IN')}</strong></div><div className="secureNote"><ShieldCheck size={16}/><span><b>Secure booking flow</b><small>Booking and pass records are stored transactionally in PostgreSQL.</small></span></div></aside>
    </div> : <Success booking={booking}/>} 
  </div></main>
}

function Counter({label,value,min,max,onChange}:{label:string,value:number,min:number,max:number,onChange:(v:number)=>void}) {
 return <div className="counter"><span>{label}</span><div><button aria-label={`Decrease ${label}`} disabled={value<=min} onClick={()=>onChange(value-1)}><Minus size={14}/></button><strong>{value}</strong><button aria-label={`Increase ${label}`} disabled={value>=max} onClick={()=>onChange(value+1)}><Plus size={14}/></button></div></div>
}

function Success({booking}:{booking:CreatedBooking|null}) {
 if (!booking) return null
 return <section className="successCard card"><div className="successIcon"><CheckCircle2 size={28}/></div><div className="kicker">BOOKING CONFIRMED</div><h1>You&apos;re all set.</h1><p>Booking <b>{booking.booking.bookingCode}</b> has been created. Your digital pass is ready.</p><div className="successMeta"><div><span>VISIT DATE</span><b>{new Date(booking.booking.visitDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</b></div><div><span>AMOUNT</span><b>₹{Number(booking.booking.amount).toLocaleString('en-IN')}</b></div></div><div className="successActions"><Link href="/pass" className="primary">Open Digital Pass <Ticket size={16}/></Link><Link href="/" className="secondary darkSecondary">Back home</Link></div><small className="successFoot">Your pass token is kept in this browser for the demo. Server-side validation is the source of truth.</small></section>
}
