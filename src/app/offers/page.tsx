import Link from 'next/link'
import { ArrowRight, BadgePercent, CalendarDays, Users } from 'lucide-react'
import { GuestShell } from '@/components/GuestShell'

const offers = [
  ['Family Fun','A simple family package concept for a full park day.','Adults + children','Flexible visit date'],
  ['Group & Student','A group-oriented offer structure for schools and organized visits.','Group pricing','Advance planning'],
  ['Corporate Day','A package concept for corporate outings and team experiences.','Group experience','Managed planning'],
]
export default function OffersPage(){return <GuestShell><main className="page"><div className="container"><div className="pageTitle"><div className="kicker">OFFERS</div><h1>Find a package that fits the day.</h1><p>Offer cards are intentionally product-facing in ZIP 02. Eligibility, pricing and inventory become database-backed in the booking phase.</p></div><div className="offerGrid">{offers.map(([name,desc,one,two])=><article className="card offerCard" key={name}><div className="offerIcon"><BadgePercent size={21}/></div><div className="kicker">GRS SMART OFFER</div><h2>{name}</h2><p>{desc}</p><div className="offerMeta"><span><Users size={14}/>{one}</span><span><CalendarDays size={14}/>{two}</span></div><Link href="/plan" className="textLink">Plan around this <ArrowRight size={15}/></Link></article>)}</div></div></main></GuestShell>}
