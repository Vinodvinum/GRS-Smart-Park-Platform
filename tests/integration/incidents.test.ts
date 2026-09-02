import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, createUser } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

async function role(role: 'GUEST' | 'STAFF' | 'SUPERVISOR' | 'ADMIN') {
  const email = `demo.${role.toLowerCase()}@grs.local`
  const u = await prisma.user.findUnique({ where: { email } })
  if (u) return u
  return createUser({ email, name: `Demo ${role}`, role })
}

function session(u: { id: string; name: string; email: string; role: any; isActive: boolean }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }
}

async function freshIncident() {
  const inc = await prisma.incident.create({
    data: {
      incidentCode: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Test incident',
      description: 'Test description',
      severity: 'MEDIUM',
      status: 'OPEN',
    },
  })
  return inc
}

describe('GET /api/incidents', () => {
  afterAll(() => mockAuthUser(null))

  it('staff can list incidents', async () => {
    const s = await role('STAFF')
    mockAuthUser(session(s))
    const route = await import('@/app/api/incidents/route')
    const res = await route.GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('guest forbidden from listing incidents', async () => {
    const g = await role('GUEST')
    mockAuthUser(session(g))
    const route = await import('@/app/api/incidents/route')
    const res = await route.GET()
    expect(res.status).toBe(403)
  })
})

describe('POST /api/incidents/assign (supervisor-only mutation)', () => {
  afterAll(() => mockAuthUser(null))

  it('staff forbidden from assigning (403)', async () => {
    const s = await role('STAFF')
    const inc = await freshIncident()
    mockAuthUser(session(s))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'Ravi S.' }))
    expect(res.status).toBe(403)
  })

  it('guest forbidden from assigning (403)', async () => {
    const g = await role('GUEST')
    const inc = await freshIncident()
    mockAuthUser(session(g))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'Ravi S.' }))
    expect(res.status).toBe(403)
  })

  it('supervisor can assign and transitions to ASSIGNED with audit', async () => {
    const su = await role('SUPERVISOR')
    const inc = await freshIncident()
    mockAuthUser(session(su))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'Ravi S.' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.status).toBe('ASSIGNED')
    expect(body.data.assignedTo).toBe('Ravi S.')

    const stored = await prisma.incident.findUnique({ where: { incidentCode: inc.incidentCode } })
    expect(stored?.status).toBe('ASSIGNED')
    const audit = await prisma.auditLog.findFirst({ where: { action: 'INCIDENT_ASSIGNED', entityId: body.data.id }, orderBy: { createdAt: 'desc' } })
    expect(audit).not.toBeNull()
    expect(audit?.actorId).toBe(su.id)
  })

  it('admin can assign (authorized staff/supervisor operation)', async () => {
    const ad = await role('ADMIN')
    const inc = await freshIncident()
    mockAuthUser(session(ad))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'Anil K.' }))
    expect(res.status).toBe(200)
  })

  it('invalid payload returns 400', async () => {
    const su = await role('SUPERVISOR')
    mockAuthUser(session(su))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: '' }))
    expect(res.status).toBe(400)
  })

  it('unknown incident returns 404', async () => {
    const su = await role('SUPERVISOR')
    mockAuthUser(session(su))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: 'INC-0000', staffName: 'x' }))
    expect(res.status).toBe(404)
  })

  it('assigning a RESOLVED incident returns 409 (invalid state transition)', async () => {
    const su = await role('SUPERVISOR')
    const inc = await prisma.incident.create({
      data: { incidentCode: `INC-${Math.floor(1000 + Math.random() * 9000)}`, title: 'resolved', description: 'x', severity: 'LOW', status: 'RESOLVED', resolvedAt: new Date() },
    })
    mockAuthUser(session(su))
    const route = await import('@/app/api/incidents/assign/route')
    const res = await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'x' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('Invalid status transition')
  })

  it('assigning RESOLVED incident leaves resolvedAt consistent on valid transitions', async () => {
    const su = await role('SUPERVISOR')
    const inc = await freshIncident()
    mockAuthUser(session(su))
    const route = await import('@/app/api/incidents/assign/route')
    await route.POST(jsonRequest('http://localhost/api/incidents/assign', { incidentCode: inc.incidentCode, staffName: 'x' }))
    // set the assigned incident to RESOLVED via repository to verify consistency rule elsewhere
    const { updateIncidentStatus } = await import('@/lib/repositories/incident')
    await updateIncidentStatus(inc.incidentCode, 'RESOLVED')
    const stored = await prisma.incident.findUnique({ where: { incidentCode: inc.incidentCode } })
    expect(stored?.status).toBe('RESOLVED')
    expect(stored?.resolvedAt).not.toBeNull()
  })
})
