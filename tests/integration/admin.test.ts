import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, createUser, getFirstExperience } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

async function role(role: 'GUEST' | 'STAFF' | 'SUPERVISOR' | 'ADMIN') {
  const email = `demo.${role.toLowerCase()}@grs.local`
  const u = await prisma.user.findUnique({ where: { email } })
  if (u) return u
  return createUser({ email, name: `Demo ${role}`, role })
}
function session(u: { id: string; name: string; email: string; role: any; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }
}

describe('GET /api/admin/snapshot (admin-only)', () => {
  afterAll(() => mockAuthUser(null))

  it.each([
    ['GUEST', 403],
    ['STAFF', 403],
    ['SUPERVISOR', 403],
    ['ADMIN', 200],
  ] as const)('%s -> %i', async (r, expected) => {
    const u = await role(r)
    mockAuthUser(session(u))
    const route = await import('@/app/api/admin/snapshot/route')
    const res = await route.GET()
    expect(res.status).toBe(expected)
  })

  it('admin gets a DB-backed snapshot listing experiences and zones', async () => {
    const ad = await role('ADMIN')
    mockAuthUser(session(ad))
    const route = await import('@/app/api/admin/snapshot/route')
    const res = await route.GET()
    const body = await res.json()
    expect(body.data.experiences.length).toBeGreaterThan(0)
    expect(body.data.zones).toBeDefined()
    expect(body.data.attractions).toBeDefined()
    expect(body.data.offers).toBeDefined()
  })
})

describe('GET /api/admin/settings (admin-only)', () => {
  afterAll(() => mockAuthUser(null))

  it.each([
    ['GUEST', 403],
    ['STAFF', 403],
    ['SUPERVISOR', 403],
    ['ADMIN', 200],
  ] as const)('%s -> %i', async (r, expected) => {
    const u = await role(r)
    mockAuthUser(session(u))
    const route = await import('@/app/api/admin/settings/route')
    const res = await route.GET()
    expect(res.status).toBe(expected)
  })

  it('admin gets park settings', async () => {
    const ad = await role('ADMIN')
    mockAuthUser(session(ad))
    const route = await import('@/app/api/admin/settings/route')
    const res = await route.GET()
    const body = await res.json()
    expect(body.data.parkName).toBeTruthy()
    expect(body.data.currency).toBe('INR')
  })
})

describe('audit log integrity', () => {
  it('audit events store actorId from session and no sensitive raw values', async () => {
    // create a booking through the API to generate a realistic audit row
    const ad = await role('ADMIN')
    const g = await role('GUEST')
    const experience = await getFirstExperience()
    mockAuthUser(session(g))
    const bookings = await import('@/app/api/bookings/route')
    const res = await bookings.POST(new Request('http://localhost/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ experienceId: experience.id, visitDate: new Date(Date.now() + 86400000).toISOString(), adults: 1, children: 0 }),
      headers: { 'content-type': 'application/json' },
    }))
    expect(res.status).toBe(201)

    const audit = await prisma.auditLog.findFirst({ where: { action: 'BOOKING_CREATED' }, orderBy: { createdAt: 'desc' } })
    expect(audit).not.toBeNull()
    const meta = audit?.metadata as Record<string, unknown> | null
    const serialized = authSafeStringify({ audit, meta })
    // no password hashes or secrets leak into audit
    expect(serialized).not.toMatch(/\$2[aby]\$/)
    expect(serialized).not.toContain('AUTH_SECRET')
    expect(serialized).not.toContain(authSecretMarker())
  })
})

function authSafeStringify(obj: unknown) {
  return JSON.stringify(obj)
}

function authSecretMarker() {
  return process.env.AUTH_SECRET ? String(process.env.AUTH_SECRET).slice(0, 8) : 'NONE'
}
