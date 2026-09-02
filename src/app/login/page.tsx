'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="page"><div className="container" style={{ maxWidth: 460 }} /></main>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result?.ok || result.error) {
        setError('Invalid email or password, or your account is unavailable.')
        return
      }
      router.push(next)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page" style={{ background: 'linear-gradient(180deg,#0e1a33 0%,#101827 42%,#f6f8fc 42.5%,#f6f8fc 100%)' }}>
      <div className="container" style={{ maxWidth: 460 }}>
        <Link href="/" className="brand" style={{ display: 'inline-flex', margin: '34px 0 6px' }}><span className="brand-mark">G</span><span>GRS <b>SMART PARK</b></span></Link>

        <div className="card" style={{ marginTop: 18, padding: 30 }}>
          <div className="kicker">SECURE ACCESS</div>
          <h1 style={{ fontSize: 26, margin: '6px 0 4px' }}>Sign in to GRS.</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 22 }}>Use your GRS account for guest services or park operations.</p>

          {error && <div className="formError" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700 }}>
              Email address
              <span className="inputLike" style={{ alignItems: 'center' }}><Mail size={15} /><input
                type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@grs.local"
                autoComplete="email" required style={{ border: 0, outline: 'none', flex: 1, fontSize: 14 }}
              /></span>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700 }}>
              Password
              <span className="inputLike" style={{ alignItems: 'center' }}><Lock size={15} /><input
                type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                autoComplete="current-password" required style={{ border: 0, outline: 'none', flex: 1, fontSize: 14 }}
              /></span>
            </label>

            <button className="primary fullButton" disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 16, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 12 }}>
            <Link href="/register" className="textLink">Create a guest account <ArrowRight size={13} /></Link>
            <Link href="/" className="textLink" style={{ marginLeft: 'auto' }}><ArrowLeft size={13} /> Back home</Link>
          </div>
        </div>

        <div className="secureNote" style={{ marginTop: 18 }}>
          <ShieldCheck size={16} />
          <span><b>Protected session</b><small>Your credentials are verified server-side. No passwords are stored in this browser.</small></span>
        </div>
      </div>
    </main>
  )
}