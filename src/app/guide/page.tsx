'use client'
import { useMemo, useState } from 'react'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import { GuestShell } from '@/components/GuestShell'
import { facilities } from '@/lib/guest-data'

export default function GuidePage() {
  const [query,setQuery]=useState('')
  const visible=useMemo(()=>facilities.filter(([name,cat,desc])=>`${name} ${cat} ${desc}`.toLowerCase().includes(query.toLowerCase().trim())),[query])
  return <GuestShell><main className="page"><div className="container">
    <div className="pageTitle"><div className="kicker">PARK GUIDE</div><h1>Everything you need, nearby.</h1><p>Find attractions, food and essential guest facilities quickly while you plan your day.</p></div>
    <div className="guideSearch card"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rides, food, lockers, medical aid..." aria-label="Search park guide"/></div>
    <div className="guideGrid"><div className="map"><div className="mapLabel"><MapPin size={13}/> GRS park map preview</div><span className="pin p1"/><span className="pin p2"/><span className="pin p3"/><span className="pin p4"/></div><div className="guideList card">{visible.map(([name,cat,desc],i)=><div className="guideItem" key={name}><div className={`guideThumb g${i%4}`}/><div><b>{name}</b><small>{cat}</small><p>{desc}</p></div><ArrowRight size={16}/></div>)}{visible.length===0&&<div className="empty"><b>No matching facility</b><p>Try searching for food, lockers, medical aid or rides.</p></div>}<button className="locate" type="button"><MapPin size={15}/> Find nearest facility</button></div></div>
  </div></main></GuestShell>
}
