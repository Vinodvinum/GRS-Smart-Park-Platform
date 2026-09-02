"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, ShieldAlert, Clock3, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/Brand";

const items = [
  ["INC-1007", "Attraction equipment check", "Aqua Racer", "HIGH", "IN_PROGRESS", "Ravi S."],
  ["INC-1006", "Guest assistance escalation", "Wave Pool", "MEDIUM", "OPEN", "Unassigned"],
  ["INC-1005", "Cleaning response", "Family Zone", "LOW", "RESOLVED", "Anil K."],
];

export default function Incidents() {
  return (
    <div className="opsShell">
      <header className="opsTop">
        <Brand dark />
        <Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link>
      </header>
      <main className="container opsContent">
        <div className="opsHeader">
          <div>
            <div className="kicker">INCIDENT CONTROL</div>
            <h1>See it. Assign it. Resolve it.</h1>
            <p>Incident lifecycle and accountability · Demo data</p>
          </div>
          <Link href="/staff" className="misButton">Staff Directory <ArrowRight size={14}/></Link>
        </div>
        <div className="statGrid">
          <div className="stat"><span><AlertTriangle size={15}/> Open</span><strong>2</strong><small>Needs attention</small></div>
          <div className="stat"><span><ShieldAlert size={15}/> High priority</span><strong>1</strong><small className="riskText">Aqua Racer</small></div>
          <div className="stat"><span><Clock3 size={15}/> In progress</span><strong>1</strong><small>Assigned</small></div>
          <div className="stat"><span><CheckCircle2 size={15}/> Resolved</span><strong>1</strong><small className="good">Today</small></div>
        </div>
        <section className="opsPanel" style={{ marginTop: 14 }}>
          <div className="panelTitle">
            <div><div className="kicker">INCIDENT QUEUE</div><h3>Active & recent</h3></div>
          </div>
          {items.map(x => (
            <div className="incidentRow" key={x[0]}>
              <span className={"severityDot " + x[3].toLowerCase()}></span>
              <span className="incidentMain"><b>#{x[0]} · {x[1]}</b><small>{x[2]} · {x[5]}</small></span>
              <span className={"status " + (x[3] === "HIGH" ? "high" : x[3] === "MEDIUM" ? "medium" : "low")}>{x[3]}</span>
              <span className={"status " + (x[4] === "RESOLVED" ? "low" : "medium")}>{x[4].replace("_", " ")}</span>
            </div>
          ))}
        </section>
        <section className="opsPanel" style={{ marginTop: 14 }}>
          <div className="kicker">LIFECYCLE</div>
          <h3>Accountability trail</h3>
          <div className="lifecycle">
            <span>OPEN</span><i></i><span>ASSIGNED</span><i></i><span>IN PROGRESS</span><i></i>
            <span>MITIGATED</span><i></i><span>RESOLVED</span><i></i><span>CLOSED</span>
          </div>
        </section>
      </main>
    </div>
  );
}
