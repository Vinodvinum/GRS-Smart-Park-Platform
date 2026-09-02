import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, uniqueEmail, createUser, createBookingDirect } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

async function guestA() {
  const u = await prisma.user.findUnique({ where: { email: 'demo.guest@grs.local' } })
  if (u) return u
  return createUser({ email: 'demo.guest@grs.local', name: 'Demo Guest', role: 'GUEST' })
}
async function guestB() {
  return createUser({ role: 'GUEST' })
}
async function staff() {
  const u = await prisma.user.findUnique({ where: { email: 'demo.staff@grs.local' } })
  if (u) return u
  return createUser({ email: 'demo.staff@grs.local', name: 'Demo Staff', role: 'STAFF' })
}

function session(u: { id: string; name: string; email: string; role: any; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }
}

describe('POST /api/service-requests', () => {
  afterAll(() => mockAuthUser(null))

  it('guest creates a service request that persists with requestCode', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const res = await route.POST(jsonRequest('http://localhost/api/service-requests', {
      category: 'LOST_FOUND',
      description: 'Lost my wallet',
      priority: 'MEDIUM',
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.requestCode).toMatch(/^GRS\d{5,}$/)
    const stored = await prisma.serviceRequest.findUnique({ where: { id: body.data.id } })
    expect(stored).not.toBeNull()
    expect(stored?.userId).toBe(a.id)
    expect(stored?.status).toBe('OPEN')
  })

  it('creates a ServiceRequestUpdate history entry on creation', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const res = await route.POST(jsonRequest('http://localhost/api/service-requests', {
      category: 'MEDICAL',
      description: 'Need first aid',
      priority: 'HIGH',
    }))
    const body = await res.json()
    const updates = await prisma.serviceRequestUpdate.findMany({ where: { serviceRequestId: body.data.id } })
    expect(updates.length).toBeGreaterThanOrEqual(1)
    expect(updates[0].status).toBe('OPEN')
  })

  it('rejects invalid category with 400', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const res = await route.POST(jsonRequest('http://localhost/api/service-requests', {
      category: 'NOT_A_CATEGORY',
      description: 'test',
      priority: 'MEDIUM',
    }))
    expect(res.status).toBe(400)
  })

  it('rejects missing description and invalid priority', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')

    const noDesc = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', priority: 'MEDIUM' }))
    expect(noDesc.status).toBe(400)

    const badPriority = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'x', priority: 'URGENT' }))
    expect(badPriority.status).toBe(400)
  })

  it('rejects description over 1000 chars', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const res = await route.POST(jsonRequest('http://localhost/api/service-requests', {
      category: 'GENERAL',
      description: 'x'.repeat(1001),
      priority: 'MEDIUM',
    }))
    expect(res.status).toBe(400)
  })

  it('records SERVICE_REQUEST_CREATED audit with actor', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const before = await prisma.auditLog.count({ where: { action: 'SERVICE_REQUEST_CREATED' } })
    await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'audit test', priority: 'LOW' }))
    const after = await prisma.auditLog.count({ where: { action: 'SERVICE_REQUEST_CREATED' } })
    expect(after).toBe(before + 1)
    const audit = await prisma.auditLog.findFirst({ where: { action: 'SERVICE_REQUEST_CREATED' }, orderBy: { createdAt: 'desc' } })
    expect(audit?.actorId).toBe(a.id)
  })
})

describe('GET /api/service-requests (list)', () => {
  afterAll(() => mockAuthUser(null))

  it('guest only sees their own requests', async () => {
    const a = await guestA()
    // create a request for guest A directly
    const route = await import('@/app/api/service-requests/route')
    mockAuthUser(session(a))
    await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'a own', priority: 'MEDIUM' }))

    // guest B sees none of A's requests
    const b = await guestB()
    await prisma.serviceRequest.create({
      data: { requestCode: 'GRS77777', userId: b.id, category: 'LOCKER', description: 'b request', status: 'OPEN', priority: 'MEDIUM' },
    })
    mockAuthUser(session(b))
    const listRes = await route.GET()
    const listBody = await listRes.json()
    expect(listBody.data.every((r: any) => r.userId === b.id)).toBe(true)
    expect(listBody.data.some((r: any) => r.requestCode === 'GRS77777')).toBe(true)
  })

  it('staff sees all requests (no user filter)', async () => {
    const staffUser = await staff()
    mockAuthUser(session(staffUser))
    const route = await import('@/app/api/service-requests/route')
    const res = await route.GET()
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })
})

describe('GET /api/service-requests/[id]', () => {
  afterAll(() => mockAuthUser(null))

  it('guest can read their own request detail', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/service-requests/route')
    const created = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'detail', priority: 'MEDIUM' }))
    const detailRoute = await import('@/app/api/service-requests/[id]/route')
    const body = await (await created.json()).data
    const res = await detailRoute.GET(new Request('http://localhost'), { params: Promise.resolve({ id: body.id }) })
    expect(res.status).toBe(200)
  })

  it('another guest cannot read request (404)', async () => {
    const a = await guestA()
    const route = await import('@/app/api/service-requests/route')
    mockAuthUser(session(a))
    const createdRes = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'private', priority: 'MEDIUM' }))
    const created = await createdRes.json()

    const b = await guestB()
    mockAuthUser(session(b))
    const detailRoute = await import('@/app/api/service-requests/[id]/route')
    const res = await detailRoute.GET(new Request('http://localhost'), { params: Promise.resolve({ id: created.data.id }) })
    expect(res.status).toBe(404)
  })

  it('staff can read any request by id or code', async () => {
    const a = await guestA()
    const route = await import('@/app/api/service-requests/route')
    mockAuthUser(session(a))
    const createdRes = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'LOST_FOUND', description: 'staffread', priority: 'MEDIUM' }))
    const created = await createdRes.json()

    const staffUser = await staff()
    mockAuthUser(session(staffUser))
    const detailRoute = await import('@/app/api/service-requests/[id]/route')
    const byId = await detailRoute.GET(new Request('http://localhost'), { params: Promise.resolve({ id: created.data.id }) })
    expect(byId.status).toBe(200)
    const byCode = await detailRoute.GET(new Request('http://localhost'), { params: Promise.resolve({ id: created.data.requestCode }) })
    expect(byCode.status).toBe(200)
  })
})

describe('POST /api/operations/requests/assign', () => {
  afterAll(() => mockAuthUser(null))

  it('staff assigns an OPEN request -> ASSIGNED with history + audit', async () => {
    const a = await guestA()
    const route = await import('@/app/api/service-requests/route')
    mockAuthUser(session(a))
    const createdRes = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'to assign', priority: 'MEDIUM' }))
    const created = await (await createdRes.json()).data

    const staffUser = await staff()
    mockAuthUser(session(staffUser))
    const assignRoute = await import('@/app/api/operations/requests/assign/route')
    const res = await assignRoute.POST(jsonRequest('http://localhost/api/operations/requests/assign', { requestCode: created.requestCode, staffName: 'Operations Team' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.status).toBe('ASSIGNED')
    expect(body.data.assignedTo).toBe('Operations Team')

    const stored = await prisma.serviceRequest.findUnique({ where: { id: created.id } })
    expect(stored?.status).toBe('ASSIGNED')
    const updates = await prisma.serviceRequestUpdate.findMany({ where: { serviceRequestId: created.id }, orderBy: { createdAt: 'asc' } })
    expect(updates.some((u) => u.status === 'ASSIGNED')).toBe(true)
    const audit = await prisma.auditLog.findFirst({ where: { action: 'SERVICE_REQUEST_ASSIGNED', entityId: created.id }, orderBy: { createdAt: 'desc' } })
    expect(audit).not.toBeNull()
    expect(audit?.actorId).toBe(staffUser.id)
  })

  it('guest cannot assign (403)', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const assignRoute = await import('@/app/api/operations/requests/assign/route')
    const res = await assignRoute.POST(jsonRequest('http://localhost/api/operations/requests/assign', { requestCode: 'GRS10452', staffName: 'x' }))
    expect(res.status).toBe(403)
  })

  it('assigning a RESOLVED request returns 409 (invalid transition)', async () => {
    const staffUser = await staff()
    const a = await guestA()
    const route = await import('@/app/api/service-requests/route')
    mockAuthUser(session(a))
    const createdRes = await route.POST(jsonRequest('http://localhost/api/service-requests', { category: 'GENERAL', description: 'resolved request', priority: 'MEDIUM' }))
    const created = await (await createdRes.json()).data
    await prisma.serviceRequest.update({ where: { id: created.id }, data: { status: 'RESOLVED', resolvedAt: new Date() } })

    mockAuthUser(session(staffUser))
    const assignRoute = await import('@/app/api/operations/requests/assign/route')
    const res = await assignRoute.POST(jsonRequest('http://localhost/api/operations/requests/assign', { requestCode: created.requestCode, staffName: 'x' }))
    expect(res.status).toBe(409)
  })

  it('unknown request returns 404', async () => {
    const staffUser = await staff()
    mockAuthUser(session(staffUser))
    const assignRoute = await import('@/app/api/operations/requests/assign/route')
    const res = await assignRoute.POST(jsonRequest('http://localhost/api/operations/requests/assign', { requestCode: 'GRS40404', staffName: 'x' }))
    expect(res.status).toBe(404)
  })
})
