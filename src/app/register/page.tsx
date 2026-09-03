'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock, Mail, User, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function validate() {
    if (!name.trim() || name.trim().length < 2) return 'Enter your full name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Enter a valid email address.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    return ''
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const problem = validate()
    if (problem) return setError(problem)
    setError('')
    setLoading(true)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password, confirm }),
    })
    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data?.error ?? 'Unable to create your account.')
      return
    }
    router.push('/login?registered=1')
  }

  return (
    <main className="page" style={{ background: 'linear-gradient(180deg,#0e1a33 0%,#101827 42%,#f6f8fc 42.5%,#f6f8fc 100%)' }}>
      <div className="container" style={{ maxWidth: 460 }}>
        <Link href="/" className="brand" style={{ display: 'inline-flex', margin: '34px 0 6px' }}><span className="brand-mark">G</span><span>GRS <b>SMART PARK</b></span></Link>

        <div className="card" style={{ marginTop: 18, padding: 30 }}>
          <div className="kicker">NEW GUEST ACCOUNT</div>
          <h1 style={{ fontSize: 26, margin: '6px 0 4px' }}>Join the park.</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 22 }}>Create a guest account to book visits, hold your digital pass and get help.</p>

          {error && <div className="formError" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700 }}>
              Full name
              <span className="inputLike" style={{ alignItems: 'center' }}><User size={15} /><input
                type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma"
                autoComplete="name" required style={{ border: 0, outline: 'none', flex: 1, fontSize: 14 }}
              /></span>
            </label>
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
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
                autoComplete="new-password" required minLength={8} style={{ border: 0, outline: 'none', flex: 1, fontSize: 14 }}
              /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'grid', placeItems: 'center', padding: '0 6px' }}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700 }}>
              Confirm password
              <span className="inputLike" style={{ alignItems: 'center' }}><Lock size={15} /><input
                type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password"
                autoComplete="new-password" required minLength={8} style={{ border: 0, outline: 'none', flex: 1, fontSize: 14 }}
              /><button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'grid', placeItems: 'center', padding: '0 6px' }}>{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button></span>
            </label>

            <button className="primary fullButton" disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" /> Creating account…</> : <>Create guest account <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 16, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}><CheckCircle2 size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Guest access only</span>
            <Link href="/login" className="textLink" style={{ marginLeft: 'auto' }}>Already have an account? <ArrowRight size={13} /></Link>
          </div>
        </div>
      </div>
    </main>
  )
}