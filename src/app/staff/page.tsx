"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleUserRound, ShieldCheck, Users, UserCheck, RefreshCw } from "lucide-react";
import { Brand } from "@/components/Brand";

type StaffMember = { name: string; role: string; zone: string };
type StaffSnapshot = { staff: StaffMember[]; onDuty: number; available: number; open: number; critical: number };

export default function Staff() {
  const [snapshot, setSnapshot] = useState<StaffSnapshot | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const response = await fetch("/api/staff/snapshot", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load staff snapshot");
    const json = await response.json();
    setSnapshot(json.data);
  }

  useEffect(() => { load().catch(() => setError("Staff data could not be loaded.")); }, []);

  return (
    <div className="opsShell">
      <header className="opsTop">
        <Brand dark />
        <Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link>
      </header>
      <main className="container opsContent">
        <div className="opsHeader">
          <div>
            <div className="kicker">STAFF MANAGEMENT</div>
            <h1>People on the floor.</h1>
            <p>Active staff and operational coverage · Database-backed</p>
          </div>
          <button className="misButton" onClick={() => load().catch(() => setError("Refresh failed."))}><RefreshCw size={14}/> Refresh</button>
        </div>
        {error && <div className="formError" role="alert">{error}</div>}
        <div className="statGrid">
          <div className="stat"><span><Users size={15}/> On duty</span><strong>{snapshot?.onDuty ?? "—"}</strong><small className="good">Active staff</small></div>
          <div className="stat"><span><UserCheck size={15}/> Available</span><strong>{snapshot?.available ?? "—"}</strong><small>Current directory capacity</small></div>
          <div className="stat"><span><ShieldCheck size={15}/> Supervisors</span><strong>{snapshot ? snapshot.staff.filter(s => s.role === "SUPERVISOR").length : "—"}</strong><small>Supervisor role</small></div>
          <div className="stat"><span>Open requests</span><strong>{snapshot?.open ?? "—"}</strong><small>{snapshot?.critical ?? 0} critical</small></div>
        </div>
        <section className="opsPanel" style={{ marginTop: 14 }}>
          <div className="kicker">DIRECTORY</div>
          <h3>Active staff</h3>
          {snapshot?.staff.length === 0 && <div className="emptyState">No active staff accounts are configured.</div>}
          <div className="staffGrid">
            {snapshot?.staff.map((s) => (
              <div className="staffCard" key={`${s.name}-${s.role}`}>
                <div className="avatar large"><CircleUserRound size={20}/></div>
                <div><b>{s.name}</b><small>{s.role} · {s.zone}</small></div>
                <span className="status low">ON DUTY</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
