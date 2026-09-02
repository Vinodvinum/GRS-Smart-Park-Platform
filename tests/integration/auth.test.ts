import { describe, it, expect } from 'vitest'
import { mockAuthUser } from '../helpers/auth-session'
import { prisma, resetDatabase, uniqueEmail, strongPassword, createUser } from '../helpers/db'
import { useTestDb } from './helpers'

useTestDb()

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/auth/register', () => {
  it('registers a new guest account with status 201', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const email = uniqueEmail()
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'New Guest',
      email,
      password: strongPassword(),
      confirm: strongPassword(),
    }))
    expect(res.status).toBe(201)
    const created = await prisma.user.findUnique({ where: { email } })
    expect(created).not.toBeNull()
  })

  it('forces GUEST role server-side and ignores client-supplied roles', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const email = uniqueEmail()
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Trying Admin',
      email,
      password: strongPassword(),
      confirm: strongPassword(),
      role: 'ADMIN',
    }))
    expect(res.status).toBe(201)
    const created = await prisma.user.findUnique({ where: { email } })
    expect(created?.role).toBe('GUEST')
  })

  it('returns 400 for invalid email format', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Bad',
      email: 'not-an-email',
      password: strongPassword(),
      confirm: strongPassword(),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for short password', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Bad',
      email: uniqueEmail(),
      password: 'short',
      confirm: 'short',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when password and confirm do not match', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Bad',
      email: uniqueEmail(),
      password: strongPassword(),
      confirm: strongPassword() + 'x',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    mockAuthUser(null)
    const existing = await createUser({ email: 'dup@test.local' })
    expect(existing).toBeTruthy()
    const route = await import('@/app/api/auth/register/route')
    const res = await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Dup',
      email: 'dup@test.local',
      password: strongPassword(),
      confirm: strongPassword(),
    }))
    expect(res.status).toBe(409)
  })

  it('stores a bcrypt hash, never a plaintext password', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const email = uniqueEmail()
    await route.POST(jsonRequest('http://localhost/api/auth/register', {
      name: 'Hash Check',
      email,
      password: strongPassword(),
      confirm: strongPassword(),
    }))
    const created = await prisma.user.findUnique({ where: { email } })
    expect(created?.passwordHash).toBeTruthy()
    expect(created?.passwordHash).toMatch(/^\$2[aby]\$/)
    expect(created?.passwordHash).not.toContain(strongPassword())
  })

  it('empty body returns graceful 400', async () => {
    mockAuthUser(null)
    const route = await import('@/app/api/auth/register/route')
    const res = await route.POST(new Request('http://localhost/api/auth/register', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }))
    expect(res.status).toBe(400)
  })
})
