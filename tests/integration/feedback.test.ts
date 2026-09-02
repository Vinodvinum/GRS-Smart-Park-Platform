import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, uniqueEmail, createUser } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/feedback', {
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
function session(u: { id: string; name: string; email: string; role: any; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }
}

describe('POST /api/feedback', () => {
  afterAll(() => mockAuthUser(null))

  it('guest submits valid feedback for own request -> 201 + FEEDBACK_SUBMITTED audit', async () => {
    const a = await guestA()
    const sr = await prisma.serviceRequest.create({
      data: { requestCode: `GRS${Math.floor(10000 + Math.random() * 89999)}`, userId: a.id, category: 'GENERAL', description: 'fb test', status: 'OPEN', priority: 'MEDIUM' },
    })
    mockAuthUser(session(a))
    const route = await import('@/app/api/feedback/route')
    const before = await prisma.auditLog.count({ where: { action: 'FEEDBACK_SUBMITTED' } })
    const res = await route.POST(jsonRequest({ serviceRequestId: sr.id, rating: 5, comment: 'Great service' }))
    expect(res.status).toBe(201)
    const after = await prisma.auditLog.count({ where: { action: 'FEEDBACK_SUBMITTED' } })
    expect(after).toBe(before + 1)
    const audit = await prisma.auditLog.findFirst({ where: { action: 'FEEDBACK_SUBMITTED' }, orderBy: { createdAt: 'desc' } })
    expect(audit?.actorId).toBe(a.id)
    const stored = await prisma.feedback.findUnique({ where: { serviceRequestId: sr.id } })
    expect(stored?.rating).toBe('FIVE')
  })

  it('rejects invalid rating out of range (400)', async () => {
    const a = await guestA()
    const sr = await prisma.serviceRequest.create({
      data: { requestCode: `GRS${Math.floor(10000 + Math.random() * 89999)}`, userId: a.id, category: 'GENERAL', description: 'fb', status: 'OPEN', priority: 'MEDIUM' },
    })
    mockAuthUser(session(a))
    const route = await import('@/app/api/feedback/route')
    const res = await route.POST(jsonRequest({ serviceRequestId: sr.id, rating: 9 }))
    expect(res.status).toBe(400)
  })

  it('rejects missing rating (400)', async () => {
    const a = await guestA()
    const sr = await prisma.serviceRequest.create({
      data: { requestCode: `GRS${Math.floor(10000 + Math.random() * 89999)}`, userId: a.id, category: 'GENERAL', description: 'fb', status: 'OPEN', priority: 'MEDIUM' },
    })
    mockAuthUser(session(a))
    const route = await import('@/app/api/feedback/route')
    const res = await route.POST(jsonRequest({ serviceRequestId: sr.id, comment: 'no rating' }))
    expect(res.status).toBe(400)
  })

  it('rejects unknown service request (404)', async () => {
    const a = await guestA()
    mockAuthUser(session(a))
    const route = await import('@/app/api/feedback/route')
    const res = await route.POST(jsonRequest({ serviceRequestId: 'GRS99999-XYZ', rating: 3 }))
    expect(res.status).toBe(404)
  })

  it('enforces feedback ownership - guest cannot feedback another guests request (404)', async () => {
    const a = await guestA()
    const srOwner = await prisma.serviceRequest.create({
      data: { requestCode: `GRS${Math.floor(10000 + Math.random() * 89999)}`, userId: a.id, category: 'GENERAL', description: 'fb', status: 'OPEN', priority: 'MEDIUM' },
    })
    const b = await guestB()
    mockAuthUser(session(b))
    const route = await import('@/app/api/feedback/route')
    const res = await route.POST(jsonRequest({ serviceRequestId: srOwner.id, rating: 4 }))
    expect(res.status).toBe(404)
  })

  it('duplicate feedback for same request returns 409', async () => {
    const a = await guestA()
    const sr = await prisma.serviceRequest.create({
      data: { requestCode: `GRS${Math.floor(10000 + Math.random() * 89999)}`, userId: a.id, category: 'GENERAL', description: 'fb', status: 'OPEN', priority: 'MEDIUM' },
    })
    mockAuthUser(session(a))
    const route = await import('@/app/api/feedback/route')
    const first = await route.POST(jsonRequest({ serviceRequestId: sr.id, rating: 3 }))
    expect(first.status).toBe(201)
    const second = await route.POST(jsonRequest({ serviceRequestId: sr.id, rating: 4 }))
    expect(second.status).toBe(409)
  })

  it('anonymous cannot submit feedback (401)', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/feedback/route')
    const res = await route.POST(jsonRequest({ serviceRequestId: 'GRS11111', rating: 3 }))
    expect(res.status).toBe(401)
  })
})
