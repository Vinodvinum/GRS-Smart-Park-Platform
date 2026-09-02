import { ArrowRight, MapPin, Search } from 'lucide-react'
import { GuestShell } from '@/components/GuestShell'
import { facilities } from '@/lib/guest-data'

export default function GuidePage() {
  return <GuestShell><main className="page"><div className="container">
    <div className="pageTitle"><div className="kicker">PARK GUIDE</div><h1>Everything you need, nearby.</h1><p>Find attractions, food and essential guest facilities without wandering around. Location-aware navigation will be connected later.</p></div>
    <div className="guideSearch card"><Search size={18}/><input placeholder="Search rides, food, lockers, medical aid..." aria-label="Search park guide"/></div>
    <div className="guideGrid"><div className="map"><div className="mapLabel"><MapPin size={13}/> Park map preview · demo</div><span className="pin p1"/><span className="pin p2"/><span className="pin p3"/><span className="pin p4"/></div><div className="guideList card">{facilities.map(([name,cat,desc],i)=><div className="guideItem" key={name}><div className={`guideThumb g${i}`}/><div><b>{name}</b><small>{cat}</small><p>{desc}</p></div><ArrowRight size={16}/></div>)}<button className="locate"><MapPin size={15}/> Find nearest facility</button></div></div>
  </div></main></GuestShell>
}
