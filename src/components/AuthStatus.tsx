'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type SessionShape = {
  user?: { name?: string | null; email?: string | null; role?: string }
}

export function AuthStatus() {
  const [session, setSession] = useState<SessionShape | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => (res.ok ? res.json() : null))
      .then(data => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setChecked(true))
  }, [])

  if (!checked) return null

  if (!session?.user) {
    return <Link href="/login" className="navlink">Sign in</Link>
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span className="navlink" style={{ cursor: 'default' }}>
        {session.user.name ?? session.user.email} · {String(session.user.role ?? '').toLowerCase()}
      </span>
      <button
        type="button"
        className="navlink"
        style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'var(--blue)' }}
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </button>
    </span>
  )
}