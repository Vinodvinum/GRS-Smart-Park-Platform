 "use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, CalendarDays, ChartNoAxesCombined, Database, Gauge, RefreshCw, Sparkles, TriangleAlert, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/Brand";

const metrics=[
  ["Visitors","6,842","+12.9%","today",UsersIcon],
  ["Revenue","₹12.85L","+8.4%","today",TrendingUp],
  ["Bookings","2,146","+10.2%","today",CalendarDays],
  ["Avg. Queue","21 min","1 high-risk","today",Gauge],
];
const insights=[
  ["Queue pressure","Aqua Racer is the current high-risk attraction.","HIGH","Capacity 91% · 47 min queue"],
  ["Guest service","91.4% of service requests are resolved.","GOOD","23 active requests · monitor SLA"],
  ["Demand signal","Visitors are 12.9% above the comparison period.","POSITIVE","Use forecast adapter for next-day planning"],
];

export default function Intelligence(){
 const [notice,setNotice]=useState("");
 return <div className="opsShell">
  <header className="opsTop"><Brand dark/><div style={{display:"flex",gap:8}}><Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link><Link href="/admin" className="opsBack">Admin</Link></div></header>
  <main className="container opsContent">
   <div className="opsHeader"><div><div className="kicker">MIS + INTELLIGENCE</div><h1>Turn park activity into decisions.</h1><p>Analytics contract + intelligence workspace · Portfolio demo</p></div><button className="misButton" onClick={()=>setNotice("Analytics snapshot refreshed.")}><RefreshCw size={14}/> Refresh</button></div>
   <div className="statGrid">{metrics.map(([a,b,c,d,I])=>{const Icon=I as typeof TrendingUp;return <div className="stat" key={String(a)}><span><Icon size={15}/>{String(a)}</span><strong>{String(b)}</strong><small className={String(c).startsWith("+")?"good":""}>{String(c)} · {String(d)}</small></div>})}</div>
   <div className="intelGrid">
    <section className="opsPanel"><div className="panelTitle"><div><div className="kicker">DECISION SIGNALS</div><h3>What needs attention?</h3></div><BrainCircuit size={18}/></div>{insights.map((x)=><div className="insight" key={x[0]}><div className={"insightIcon "+(x[2]==="HIGH"?"warn":"")} >{x[2]==="HIGH"?<TriangleAlert size={16}/>:<Sparkles size={16}/>}</div><div><b>{x[0]}</b><p>{x[1]}</p><small>{x[3]}</small></div></div>)}</section>
    <section className="opsPanel"><div className="panelTitle"><div><div className="kicker">DATA FLOW</div><h3>Platform → MIS</h3></div><Database size={18}/></div><div className="dataFlow"><Flow label="Guest + Booking" /><Flow label="Operations" /><Flow label="Service + Incidents" /><div className="flowArrow">↓</div><Flow label="Analytics Contract" active/><div className="flowArrow">↓</div><Flow label="GRS Smart MIS Dashboard" intelligence/></div></section>
   </div>
   <section className="opsPanel" style={{marginTop:14}}><div className="panelTitle"><div><div className="kicker">ANALYTICS CONTRACT</div><h3>Production integration boundary</h3></div><span className="status low">v1.0</span></div><div className="contractGrid"><div><small>Dimensions</small><b>Date · Experience · Attraction · Zone · Offer</b></div><div><small>Measures</small><b>Visitors · Revenue · Bookings · Queue · Requests · Incidents</b></div><div><small>Destination</small><b>Python / Streamlit GRS Smart MIS</b></div></div></section>
   <div className="misCallout"><div style={{display:"flex",gap:13,alignItems:"center"}}><ChartNoAxesCombined size={22}/><div><div className="kicker">YOUR EXISTING PROJECT</div><h3>GRS Smart MIS Dashboard</h3><p>The existing analytics project becomes the intelligence layer rather than a separate disconnected portfolio piece.</p></div></div><a className="misButton" href="https://grsdashboard.streamlit.app/" target="_blank" rel="noreferrer">Open MIS <ArrowRight size={14}/></a></div>
  </main>
  {notice&&<div className="opsToast"><RefreshCw size={15}/>{notice}</div>}
 </div>
}
function Flow({label,active,intelligence}:{label:string;active?:boolean;intelligence?:boolean}){return <div className={"flowBox "+(active?"active ":"")+(intelligence?"intelligence":"")}><span>{label}</span></div>}
function UsersIcon(){return <span style={{fontSize:12}}>◉</span>}
