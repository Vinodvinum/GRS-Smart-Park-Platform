import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, MapPin, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { GuestShell } from '@/components/GuestShell'
import { guestExperiences } from '@/lib/guest-data'

export function generateStaticParams() { return guestExperiences.map(x => ({ id:x.id })) }

export default async function ExperienceDetail({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const item = guestExperiences.find(x => x.id === id)
  if (!item) notFound()
  return <GuestShell><main className="page detailPage"><div className="container">
    <Link href="/experiences" className="backLink"><ArrowLeft size={15}/> All experiences</Link>
    <div className="detailHero card"><div className="detailImage" style={{backgroundImage:`url(${item.image})`}}/><div className="detailCopy"><div className="kicker">{item.category}</div><h1>{item.name}</h1><p>{item.description}</p><div className="detailMeta"><span><Clock3 size={15}/> Full-day friendly</span><span><MapPin size={15}/> GRS park</span><span><CheckCircle2 size={15}/> Guest favourite</span></div><div className="actions"><Link href="/plan" className="primary">Plan around this <ArrowRight size={15}/></Link><Link href="/booking" className="secondary darkSecondary">Book tickets</Link></div></div></div>
    <div className="detailGrid"><section className="card detailSection"><div className="kicker">WHY THIS EXPERIENCE</div><h2>Designed around a better visit.</h2><p>The final product will use real attraction records, operating hours, capacity and ticket rules. For now, this is a clear product-facing catalogue experience.</p><div className="detailBullets"><div><Sparkles size={16}/><span><b>Discover</b><small>See what the experience is best suited for.</small></span></div><div><Clock3 size={16}/><span><b>Plan</b><small>Use timing and queue information to choose your window.</small></span></div><div><CheckCircle2 size={16}/><span><b>Book</b><small>Continue into the booking workflow when available.</small></span></div></div></section><aside className="card detailAside"><div className="kicker">NEXT STEP</div><h3>Build your visit around {item.name}.</h3><p>Use the planner to combine experiences, food and a comfortable schedule.</p><Link href="/plan" className="textLink">Open planner <ArrowRight size={15}/></Link></aside></div>
  </div></main></GuestShell>
}
