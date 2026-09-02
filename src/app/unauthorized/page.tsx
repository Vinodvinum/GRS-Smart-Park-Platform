import Link from 'next/link'
import { ArrowLeft, LockKeyhole, LogOut, ShieldAlert } from 'lucide-react'
import { GuestNav } from '@/components/GuestNav'

export default function UnauthorizedPage() {
  return (
    <>
      <GuestNav />
      <main className="page">
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="card" style={{ marginTop: 40, padding: 32, textAlign: 'center' }}>
            <div className="placeholderIcon" style={{ margin: '0 auto 14px' }}><ShieldAlert size={24} /></div>
            <div className="kicker">ACCESS RESTRICTED</div>
            <h1 style={{ fontSize: 24, margin: '6px 0 6px' }}>Not in your role.</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
              Your account does not have permission to view this area. If you believe this is a mistake,
              contact your GRS administrator.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
              <Link href="/" className="primary"><ArrowLeft size={15} /> Back home</Link>
              <Link href="/login" className="secondary darkSecondary"><LockKeyhole size={15} /> Sign in as another user</Link>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: 'var(--muted)' }}>
              <LogOut size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Signed in users with the wrong role are redirected here.
            </div>
          </div>
        </div>
      </main>
    </>
  )
}