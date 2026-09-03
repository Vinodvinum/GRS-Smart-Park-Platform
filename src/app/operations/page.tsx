"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2,
  ClipboardList, QrCode, RefreshCw, ScanLine, ShieldAlert,
  Ticket, Users, Waves, XCircle
} from "lucide-react";
import { Brand } from "@/components/Brand";

type Attraction = { id: string; name: string; zone: string; capacity: number; queueMinutes: number; status: string };
type Request = { id: string; requestCode: string; category: string; location: string; priority: string; status: string; assignedTo: string | null; ageMinutes: number };
type Snapshot = { visitorsToday: number; visitorsChange: number; activeRequests: number; urgentRequests: number; openIncidents: number; queueRisk: string; attractions: Attraction[]; requests: Request[] };

export default function OperationsPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const qrTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);

  const loadSnapshot = useCallback(async () => {
    const response = await fetch("/api/operations/snapshot", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load operations snapshot");
    const json = await response.json();
    setSnapshot(json.data);
  }, []);

  useEffect(() => { loadSnapshot().catch(() => setNotice("Operations data could not be loaded.")); }, [loadSnapshot]);

  const closeQR = useCallback(() => { setQrOpen(false); setQrResult(null); setQrValue(""); qrTriggerRef.current?.focus(); }, []);
  useEffect(() => {
    if (!qrOpen) return;
    modalCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeQR(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [qrOpen, closeQR]);

  async function assign(code: string) {
    const response = await fetch("/api/operations/requests/assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestCode: code, staffName: "Operations Team" }) });
    if (!response.ok) { setNotice("The request could not be assigned."); return; }
    await loadSnapshot();
    setNotice(`Request #${code} assigned to Operations Team.`);
    setTimeout(() => setNotice(""), 2400);
  }

  async function validateQR() {
    const response = await fetch("/api/operations/qr/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: qrValue }) });
    const json = await response.json();
    setQrResult(json.data?.valid ? "VALID_PASS" : "INVALID_PASS");
  }

  const attractions = snapshot?.attractions ?? [];
  const requests = snapshot?.requests ?? [];
  const queueRisk = snapshot?.queueRisk ?? "—";

  return <div className="opsShell">
    <header className="opsTop"><Brand dark /><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Link href="/" className="opsBack"><ArrowLeft size={13}/> Guest View</Link><button className="opsBack" onClick={() => setQrOpen(true)} ref={qrTriggerRef}><ScanLine size={13}/> QR Validate</button></div></header>
    <main className="container opsContent">
      <div className="opsHeader"><div><div className="kicker">LIVE OPERATIONS</div><h1>Good morning, Operations.</h1><p>Operational workspace · Database-backed snapshot</p></div><button className="misButton" onClick={() => loadSnapshot().then(() => setNotice("Operational snapshot refreshed.")).catch(() => setNotice("Refresh failed."))}><RefreshCw size={14}/> Refresh</button></div>
      <div className="statGrid">
        <Stat icon={<Users size={15}/>} label="Today's Visitors" value={snapshot ? snapshot.visitorsToday.toLocaleString() : "—"} detail={snapshot ? `+${snapshot.visitorsChange}% vs yesterday` : "Loading"} good />
        <Stat icon={<ClipboardList size={15}/>} label="Active Requests" value={snapshot ? String(snapshot.activeRequests) : "—"} detail={snapshot ? `${snapshot.urgentRequests} urgent` : "Loading"} />
        <Stat icon={<ShieldAlert size={15}/>} label="Open Incidents" value={snapshot ? String(snapshot.openIncidents) : "—"} detail="Requires attention" />
        <Stat icon={<Activity size={15}/>} label="Queue Risk" value={queueRisk} detail={attractions.find(a => a.queueMinutes >= 40)?.name ?? "Current snapshot"} risk={queueRisk === "HIGH"} />
      </div>
      <div className="opsPanels">
        <section className="opsPanel"><div className="panelTitle"><div><div className="kicker">ATTRACTIONS</div><h3>Capacity & queue</h3></div><span>{attractions.length} configured</span></div><div className="tableHead"><span>Attraction</span><span>Capacity</span><span>Queue</span><span>Status</span></div>{attractions.length === 0 && <div className="emptyState">No attraction snapshot is available yet.</div>}{attractions.map((a) => <div className="zoneRow" key={a.id}><b>{a.name}<small>{a.zone}</small></b><span>{a.capacity}%</span><span>{a.queueMinutes} min</span><span className={`status ${a.status === "OPEN" ? "low" : a.status === "LIMITED" ? "medium" : "high"}`}>{a.status}</span></div>)}</section>
        <section className="opsPanel"><div className="panelTitle"><div><div className="kicker">SERVICE QUEUE</div><h3>Needs attention</h3></div><Link href="/help">Guest view</Link></div>{requests.length === 0 && <div className="emptyState">No active service requests.</div>}{requests.slice(0, 6).map((r) => <div className="opRequest" key={r.id}><div className="avatar">{r.category[0]}</div><div className="opRequestMain"><b>#{r.requestCode} · {r.category}</b><small>{r.location || "Location not provided"} · {r.assignedTo ?? "Unassigned"}</small></div><span className={`status ${r.priority === "CRITICAL" ? "high" : r.priority === "HIGH" ? "medium" : "low"}`}>{r.priority}</span>{!r.assignedTo && <button className="miniButton" onClick={() => assign(r.requestCode)}>Assign</button>}</div>)}</section>
      </div>
      <section className="opsPanel operationsTools"><div className="panelTitle"><div><div className="kicker">OPERATIONS TOOLS</div><h3>Fast actions</h3></div></div><div className="toolGrid">
        <Tool icon={<QrCode/>} title="Validate QR" text="Check a guest digital pass." onClick={() => setQrOpen(true)} />
        <Tool icon={<Ticket/>} title="Bookings" text="Review the booking queue." onClick={() => { window.location.href = "/operations/bookings"; }} />
        <Tool icon={<Waves/>} title="Queue Control" text="Manage attraction status and capacity." onClick={() => setNotice("Queue controls use the persisted attraction and queue domain.")} />
        <Tool icon={<AlertTriangle/>} title="Incidents" text="Open the incident workflow." onClick={() => { window.location.href = "/incidents"; }} />
      </div></section>
      <section className="misCallout"><div style={{ display: "flex", gap: 13, alignItems: "center" }}><BarChart3 size={22}/><div><div className="kicker">INTELLIGENCE LAYER</div><h3>GRS Smart MIS Dashboard</h3><p>Your Python/Streamlit analytics system remains the management intelligence layer.</p></div></div><a href="https://grsdashboard.streamlit.app/" className="misButton" target="_blank" rel="noreferrer">Open MIS <ArrowRight size={14}/></a></section>
    </main>
    {notice && <div className="opsToast"><CheckCircle2 size={16}/>{notice}</div>}
    {qrOpen && <div className="modalBack" onMouseDown={(e) => { if (e.target === e.currentTarget) closeQR(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title"><button className="close" aria-label="Close" onClick={closeQR} ref={modalCloseRef}><XCircle size={18}/></button><div className="kicker">STAFF QR VALIDATION</div><h2 id="qr-dialog-title">Validate digital pass</h2><p style={{ color: "#667286", fontSize: 11, lineHeight: 1.5 }}>Paste a pass token from a confirmed booking to validate it server-side.</p><label style={{ display: "block", fontSize: 11, fontWeight: 700, marginTop: 20 }} htmlFor="qr-token-input">QR token<input id="qr-token-input" value={qrValue} onChange={e => setQrValue(e.target.value)} placeholder="Enter pass token" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, border: "1px solid #e5eaf1", borderRadius: 10 }}/></label><button className="primary" onClick={validateQR} disabled={!qrValue.trim()}>Validate <CheckCircle2 size={15}/></button>{qrResult && <div role="status" style={{ marginTop: 15, padding: 14, borderRadius: 12, background: qrResult === "VALID_PASS" ? "#e9f7f1" : "#ffe8e8", color: qrResult === "VALID_PASS" ? "#198a62" : "#bf3c46", fontSize: 12, fontWeight: 800 }}>{qrResult === "VALID_PASS" ? "✓ Valid pass — accepted" : "✕ Invalid pass"}</div>}</div></div>}
  </div>;
}

function Stat({ icon, label, value, detail, good, risk }: { icon: React.ReactNode; label: string; value: string; detail: string; good?: boolean; risk?: boolean }) { return <div className="stat"><span style={{ display: "flex", gap: 7, alignItems: "center" }}>{icon}{label}</span><strong>{value}</strong><small className={good ? "good" : risk ? "riskText" : ""}>{detail}</small></div>; }
function Tool({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) { return <button className="tool" onClick={onClick}><span className="toolIcon">{icon}</span><span><b>{title}</b><small>{text}</small></span><ArrowRight size={15}/></button>; }
