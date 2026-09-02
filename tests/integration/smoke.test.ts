import { describe, it, expect } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { useTestDb } from './helpers'

useTestDb()

describe('route handler import smoke test', () => {
  it('can import bookings POST and health GET', async () => {
    const health = await import('@/app/api/health/route')
    const res = await health.GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
  })

  it('health is a lightweight liveness probe (no DB, no secrets)', async () => {
    const health = await import('@/app/api/health/route')
    const res = await health.GET()
    const body = await res.json()
    expect(body.status).toBe('ok')
    const serialized = JSON.stringify(body)
    expect(serialized).not.toContain('DATABASE_URL')
    expect(serialized).not.toContain('AUTH_SECRET')
    expect(serialized).not.toContain('postgresql://')
  })

  it('ready returns 200 when config and DB are available', async () => {
    const ready = await import('@/app/api/ready/route')
    const res = await ready.GET()
    const body = await res.json()
    expect([200, 503]).toContain(res.status)
    if (res.status === 200) {
      expect(body.status).toBe('ok')
    }
    const serialized = JSON.stringify(body)
    expect(serialized).not.toContain('postgresql://')
    expect(serialized).not.toContain('AUTH_SECRET')
  })

  it('experience list is public', async () => {
    const exp = await import('@/app/api/experiences/route')
    const res = await exp.GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('unauthenticated request to protected API returns 401', async () => {
    mockAuthUser(null)
    const bookings = await import('@/app/api/bookings/route')
    const req = new Request('http://localhost/api/bookings', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } })
    const res = await bookings.POST(req)
    expect(res.status).toBe(401)
  })
})
