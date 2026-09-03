"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, ChevronRight, ClipboardList, Gift, LayoutDashboard, MapPinned, Settings, ShieldCheck, Sparkles, Users, Waves, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Brand } from "@/components/Brand";

const menus: Array<[string, string, LucideIcon]> = [
  ["Overview", "overview", LayoutDashboard], ["Experiences", "experiences", Sparkles], ["Attractions", "attractions", Waves],
  ["Zones", "zones", MapPinned], ["Facilities", "facilities", Building2], ["Offers", "offers", Gift], ["Users & Roles", "users", Users],
  ["Audit Logs", "audit", ClipboardList], ["Settings", "settings", Settings],
];

type AdminData = {
  experiences: { id: string; name: string; type: string; status: string; sortOrder: number }[];
  attractions: { id: string; name: string; zone: string; status: string }[];
  zones: string[];
  facilities: string[];
  offers: { id: string; name: string; type: string; status: string }[];
  users: { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }[];
  auditLogs: { id: string; action: string; entityType: string; entityId: string | null; actorName: string; actorRole: string | null; createdAt: string; metadata: unknown }[];
  settings: { parkName: string; timezone: string; currency: string };
};

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const title = tab === "overview" ? "Control the park experience." : menus.find(m => m[1] === tab)?.[0] ?? "Admin";

  async function load() {
    setError("");
    const response = await fetch("/api/admin/snapshot", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load admin snapshot");
    const json = await response.json();
    setData(json.data);
  }

  useEffect(() => { load().catch(() => setError("Admin data could not be loaded.")); }, []);

  return <div className="opsShell">
    <header className="opsTop"><Brand dark/><Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link></header>
    <div className="adminLayout">
      <aside className="adminSide"><div className="adminSideTitle">ADMIN CONSOLE</div>{menus.map(([label, id, Icon]) => <button className={"adminMenu "+(tab === id ? "active" : "")} key={id} onClick={() => setTab(id)}><Icon size={15}/><span>{label}</span><ChevronRight size={12}/></button>)}</aside>
      <main className="adminMain">
        <div className="adminHeader"><div><div className="kicker">GRS PLATFORM ADMIN</div><h1>{title}</h1><p>Configuration and governance · Database-backed catalogue</p></div><button className="misButton" onClick={() => load().then(() => setNotice("Configuration snapshot refreshed.")).catch(() => setNotice("Refresh failed."))}><RefreshCw size={14}/> Refresh</button></div>
        {error && <div className="formError" role="alert">{error}</div>}
        {tab === "overview" ? <Overview data={data} onAction={setTab}/> : <AdminPanel tab={tab} data={data}/>} 
        <div className="adminSecurity"><ShieldCheck size={19}/><div><b>Admin security boundary</b><small>Privileged mutations must be authenticated, authorized server-side and audit logged.</small></div></div>
      </main>
    </div>
    {notice && <div className="opsToast">{notice}</div>}
  </div>;
}

function Overview({ data, onAction }: { data: AdminData | null; onAction: (tab: string) => void }) {
  const cards: Array<[string, string, string, LucideIcon]> = [
    ["Experiences", "Manage guest-facing park products.", "experiences", Sparkles], ["Attractions", "Control operational attraction metadata.", "attractions", Waves],
    ["Offers", "Review commercial packages.", "offers", Gift], ["Facilities", "Maintain guest facility directory.", "facilities", Building2],
    ["Users & Roles", "Review access governance.", "users", Users], ["Audit Logs", "Review privileged activity history.", "audit", ClipboardList],
  ];
  return <><div className="statGrid">
    <div className="stat"><span><Sparkles size={15}/> Experiences</span><strong>{data?.experiences.length ?? "—"}</strong><small className="good">Catalogue</small></div>
    <div className="stat"><span><Waves size={15}/> Attractions</span><strong>{data?.attractions.length ?? "—"}</strong><small>Configured</small></div>
    <div className="stat"><span><Gift size={15}/> Offers</span><strong>{data?.offers.length ?? "—"}</strong><small>Commercial</small></div>
    <div className="stat"><span><Users size={15}/> Users</span><strong>{data?.users.length ?? "—"}</strong><small>Access directory</small></div>
  </div><div className="adminCards">{cards.map(([a,b,id,I]) => <button className="adminCard" key={id} onClick={() => onAction(id)}><span className="toolIcon"><I size={17}/></span><span><b>{a}</b><small>{b}</small></span><ArrowRight size={15}/></button>)}</div></>;
}

function AdminPanel({ tab, data }: { tab: string; data: AdminData | null }) {
  if (!data) return <section className="opsPanel adminTable"><div className="emptyState">Loading admin data…</div></section>;
  if (tab === "users") return <section className="opsPanel adminTable"><TableHead title="Users & Roles"/><div className="adminTableHead"><span>User</span><span>Role</span><span>Status</span></div>{data.users.map(u => <div className="adminTableRow" key={u.id}><div><b>{u.name}</b><small>{u.email}</small></div><span className="status low">{u.role}</span><span className={`status ${u.isActive ? "low" : "high"}`}>{u.isActive ? "ACTIVE" : "DISABLED"}</span></div>)}</section>;
  if (tab === "audit") return <section className="opsPanel adminTable"><TableHead title="Audit Logs"/><div className="adminTableHead"><span>Action</span><span>Actor</span><span>Entity</span></div>{data.auditLogs.length === 0 && <div className="emptyState">No audit events have been recorded yet.</div>}{data.auditLogs.map(log => <div className="adminTableRow" key={log.id}><div><b>{log.action}</b><small>{new Date(log.createdAt).toLocaleString()}</small></div><span>{log.actorName}</span><span>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 10)}` : ""}</span></div>)}</section>;
  if (tab === "settings") return <section className="opsPanel adminTable"><div className="kicker">SYSTEM SETTINGS</div><h3>Platform configuration</h3><div className="adminTableRow"><b>Park name</b><span>{data.settings.parkName}</span><span className="status low">READ ONLY</span></div><div className="adminTableRow"><b>Timezone</b><span>{data.settings.timezone}</span><span className="status low">READ ONLY</span></div><div className="adminTableRow"><b>Currency</b><span>{data.settings.currency}</span><span className="status low">READ ONLY</span></div></section>;
  if (tab === "zones") return <section className="opsPanel adminTable"><TableHead title="Zones"/><div className="adminTableHead"><span>Name</span><span>Type</span><span>Status</span></div>{data.zones.map(z => <div className="adminTableRow" key={z}><b>{z}</b><span>Park zone</span><span className="status low">ACTIVE</span></div>)}</section>;
  if (tab === "facilities") return <section className="opsPanel adminTable"><TableHead title="Facilities"/><div className="adminTableHead"><span>Name</span><span>Context</span><span>Status</span></div>{data.facilities.map(f => <div className="adminTableRow" key={f}><b>{f}</b><span>Guest Services</span><span className="status low">ACTIVE</span></div>)}</section>;
  if (tab === "experiences") return <section className="opsPanel adminTable"><TableHead title="Experiences"/><div className="adminTableHead"><span>Name</span><span>Type</span><span>Status</span></div>{data.experiences.map(e => <div className="adminTableRow" key={e.id}><b>{e.name}</b><span>{e.type}</span><span className="status low">{e.status}</span></div>)}</section>;
  if (tab === "attractions") return <section className="opsPanel adminTable"><TableHead title="Attractions"/><div className="adminTableHead"><span>Name</span><span>Zone</span><span>Status</span></div>{data.attractions.map(a => <div className="adminTableRow" key={a.id}><b>{a.name}</b><span>{a.zone}</span><span className={`status ${a.status === "OPEN" ? "low" : "medium"}`}>{a.status}</span></div>)}</section>;
  return <section className="opsPanel adminTable"><TableHead title="Offers"/><div className="adminTableHead"><span>Name</span><span>Type</span><span>Status</span></div>{data.offers.map(o => <div className="adminTableRow" key={o.id}><b>{o.name}</b><span>{o.type}</span><span className={`status ${o.status === "ACTIVE" ? "low" : "medium"}`}>{o.status}</span></div>)}</section>;
}
function TableHead({ title }: { title: string }) { return <div className="panelTitle"><div><div className="kicker">CONFIGURATION</div><h3>{title}</h3></div><span>Live snapshot</span></div>; }