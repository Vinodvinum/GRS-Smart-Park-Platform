import Link from "next/link";
import { ArrowRight, Headphones, LockKeyhole, Search, Stethoscope, Utensils, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GuestNav } from "@/components/GuestNav";
import { DemoBanner } from "@/components/DemoBanner";

const services: Array<[string, string, string, LucideIcon]> = [
  ["Lost & Found", "Report a lost item or found property.", "LOST_FOUND", Search],
  ["Medical Assistance", "Request help for a medical concern.", "MEDICAL", Stethoscope],
  ["Locker Issue", "Get help with a locker or changing room.", "LOCKER", LockKeyhole],
  ["Ride Issue", "Report an attraction or ride issue.", "RIDE", Waves],
  ["Food Complaint", "Tell us about a food service issue.", "FOOD", Utensils],
  ["General Help", "Ask the park team for assistance.", "GENERAL", Headphones],
];

export default function HelpPage() {
  return <><DemoBanner/><GuestNav/><main className="page"><div className="container">
    <div className="pageTitle"><div className="kicker">GUEST SUPPORT</div><h1>Need a hand?</h1><p>Choose what you need help with. Your request is saved to your visit and can be followed from My Visit.</p></div>
    <div className="helpGrid">{services.map(([name, desc, category, Icon])=><Link className="card helpCard" href={`/help/new?category=${category}`} key={category}><span className="quickIcon"><Icon size={19}/></span><b>{name}</b><p>{desc}</p><ArrowRight size={16}/></Link>)}</div>
    <div style={{marginTop:22}} className="card placeholder"><div><h2>Already raised a request?</h2><p>Open My Visit to see its current status and service timeline.</p><Link className="primary" href="/my-visit" style={{marginTop:16}}>Open My Visit <ArrowRight size={15}/></Link></div></div>
  </div></main></>;
}
