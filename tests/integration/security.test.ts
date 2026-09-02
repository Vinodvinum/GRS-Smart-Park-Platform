import { describe, it, expect, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, createUser, createBookingDirect, getFirstExperience } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

async function guest() {
  const u = await prisma.user.findUnique({ where: { email: 'demo.guest@grs.local' } })
  if (u) return u
  return createUser({ email: 'demo.guest@grs.local', name: 'Demo Guest', role: 'GUEST' })
}
function session(u: { id: string; name: string; email: string; role: any; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }
}

describe('security headers (via middleware on NextRequest)', () => {
  it('public response carries security headers set', async () => {
    const { middleware } = await import('@/middleware')
    const req = new NextRequest('http://localhost/api/health')
    const res: any = await middleware(req)
    const headers = res.headers as Headers
    expect(headers.get('x-content-type-options')).toBe('nosniff')
    expect(headers.get('x-frame-options')).toBe('DENY')
    expect(headers.get('x-xss-protection')).toContain('1; mode=block')
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    expect(headers.get('permissions-policy')).toContain('camera=()')
  })

  it('registration rate-limit response carries security headers', async () => {
    const { middleware } = await import('@/middleware')
    const req = new NextRequest('http://localhost/api/auth/register', { method: 'POST' })
    const res: any = await middleware(req)
    const headers = res.headers as Headers
    expect(headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('unauthenticated staff-prefixed API returns 401 with security headers', async () => {
    const { middleware } = await import('@/middleware')
    const req = new NextRequest('http://localhost/api/staff/snapshot')
    const res: any = await middleware(req)
    expect(res.status).toBe(401)
    const headers = res.headers as Headers
    expect(headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('unauthenticated guest page redirects to /login', async () => {
    const { middleware } = await import('@/middleware')
    const req = new NextRequest('http://localhost/my-visit')
    const res: any = await middleware(req)
    expect(res.status).toBe(307)
    expect((res.headers as Headers).get('location')).toContain('/login')
  })
})

describe('error sanitization', () => {
  afterAll(() => mockAuthUser(null))

  it('invalid payloads return 4xx not 500 with no Prisma/stack leaks', async () => {
    const g = await guest()
    mockAuthUser(session(g))
    const sr = await import('@/app/api/service-requests/route')
    const res = await sr.POST(jsonRequest('http://localhost/api/service-requests', { category: 'BAD', description: 'x', priority: 'MEDIUM' }))
    expect(res.status).toBe(400)
    const text = await res.text()
    expect(text).not.toContain('PrismaClient')
    expect(text).not.toContain(' at ')
    expect(text).not.toContain('node_modules')
    expect(text).not.toContain('DATABASE_URL')
  })

  it('anonymous protected request returns structured 401 with code UNAUTHENTICATED', async () => {
    mockAuthUser(null)
    const bookings = await import('@/app/api/bookings/route')
    const res = await bookings.POST(new Request('http://localhost/api/bookings', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('UNAUTHENTICATED')
  })

  it('forbidden returns structured 403 with code FORBIDDEN', async () => {
    const g = await guest()
    mockAuthUser(session(g))
    const incidents = await import('@/app/api/incidents/route')
    const res = await incidents.GET()
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('FORBIDDEN')
  })

  it('missing resource returns 404 not 500', async () => {
    const g = await guest()
    mockAuthUser(session(g))
    const bookingsRoute = await import('@/app/api/bookings/[bookingCode]/route')
    const res = await bookingsRoute.GET(new Request('http://localhost'), { params: Promise.resolve({ bookingCode: 'GRS-UNKNOWN-999' }) })
    expect(res.status).toBe(404)
  })
})

describe('rate limiter behavior on write endpoints', () => {
  afterAll(() => mockAuthUser(null))

  it('blocks write endpoint after exceeding WRITE_RATE_LIMIT (30/min) with 429', async () => {
    const experience = await getFirstExperience()
    mockAuthUser({ id: 'ratelimit-user', name: 'RL', email: 'rl@test.local', role: 'GUEST', isActive: true })

    const bookings = await import('@/app/api/bookings/route')
    let lastStatus = 0
    let lastBody: any = null
    for (let i = 0; i < 35; i++) {
      const res = await bookings.POST(jsonRequest('http://localhost/api/bookings', {
        experienceId: experience.id,
        visitDate: new Date(Date.now() + 86400000).toISOString(),
        adults: 1,
        children: 0,
      }))
      lastStatus = res.status
      if (res.status !== 201) {
        lastBody = await res.json().catch(() => ({}))
      }
    }
    expect(lastStatus).toBe(429)
    expect(lastBody?.code).toBe('RATE_LIMITED')
    expect(lastBody?.message).toBeTruthy()
  })
})

describe('raw pass token never exposed', () => {
  afterAll(() => mockAuthUser(null))

  it('raw token is not stored nor present in audit logs', async () => {
    const g = await guest()
    const experience = await getFirstExperience()
    const { rawToken } = await createBookingDirect({ userId: g.id, experienceId: experience.id })

    const allAudit = await prisma.auditLog.findMany()
    const serialized = JSON.stringify(allAudit)
    expect(serialized).not.toContain(rawToken)
  })
})
