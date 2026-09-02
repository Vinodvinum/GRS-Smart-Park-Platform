 "use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2,
  ClipboardList, QrCode, RefreshCw, ScanLine, ShieldAlert,
  Ticket, Users, Waves, XCircle
} from "lucide-react";
import { Brand } from "@/components/Brand";

const attractions = [
  ["Aqua Racer", "Water Zone", "91%", "47 min", "BUSY"],
  ["Wave Pool", "Water Zone", "72%", "18 min", "OPEN"],
  ["Kids Zone", "Family Zone", "61%", "12 min", "OPEN"],
  ["Snow Park", "Snow Zone", "68%", "20 min", "OPEN"],
  ["Lazy River", "Water Zone", "55%", "9 min", "OPEN"],
];

const initialRequests = [
  ["GRS10452", "Lost & Found", "Wave Pool", "MEDIUM", "OPEN", "Unassigned"],
  ["GRS10451", "Locker Issue", "Locker Room", "HIGH", "ASSIGNED", "Anil K."],
  ["GRS10450", "Ride Issue", "Aqua Racer", "CRITICAL", "IN_PROGRESS", "Ravi S."],
];

export default function OperationsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const qrTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);

  const closeQR = useCallback(() => {
    setQrOpen(false);
    setQrResult(null);
    setQrValue("");
    qrTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!qrOpen) return;
    modalCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQR();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [qrOpen, closeQR]);


  async function assign(code: string) {
    const response = await fetch("/api/operations/requests/assign", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ requestCode: code, staffName: "Operations Team" })
    });
    if (!response.ok) return;
    setRequests(prev => prev.map(r => r[0] === code ? [r[0],r[1],r[2],r[3],"ASSIGNED","Operations Team"] : r));
    setNotice(`Request #${code} assigned to Operations Team.`);
    setTimeout(() => setNotice(""), 2400);
  }

  async function validateQR() {
    const response = await fetch("/api/operations/qr/validate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ token: qrValue })
    });
    const json = await response.json();
    setQrResult(json.data?.valid ? "VALID_PASS" : "INVALID_PASS");
  }

  return (
    <div className="opsShell">
      <header className="opsTop">
        <Brand dark />
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Link href="/" className="opsBack"><ArrowLeft size={13}/> Guest View</Link>
          <button className="opsBack" onClick={() => setQrOpen(true)} ref={qrTriggerRef}><ScanLine size={13}/> QR Validate</button>
        </div>
      </header>

      <main className="container opsContent">
        <div className="opsHeader">
          <div>
            <div className="kicker">LIVE OPERATIONS</div>
            <h1>Good morning, Operations.</h1>
            <p>31 August 2026 · Portfolio demo environment · Simulated data</p>
          </div>
          <button className="misButton" onClick={() => setNotice("Operational snapshot refreshed.")}><RefreshCw size={14}/> Refresh</button>
        </div>

        <div className="statGrid">
          <Stat icon={<Users size={15}/>} label="Today's Visitors" value="6,842" detail="+12.9% vs yesterday" good />
          <Stat icon={<ClipboardList size={15}/>} label="Active Requests" value="23" detail="5 urgent" />
          <Stat icon={<ShieldAlert size={15}/>} label="Open Incidents" value="7" detail="2 critical" />
          <Stat icon={<Activity size={15}/>} label="Queue Risk" value="HIGH" detail="Aqua Racer" risk />
        </div>

        <div className="opsPanels">
          <section className="opsPanel">
            <div className="panelTitle"><div><div className="kicker">ATTRACTIONS</div><h3>Capacity & queue</h3></div><button>All zones</button></div>
            <div className="tableHead"><span>Attraction</span><span>Capacity</span><span>Queue</span><span>Status</span></div>
            {attractions.map(([name,zone,cap,queue,status]) => (
              <div className="zoneRow" key={name}>
                <b>{name}<small>{zone}</small></b><span>{cap}</span><span>{queue}</span>
                <span className={`status ${status === "OPEN" ? "low" : "high"}`}>{status}</span>
              </div>
            ))}
          </section>

          <section className="opsPanel">
            <div className="panelTitle"><div><div className="kicker">SERVICE QUEUE</div><h3>Needs attention</h3></div><Link href="/help">Guest view</Link></div>
            {requests.map(([code,category,location,priority,,assigned]) => (
              <div className="opRequest" key={code}>
                <div className="avatar">{category[0]}</div>
                <div className="opRequestMain">
                  <b>#{code} · {category}</b>
                  <small>{location} · {assigned}</small>
                </div>
                <span className={`status ${priority === "CRITICAL" ? "high" : priority === "HIGH" ? "medium" : "low"}`}>{priority}</span>
                {assigned === "Unassigned" && <button className="miniButton" onClick={() => assign(code)}>Assign</button>}
              </div>
            ))}
          </section>
        </div>

        <section className="opsPanel operationsTools">
          <div className="panelTitle"><div><div className="kicker">OPERATIONS TOOLS</div><h3>Fast actions</h3></div></div>
          <div className="toolGrid">
            <Tool icon={<QrCode/>} title="Validate QR" text="Check a guest digital pass." onClick={() => setQrOpen(true)} />
            <Tool icon={<Ticket/>} title="Bookings" text="Review today’s booking queue." onClick={() => setNotice("Booking management arrives in the next operations increment.")}/>
            <Tool icon={<Waves/>} title="Queue Control" text="Manage attraction status and capacity." onClick={() => setNotice("Queue control is connected to the operations domain foundation.")}/>
            <Tool icon={<AlertTriangle/>} title="Incidents" text="Open the incident workflow." onClick={() => setNotice("Incident management is the next staff workflow phase.")}/>
          </div>
        </section>

        <section className="misCallout">
          <div style={{display:"flex",gap:13,alignItems:"center"}}>
            <BarChart3 size={22}/>
            <div><div className="kicker">INTELLIGENCE LAYER</div><h3>GRS Smart MIS Dashboard</h3><p>Your Python/Streamlit analytics system remains the management intelligence layer.</p></div>
          </div>
          <Link href="/" className="misButton">Integration Point <ArrowRight size={14}/></Link>
        </section>
      </main>

      {notice && <div className="opsToast"><CheckCircle2 size={16}/>{notice}</div>}

      {qrOpen && (
        <div className="modalBack" onMouseDown={(e) => { if (e.target === e.currentTarget) closeQR(); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title">
            <button className="close" aria-label="Close" onClick={closeQR} ref={modalCloseRef}><XCircle size={18}/></button>
            <div className="kicker">STAFF QR VALIDATION</div>
            <h2 id="qr-dialog-title">Validate digital pass</h2>
            <p style={{color:"#667286",fontSize:11,lineHeight:1.5}}>Paste a pass token from a confirmed booking (copy it from the digital pass page). For this demo, first create a booking to get a token.</p>
            <label style={{display:"block",fontSize:11,fontWeight:700,marginTop:20}} htmlFor="qr-token-input">QR token
              <input id="qr-token-input" value={qrValue} onChange={e=>setQrValue(e.target.value)} placeholder="Enter demo QR token" style={{display:"block",width:"100%",marginTop:7,padding:12,border:"1px solid #e5eaf1",borderRadius:10}}/>
            </label>
            <button className="primary" onClick={validateQR} disabled={!qrValue.trim()}>Validate <CheckCircle2 size={15}/></button>
            {qrResult && <div role="status" style={{marginTop:15,padding:14,borderRadius:12,background:qrResult==="VALID_PASS"?"#e9f7f1":"#ffe8e8",color:qrResult==="VALID_PASS"?"#198a62":"#bf3c46",fontSize:12,fontWeight:800}}>{qrResult==="VALID_PASS"?"✓ Valid pass — demo accepted":"✕ Invalid pass"}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({icon,label,value,detail,good,risk}:{icon:React.ReactNode;label:string;value:string;detail:string;good?:boolean;risk?:boolean}) {
  return <div className="stat"><span style={{display:"flex",gap:7,alignItems:"center"}}>{icon}{label}</span><strong>{value}</strong><small className={good?"good":risk?"riskText":""}>{detail}</small></div>
}
function Tool({icon,title,text,onClick}:{icon:React.ReactNode;title:string;text:string;onClick:()=>void}) {
  return <button className="tool" onClick={onClick}><span className="toolIcon">{icon}</span><span><b>{title}</b><small>{text}</small></span><ArrowRight size={15}/></button>
}
