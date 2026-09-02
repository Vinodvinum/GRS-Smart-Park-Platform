import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Headphones, QrCode } from "lucide-react";
import { GuestNav } from "@/components/GuestNav";
import { DemoBanner } from "@/components/DemoBanner";
import { listServiceRequests } from "@/lib/repositories/service-request";
import { requireUser } from "@/lib/auth-helpers";

export default async function MyVisit() {
  const user = await requireUser();
  const requests = await listServiceRequests(user.role === "GUEST" ? user.id : null);
  return <>
    <DemoBanner/><GuestNav/>
    <main className="page"><div className="container">
      <div className="pageTitle"><div className="kicker">MY VISIT</div><h1>Everything for your day.</h1><p>Your visit hub will eventually combine booking, pass, requests and feedback in one authenticated guest area.</p></div>
      <div className="quick" style={{paddingBottom:25}}>
        <Link className="card" href="/pass"><span className="quickIcon"><QrCode size={19}/></span><span><b>Digital Pass</b><small>Entry QR</small></span><ArrowRight size={15}/></Link>
        <Link className="card" href="/help"><span className="quickIcon"><Headphones size={19}/></span><span><b>Guest Help</b><small>Raise a request</small></span><ArrowRight size={15}/></Link>
        <Link className="card" href="/booking"><span className="quickIcon"><Clock3 size={19}/></span><span><b>Booking</b><small>Visit details</small></span><ArrowRight size={15}/></Link>
      </div>
      <section className="card" style={{padding:24}}>
        <div className="sectionHeader" style={{alignItems:"center"}}><div><div className="kicker">SERVICE REQUESTS</div><h2 style={{fontSize:20}}>Recent requests</h2></div><Link className="textLink" href="/help">New request <ArrowRight size={14}/></Link></div>
        {requests.map(r=><div className="queueRow" key={r.id}><CheckCircle2 size={16} color="#3155e7"/><div><b>#{r.requestCode} · {r.category.replace("_"," ")}</b><small>{r.location} · {r.description}</small></div><span className={`status ${r.status==="OPEN"?"medium":r.status==="RESOLVED"?"low":"high"}`}>{r.status.replace("_"," ")}</span></div>)}
      </section>
    </div></main>
  </>;
}
