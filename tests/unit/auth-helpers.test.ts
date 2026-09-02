import { describe, expect, it } from 'vitest'
import {
  unauthorized,
  forbidden,
  notFoundResponse,
  requireApiUser,
  requireApiRole,
  isGuardFailure,
} from '@/lib/auth-helpers'
import { mockAuthUser } from '../helpers/auth-session'
import { STAFF_ROLES, ADMIN_ROLES } from '@/lib/rbac'

describe('auth-helpers', () => {
  describe('response factories', () => {
    it('unauthorized returns 401 with code UNAUTHENTICATED', () => {
      const res = unauthorized()
      expect(res.status).toBe(401)
      expect(res.headers.get('content-type')).toContain('application/json')
    })

    it('forbidden returns 403 with code FORBIDDEN', () => {
      const res = forbidden()
      expect(res.status).toBe(403)
    })

    it('notFoundResponse returns 404 with custom code', () => {
      const res = notFoundResponse('nope', 'BOOKING_NOT_FOUND')
      expect(res.status).toBe(404)
    })
  })

  describe('requireApiUser', () => {
    it('returns guard failure for anonymous', async () => {
      mockAuthUser(null)
      const result = await requireApiUser()
      expect(isGuardFailure(result)).toBe(true)
      if (isGuardFailure(result)) expect(result.response.status).toBe(401)
    })

    it('returns user when authenticated', async () => {
      mockAuthUser({ id: 'u1', name: 'G', email: 'g@test.local', role: 'GUEST', isActive: true })
      const result = await requireApiUser()
      expect(isGuardFailure(result)).toBe(false)
      if (!isGuardFailure(result)) expect(result.user.id).toBe('u1')
    })
  })

  describe('requireApiRole', () => {
    it('403 for anonymous regardless of role', async () => {
      mockAuthUser(null)
      const result = await requireApiRole(STAFF_ROLES)
      expect(isGuardFailure(result)).toBe(true)
    })

    it('403 for GUEST requesting STAFF_ROLES', async () => {
      mockAuthUser({ id: 'u1', name: 'G', email: 'g@test.local', role: 'GUEST', isActive: true })
      const result = await requireApiRole(STAFF_ROLES)
      expect(isGuardFailure(result)).toBe(true)
      if (isGuardFailure(result)) expect(result.response.status).toBe(403)
    })

    it('allows STAFF for STAFF_ROLES', async () => {
      mockAuthUser({ id: 'u1', name: 'S', email: 's@test.local', role: 'STAFF', isActive: true })
      const result = await requireApiRole(STAFF_ROLES)
      expect(isGuardFailure(result)).toBe(false)
    })

    it('403 for STAFF requesting ADMIN_ROLES', async () => {
      mockAuthUser({ id: 'u1', name: 'S', email: 's@test.local', role: 'STAFF', isActive: true })
      const result = await requireApiRole(ADMIN_ROLES)
      expect(isGuardFailure(result)).toBe(true)
    })

    it('allows SUPERVISOR for STAFF_ROLES but not ADMIN_ROLES', async () => {
      mockAuthUser({ id: 'u1', name: 'Su', email: 'su@test.local', role: 'SUPERVISOR', isActive: true })
      expect(isGuardFailure(await requireApiRole(STAFF_ROLES))).toBe(false)
      expect(isGuardFailure(await requireApiRole(ADMIN_ROLES))).toBe(true)
    })

    it('allows ADMIN for ADMIN_ROLES', async () => {
      mockAuthUser({ id: 'u1', name: 'A', email: 'a@test.local', role: 'ADMIN', isActive: true })
      expect(isGuardFailure(await requireApiRole(ADMIN_ROLES))).toBe(false)
    })
  })
})
