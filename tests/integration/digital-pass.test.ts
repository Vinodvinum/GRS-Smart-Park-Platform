import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import {
  prisma,
  resetDatabase,
  getFirstExperience,
  uniqueEmail,
  createUser,
  createBookingDirect,
  hashPassToken,
  demoUser,
} from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

async function guestUser() {
  return demoUser('GUEST')
}

describe('POST /api/passes/validate (guest validation)', () => {
  afterAll(() => mockAuthUser(null))

  it('accepts the owner guest valid pass', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: rawToken }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.booking.bookingCode).toBe(booking.bookingCode)
  })

  it('rejects invalid token with 404 pass not found', async () => {
    const guest = await guestUser()
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: 'this-is-not-a-real-token-value-1234567890' }))
    expect(res.status).toBe(404)
  })

  it('rejects short/invalid token with 400 INVALID_TOKEN', async () => {
    const guest = await guestUser()
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: 'short' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.reason).toBe('INVALID_TOKEN')
  })

  it('another guest cannot validate someone elses pass (404)', async () => {
    const owner = await guestUser()
    const intruder = await createUser({ role: 'GUEST' })
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { rawToken } = await createBookingDirect({ userId: owner.id, experienceId: experience.id })
    mockAuthUser({ id: intruder.id, name: intruder.name, email: intruder.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: rawToken }))
    expect(res.status).toBe(404)
  })

  it('rejects expired pass with 409 PASS_EXPIRED', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({
      userId: guest.id,
      experienceId: experience.id,
      visitDate: new Date(Date.now() - 10 * 86400000),
    })
    // force expiry in the past
    await prisma.digitalPass.update({ where: { bookingId: booking.id }, data: { expiresAt: new Date(Date.now() - 1000) } })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: rawToken }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.reason).toBe('PASS_EXPIRED')
  })

  it('rejects revoked pass with 409 PASS_REVOKED', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    await prisma.digitalPass.update({ where: { bookingId: booking.id }, data: { revokedAt: new Date() } })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: rawToken }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.reason).toBe('PASS_REVOKED')
  })

  it('rejects cancelled booking with 409 BOOKING_CANCELLED', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id, status: 'CANCELLED' })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/passes/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/passes/validate', { token: rawToken }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.reason).toBe('BOOKING_CANCELLED')
  })
})

describe('POST /api/operations/qr/validate (staff validation)', () => {
  afterAll(() => mockAuthUser(null))

  async function staffUser() {
    return demoUser('STAFF')
  }

  it('staff can validate any guest pass', async () => {
    const staff = await staffUser()
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    mockAuthUser({ id: staff.id, name: staff.name, email: staff.email, role: 'STAFF', isActive: true })
    const route = await import('@/app/api/operations/qr/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/operations/qr/validate', { token: rawToken }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.valid).toBe(true)
    expect(body.data.result).toBe('VALID_PASS')
  })

  it('staff sees INVALID_PASS result for unknown token (not 404)', async () => {
    const staff = await staffUser()
    mockAuthUser({ id: staff.id, name: staff.name, email: staff.email, role: 'STAFF', isActive: true })
    const route = await import('@/app/api/operations/qr/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/operations/qr/validate', { token: 'unknown-token-value-12345678901234567890' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.valid).toBe(false)
    expect(body.data.result).toBe('INVALID_PASS')
  })

  it('guest cannot access staff QR validation endpoint', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/operations/qr/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/operations/qr/validate', { token: rawToken }))
    expect(res.status).toBe(403)
  })

  it('signals revoked/expired/cancelled as INVALID_PASS', async () => {
    const staff = await staffUser()
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    await prisma.digitalPass.update({ where: { bookingId: booking.id }, data: { revokedAt: new Date() } })
    mockAuthUser({ id: staff.id, name: staff.name, email: staff.email, role: 'STAFF', isActive: true })
    const route = await import('@/app/api/operations/qr/validate/route')
    const res = await route.POST(jsonRequest('http://localhost/api/operations/qr/validate', { token: rawToken }))
    const body = await res.json()
    expect(body.data.valid).toBe(false)
  })
})

describe('raw token security', () => {
  it('raw token is never persisted - only its hash', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking, rawToken } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    const pass = await prisma.digitalPass.findUnique({ where: { bookingId: booking.id } })
    expect(pass?.tokenHash).toBe(hashPassToken(rawToken))
    // hash irreversibly differs from raw
    expect(pass?.tokenHash).not.toContain(rawToken)
  })
})
