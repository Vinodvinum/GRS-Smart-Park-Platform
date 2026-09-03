"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, AlertTriangle, ShieldAlert, Clock3, CheckCircle2, RefreshCw } from "lucide-react";
import { Brand } from "@/components/Brand";

type Incident = { id: string; incidentCode: string; description: string; location: string | null; status: string; assignedTo: string | null; createdAt: string; resolvedAt: string | null };

export default function Incidents() {
  const [items, setItems] = useState<Incident[]>([]);
  const [staffName, setStaffName] = useState("Supervisor");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setError("");
    const [incidentsResponse, sessionResponse] = await Promise.all([
      fetch("/api/incidents", { cache: "no-store" }),
      fetch("/api/auth/session", { cache: "no-store" }),
    ]);
    if (!incidentsResponse.ok) throw new Error("Unable to load incidents");
    const json = await incidentsResponse.json();
    setItems(json.data ?? []);
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      if (session?.user?.name) setStaffName(session.user.name);
    }
  }

  useEffect(() => { load().catch(() => setError("Incident data could not be loaded.")); }, []);

  async function update(code: string, status: string) {
    setBusy(code);
    setError("");
    try {
      const endpoint = status === "ASSIGNED" ? "/api/incidents/assign" : "/api/incidents/status";
      const body = status === "ASSIGNED" ? { incidentCode: code, staffName } : { incidentCode: code, status };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Update failed");
      await load();
      setNotice(`#${code} updated to ${status.replace("_", " ")}.`);
      setTimeout(() => setNotice(""), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Incident update failed.");
    } finally { setBusy(""); }
  }

  const open = items.filter(i => i.status === "OPEN").length;
  const high = items.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const progress = items.filter(i => i.status === "IN_PROGRESS").length;
  const resolved = items.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length;

  return <div className="opsShell">
    <header className="opsTop"><Brand dark/><Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link></header>
    <main className="container opsContent">
      <div className="opsHeader">
        <div><div className="kicker">INCIDENT CONTROL</div><h1>See it. Assign it. Resolve it.</h1><p>Incident lifecycle and accountability · Database-backed</p></div>
        <button className="misButton" onClick={() => load().catch(() => setError("Refresh failed."))}><RefreshCw size={14}/> Refresh</button>
      </div>
      {error && <div className="formError" role="alert">{error}</div>}
      <div className="statGrid">
        <div className="stat"><span><AlertTriangle size={15}/> Open</span><strong>{open}</strong><small>Needs attention</small></div>
        <div className="stat"><span><ShieldAlert size={15}/> Active</span><strong>{high}</strong><small>Requires response</small></div>
        <div className="stat"><span><Clock3 size={15}/> In progress</span><strong>{progress}</strong><small>Assigned work</small></div>
        <div className="stat"><span><CheckCircle2 size={15}/> Resolved</span><strong>{resolved}</strong><small className="good">Completed</small></div>
      </div>
      <section className="opsPanel" style={{ marginTop: 14 }}>
        <div className="panelTitle"><div><div className="kicker">INCIDENT QUEUE</div><h3>Active & recent</h3></div><span>{items.length} records</span></div>
        {items.length === 0 && <div className="emptyState">No incidents are currently recorded.</div>}
        {items.map((x) => <div className="incidentRow" key={x.id}>
          <span className={"severityDot " + (x.status === "OPEN" ? "medium" : x.status === "IN_PROGRESS" ? "high" : "low")}></span>
          <span className="incidentMain"><b>#{x.incidentCode} · {x.description}</b><small>{x.location || "Location not provided"} · {x.assignedTo || "Unassigned"}</small></span>
          <span className={"status " + (x.status === "RESOLVED" || x.status === "CLOSED" ? "low" : x.status === "IN_PROGRESS" ? "medium" : "high")}>{x.status.replace("_", " ")}</span>
          {x.status === "OPEN" && <button className="miniButton" disabled={busy === x.incidentCode} onClick={() => update(x.incidentCode, "ASSIGNED")}>{busy === x.incidentCode ? "…" : "Assign to me"}</button>}
          {x.status === "ASSIGNED" && <button className="miniButton" disabled={busy === x.incidentCode} onClick={() => update(x.incidentCode, "IN_PROGRESS")}>Start</button>}
          {x.status === "IN_PROGRESS" && <button className="miniButton" disabled={busy === x.incidentCode} onClick={() => update(x.incidentCode, "RESOLVED")}>Resolve</button>}
        </div>)}
      </section>
      <section className="opsPanel" style={{ marginTop: 14 }}><div className="kicker">LIFECYCLE</div><h3>Accountability trail</h3><div className="lifecycle"><span>OPEN</span><i></i><span>ASSIGNED</span><i></i><span>IN PROGRESS</span><i></i><span>RESOLVED</span><i></i><span>CLOSED</span></div></section>
    </main>
    {notice && <div className="opsToast"><CheckCircle2 size={16}/>{notice}</div>}
  </div>;
}
