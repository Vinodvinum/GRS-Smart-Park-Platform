 "use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { GuestNav } from "@/components/GuestNav";
import { DemoBanner } from "@/components/DemoBanner";

export default function NewRequestPage() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [category, setCategory] = useState("LOST_FOUND");
  const [location, setLocation] = useState("Wave Pool");
  const [description, setDescription] = useState("");

  async function submit() {
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ category, location, description, priority: category === "MEDICAL" ? "HIGH" : "MEDIUM" })
    });
    const json = await res.json();
    if (!res.ok) return;
    setSubmitted(json.data.requestCode);
  }

  if (submitted) {
    return <>
      <DemoBanner/><GuestNav/>
      <main className="page"><div className="container"><div className="card placeholder">
        <div><div className="placeholderIcon"><CheckCircle2 size={24}/></div><h2>Request created</h2>
        <p>Your demo request <b>#{submitted}</b> is now <b>Open</b>. In the operations phase, this will enter the staff assignment workflow.</p>
        <Link className="primary" href="/my-visit" style={{marginTop:16}}>View My Request <ArrowRight size={15}/></Link></div>
      </div></div></main>
    </>;
  }

  return <>
    <DemoBanner/><GuestNav/>
    <main className="page"><div className="container">
      <Link className="textLink" href="/help" style={{marginBottom:20}}><ArrowLeft size={14}/> Back to Help</Link>
      <div className="pageTitle"><div className="kicker">NEW SERVICE REQUEST</div><h1>How can we help?</h1><p>Give the team enough context to act quickly.</p></div>
      <div className="card" style={{maxWidth:650,padding:25}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#5d6879",marginBottom:15}}>Category
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{display:"block",width:"100%",marginTop:7,border:"1px solid #e5eaf1",borderRadius:11,padding:12}}>
            <option value="LOST_FOUND">Lost & Found</option><option value="MEDICAL">Medical Assistance</option><option value="LOCKER">Locker Issue</option><option value="RIDE">Ride Issue</option><option value="FOOD">Food Complaint</option><option value="GENERAL">General Help</option>
          </select>
        </label>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#5d6879",marginBottom:15}}>Location
          <select value={location} onChange={e=>setLocation(e.target.value)} style={{display:"block",width:"100%",marginTop:7,border:"1px solid #e5eaf1",borderRadius:11,padding:12}}>
            <option>Wave Pool</option><option>Aqua Racer</option><option>Kids Zone</option><option>Snow Park</option><option>Food Court</option><option>Locker Room</option><option>Entrance</option>
          </select>
        </label>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#5d6879",marginBottom:18}}>Description
          <textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={1000} placeholder="Tell the team what happened..." style={{display:"block",width:"100%",minHeight:130,marginTop:7,border:"1px solid #e5eaf1",borderRadius:11,padding:12,resize:"vertical"}}/>
        </label>
        <button className="primary" onClick={submit} disabled={!description.trim()}>Submit Request <ArrowRight size={15}/></button>
      </div>
    </div></main>
  </>;
}
