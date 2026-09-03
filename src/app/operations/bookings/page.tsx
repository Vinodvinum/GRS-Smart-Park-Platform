"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Ticket, Users } from "lucide-react";
import { Brand } from "@/components/Brand";

type Booking = {
  id: string;
  bookingCode: string;
  experience: string;
  visitDate: string;
  adults: number;
  children: number;
  amount: string;
  status: string;
  createdAt: string;
};

export default function OperationsBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/operations/bookings", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load booking queue");
      const json = await response.json();
      setBookings(json.data ?? []);
    } catch {
      setError("Booking queue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return <div className="opsShell">
    <header className="opsTop"><Brand dark /><Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link></header>
    <main className="container opsContent">
      <div className="opsHeader">
        <div><div className="kicker">BOOKING OPERATIONS</div><h1>Today’s booking queue.</h1><p>Recent transactions from PostgreSQL · Staff view</p></div>
        <button className="misButton" onClick={load} disabled={loading}><RefreshCw size={14}/> {loading ? "Refreshing…" : "Refresh"}</button>
      </div>
      {error && <div className="formError" role="alert">{error}</div>}
      <section className="opsPanel">
        <div className="panelTitle"><div><div className="kicker">BOOKINGS</div><h3>Recent bookings</h3></div><span>{bookings.length} loaded</span></div>
        {bookings.length === 0 && !loading && <div className="emptyState">No bookings are currently recorded.</div>}
        <div className="tableHead"><span>Booking</span><span>Experience</span><span>Guests</span><span>Status</span></div>
        {bookings.map((booking) => <div className="zoneRow" key={booking.id}>
          <b><span style={{display:"flex",gap:7,alignItems:"center"}}><Ticket size={14}/>{booking.bookingCode}</span><small>{new Date(booking.visitDate).toLocaleDateString("en-IN")}</small></b>
          <span>{booking.experience}</span>
          <span style={{display:"flex",gap:5,alignItems:"center"}}><Users size={13}/>{booking.adults + booking.children}</span>
          <span className={`status ${booking.status === "CONFIRMED" ? "low" : booking.status === "CANCELLED" ? "high" : "medium"}`}>{booking.status}</span>
        </div>)}
      </section>
    </main>
  </div>;
}
