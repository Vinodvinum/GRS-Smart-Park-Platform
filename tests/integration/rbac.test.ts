import { describe, it, expect, afterAll } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

type Role = 'GUEST' | 'STAFF' | 'SUPERVISOR' | 'ADMIN'

function session(role: Role) {
  return { id: `u-${role}`, name: role, email: `${role.toLowerCase()}@test.local`, role, isActive: true }
}

async function runGet(modulePath: string): Promise<{ status: number; body: any }> {
  const mod = await import(modulePath)
  const res = await mod.GET()
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

describe('RBAC authorization matrix', () => {
  afterAll(() => mockAuthUser(null))

  it.each([
    ['staff/snapshot', '@/app/api/staff/snapshot/route', 'GUEST', 403],
    ['staff/snapshot', '@/app/api/staff/snapshot/route', 'STAFF', 200],
    ['staff/snapshot', '@/app/api/staff/snapshot/route', 'SUPERVISOR', 200],
    ['staff/snapshot', '@/app/api/staff/snapshot/route', 'ADMIN', 200],
    ['incidents', '@/app/api/incidents/route', 'GUEST', 403],
    ['incidents', '@/app/api/incidents/route', 'STAFF', 200],
    ['incidents', '@/app/api/incidents/route', 'ADMIN', 200],
    ['admin/snapshot', '@/app/api/admin/snapshot/route', 'GUEST', 403],
    ['admin/snapshot', '@/app/api/admin/snapshot/route', 'STAFF', 403],
    ['admin/snapshot', '@/app/api/admin/snapshot/route', 'SUPERVISOR', 403],
    ['admin/snapshot', '@/app/api/admin/snapshot/route', 'ADMIN', 200],
    ['admin/settings', '@/app/api/admin/settings/route', 'STAFF', 403],
    ['admin/settings', '@/app/api/admin/settings/route', 'SUPERVISOR', 403],
    ['admin/settings', '@/app/api/admin/settings/route', 'ADMIN', 200],
    ['intelligence/snapshot', '@/app/api/intelligence/snapshot/route', 'GUEST', 403],
    ['intelligence/snapshot', '@/app/api/intelligence/snapshot/route', 'STAFF', 200],
    ['intelligence/snapshot', '@/app/api/intelligence/snapshot/route', 'ADMIN', 200],
    ['intelligence/contract', '@/app/api/intelligence/contract/route', 'GUEST', 403],
    ['intelligence/contract', '@/app/api/intelligence/contract/route', 'STAFF', 200],
    ['operations/snapshot', '@/app/api/operations/snapshot/route', 'GUEST', 403],
    ['operations/snapshot', '@/app/api/operations/snapshot/route', 'STAFF', 200],
    ['operations/snapshot', '@/app/api/operations/snapshot/route', 'ADMIN', 200],
    ['db-status', '@/app/api/db-status/route', 'GUEST', 403],
    ['db-status', '@/app/api/db-status/route', 'STAFF', 200],
    ['db-status', '@/app/api/db-status/route', 'ADMIN', 200],
  ])('GET %s as %s -> %i', async (_, path, role, expected) => {
    mockAuthUser(session(role as Role))
    const result = await runGet(path)
    expect(result.status).toBe(expected)
  })

  it('anonymous user gets 401 on protected APIs', async () => {
    mockAuthUser(null)
    for (const path of [
      '@/app/api/staff/snapshot/route',
      '@/app/api/admin/snapshot/route',
      '@/app/api/incidents/route',
      '@/app/api/operations/snapshot/route',
      '@/app/api/intelligence/snapshot/route',
    ]) {
      const result = await runGet(path)
      expect(result.status, `anonymous on ${path}`).toBe(401)
    }
  })
})

describe('staff confirms forbidden response code', () => {
  it('returns JSON error FORBIDDEN', async () => {
    mockAuthUser(session('GUEST'))
    const mod = await import('@/app/api/staff/snapshot/route')
    const res = await mod.GET()
    const body = await res.json()
    expect(res.status).toBe(403)
    expect(body.error).toBe('FORBIDDEN')
  })
})
