import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import {
  prisma,
  resetDatabase,
  getFirstExperience,
  getActiveOffer,
  uniqueEmail,
  createUser,
  createBookingDirect,
  demoUser,
} from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

async function guestUser() {
  return demoUser('GUEST')
}

describe('POST /api/bookings', () => {
  afterAll(() => mockAuthUser(null))

  it('creates a booking with pass token and persists to DB', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })

    const route = await import('@/app/api/bookings/route')
    const visitDate = new Date(Date.now() + 5 * 86400000).toISOString()
    const res = await route.POST(jsonRequest({
      experienceId: experience.id,
      visitDate,
      adults: 2,
      children: 1,
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.booking.bookingCode).toBeTruthy()
    expect(body.passToken).toBeTruthy()
    expect(body.qrValue).toContain('grs://pass/')

    const booking = await prisma.booking.findUnique({ where: { bookingCode: body.booking.bookingCode } })
    expect(booking).not.toBeNull()
    expect(booking?.userId).toBe(guest.id)
    expect(booking?.status).toBe('CONFIRMED')
    const pass = await prisma.digitalPass.findUnique({ where: { bookingId: booking!.id } })
    expect(pass).not.toBeNull()
    // raw token is never stored - only its hash
    expect(booking?.qrPayload).not.toBe(body.passToken)
    expect(booking?.qrPayload).toBe(pass?.tokenHash)
  })

  it('creates matching tickets for adults and children', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })

    const route = await import('@/app/api/bookings/route')
    const res = await route.POST(jsonRequest({
      experienceId: experience.id,
      visitDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      adults: 2,
      children: 3,
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    const booking = await prisma.booking.findUnique({ where: { bookingCode: body.booking.bookingCode }, include: { tickets: true } })
    expect(booking?.tickets).toHaveLength(5)
  })

  it('computes amount server-side (adults*799 + children*499)', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })

    const route = await import('@/app/api/bookings/route')
    const res = await route.POST(jsonRequest({
      experienceId: experience.id,
      visitDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      adults: 2,
      children: 1,
    }))
    const body = await res.json()
    expect(Number(body.booking.amount)).toBe(2 * 799 + 1 * 499)
  })

  it('rejects invalid payload with 400', async () => {
    const guest = await guestUser()
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/route')

    const missing = await route.POST(jsonRequest({ adults: 1, children: 0 }))
    expect(missing.status).toBe(400)

    const badAdults = await route.POST(jsonRequest({ experienceId: 'x', visitDate: new Date().toISOString(), adults: -1, children: 0 }))
    expect(badAdults.status).toBe(400)
  })

  it('rejects past visit date with 400', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/route')
    const res = await route.POST(jsonRequest({
      experienceId: experience.id,
      visitDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      adults: 1,
      children: 0,
    }))
    expect(res.status).toBe(400)
  })

  it('rejects non-active experience with 404', async () => {
    const guest = await guestUser()
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/route')
    const res = await route.POST(jsonRequest({
      experienceId: 'nonexistent-experience-id',
      visitDate: new Date(Date.now() + 86400000).toISOString(),
      adults: 1,
      children: 0,
    }))
    expect(res.status).toBe(404)
    expect(res.status).not.toBe(500)
  })

  it('records a BOOKING_CREATED audit event with actor from session', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })

    const route = await import('@/app/api/bookings/route')
    const before = await prisma.auditLog.count({ where: { action: 'BOOKING_CREATED' } })
    const res = await route.POST(jsonRequest({
      experienceId: experience.id,
      visitDate: new Date(Date.now() + 86400000).toISOString(),
      adults: 1,
      children: 0,
    }))
    expect(res.status).toBe(201)
    const after = await prisma.auditLog.count({ where: { action: 'BOOKING_CREATED' } })
    expect(after).toBe(before + 1)
    const audit = await prisma.auditLog.findFirst({ where: { action: 'BOOKING_CREATED' }, orderBy: { createdAt: 'desc' } })
    expect(audit?.actorId).toBe(guest.id)
  })
})

describe('GET /api/bookings/[bookingCode]', () => {
  afterAll(() => mockAuthUser(null))

  it('owner guest can read own booking', async () => {
    const guest = await guestUser()
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking } = await createBookingDirect({ userId: guest.id, experienceId: experience.id })
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/[bookingCode]/route')
    const res = await route.GET(new Request('http://localhost'), { params: Promise.resolve({ bookingCode: booking.bookingCode }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.bookingCode).toBe(booking.bookingCode)
  })

  it('another guest cannot read others booking (404 not leaking existence)', async () => {
    const owner = await guestUser()
    const intruder = await createUser({ role: 'GUEST' })
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking } = await createBookingDirect({ userId: owner.id, experienceId: experience.id })
    mockAuthUser({ id: intruder.id, name: intruder.name, email: intruder.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/[bookingCode]/route')
    const res = await route.GET(new Request('http://localhost'), { params: Promise.resolve({ bookingCode: booking.bookingCode }) })
    expect(res.status).toBe(404)
  })

  it('staff can read any booking', async () => {
    const owner = await guestUser()
    const staff = await demoUser('STAFF')
    const experience = await getFirstExperience()
    if (!experience) throw new Error('no experience seeded')
    const { booking } = await createBookingDirect({ userId: owner.id, experienceId: experience.id })
    mockAuthUser({ id: staff.id, name: staff.name, email: staff.email, role: 'STAFF', isActive: true })
    const route = await import('@/app/api/bookings/[bookingCode]/route')
    const res = await route.GET(new Request('http://localhost'), { params: Promise.resolve({ bookingCode: booking.bookingCode }) })
    expect(res.status).toBe(200)
  })

  it('returns 404 for unknown booking', async () => {
    const guest = await guestUser()
    mockAuthUser({ id: guest.id, name: guest.name, email: guest.email, role: 'GUEST', isActive: true })
    const route = await import('@/app/api/bookings/[bookingCode]/route')
    const res = await route.GET(new Request('http://localhost'), { params: Promise.resolve({ bookingCode: 'NOPE123' }) })
    expect(res.status).toBe(404)
  })
})
