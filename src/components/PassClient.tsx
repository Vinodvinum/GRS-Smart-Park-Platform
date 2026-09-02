'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, CheckCircle2, Download, ShieldCheck, Ticket } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

type PassData = { booking:{booking:{bookingCode:string;visitDate:string;amount:string};passToken:string;qrValue:string} } | null

export function PassClient(){
 const [data,setData]=useState<PassData>(null); const [error,setError]=useState('')
 useEffect(()=>{try{const raw=localStorage.getItem('grs:lastBooking'); if(raw)setData({booking:JSON.parse(raw)})}catch{setError('Could not read the demo pass from this browser.')}} ,[])
 if(error) return <EmptyPass message={error}/>
 if(!data) return <EmptyPass message="Create a booking first to generate your digital pass."/>
 const b=data.booking.booking
 return <main className="page passPage"><div className="container narrow"><Link href="/booking" className="backLink"><ArrowLeft size={15}/> Book another visit</Link><div className="pageTitle compact"><div className="kicker">MY VISIT</div><h1>Your digital pass.</h1><p>Keep this QR ready for entry. The QR contains an opaque pass token, not guest profile information.</p></div>
   <section className="digitalPass"><div className="passHeader"><div><span>GRS SMART PARK</span><h2>Guest Entry Pass</h2><small>Booking ID · {b.bookingCode}</small></div><span className="validPill"><CheckCircle2 size={13}/> Valid</span></div><div className="passBody"><div className="qrBox"><QRCodeSVG value={data.booking.qrValue} size={190} level="M" includeMargin/><small>Scan at entry</small></div><div className="passDetails"><div><span>VISIT DATE</span><b><CalendarDays size={13}/> {new Date(b.visitDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</b></div><div><span>BOOKING</span><b><Ticket size={13}/> {b.bookingCode}</b></div><div><span>STATUS</span><b className="validText"><CheckCircle2 size={13}/> Confirmed</b></div><div><span>AMOUNT</span><b>₹{Number(b.amount).toLocaleString('en-IN')}</b></div></div></div><div className="passFooter"><button onClick={()=>window.print()}><Download size={15}/> Print / Save pass</button><button onClick={()=>navigator.clipboard?.writeText(data.booking.qrValue)}><ShieldCheck size={15}/> Copy secure pass token</button></div></section>
   <div className="passNotice"><ShieldCheck size={18}/><div><b>Server-validated entry</b><p>The pass record, expiry and booking status are checked on the server. This ZIP does not expose private GRS systems.</p></div></div>
 </div></main>
}
function EmptyPass({message}:{message:string}){return <main className="page"><div className="container narrow"><div className="card emptyPass"><Ticket size={28}/><h2>No digital pass yet.</h2><p>{message}</p><Link href="/booking" className="primary">Start a booking <ArrowRightIcon/></Link></div></div></main>}
function ArrowRightIcon(){return <span aria-hidden="true">→</span>}
