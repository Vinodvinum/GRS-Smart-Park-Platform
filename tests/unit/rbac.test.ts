import { describe, it, expect } from 'vitest'
import {
  hasRole,
  hasPermission,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
  ADMIN_ROLES,
  ANY_AUTHENTICATED,
  ROLE_PERMISSIONS,
} from '@/lib/rbac'

describe('RBAC helpers', () => {
  describe('hasRole', () => {
    it('returns true when role is in the allowed list', () => {
      expect(hasRole('GUEST', ANY_AUTHENTICATED)).toBe(true)
      expect(hasRole('STAFF', STAFF_ROLES)).toBe(true)
      expect(hasRole('ADMIN', STAFF_ROLES)).toBe(true)
      expect(hasRole('ADMIN', ADMIN_ROLES)).toBe(true)
    })

    it('returns false when role is not in the allowed list', () => {
      expect(hasRole('GUEST', STAFF_ROLES)).toBe(false)
      expect(hasRole('STAFF', SUPERVISOR_ROLES)).toBe(false)
      expect(hasRole('SUPERVISOR', ADMIN_ROLES)).toBe(false)
      expect(hasRole('GUEST', ADMIN_ROLES)).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('grants guest-only permissions to GUEST', () => {
      expect(hasPermission('GUEST', 'guest.booking.create')).toBe(true)
      expect(hasPermission('GUEST', 'guest.service.create')).toBe(true)
      expect(hasPermission('GUEST', 'guest.feedback.submit')).toBe(true)
    })

    it('denies staff/admin permissions to GUEST', () => {
      expect(hasPermission('GUEST', 'operations.view')).toBe(false)
      expect(hasPermission('GUEST', 'incidents.view')).toBe(false)
      expect(hasPermission('GUEST', 'admin.access')).toBe(false)
      expect(hasPermission('GUEST', 'system.status')).toBe(false)
    })

    it('grants operations + staff permissions to STAFF', () => {
      expect(hasPermission('STAFF', 'operations.view')).toBe(true)
      expect(hasPermission('STAFF', 'operations.manage')).toBe(true)
      expect(hasPermission('STAFF', 'qr.validate')).toBe(true)
      expect(hasPermission('STAFF', 'staff.view')).toBe(true)
      expect(hasPermission('STAFF', 'incidents.view')).toBe(true)
      expect(hasPermission('STAFF', 'intelligence.view')).toBe(true)
      expect(hasPermission('STAFF', 'system.status')).toBe(true)
    })

    it('denies incident-manage and admin-access to STAFF', () => {
      expect(hasPermission('STAFF', 'incidents.manage')).toBe(false)
      expect(hasPermission('STAFF', 'admin.access')).toBe(false)
    })

    it('grants incident-manage to SUPERVISOR but not admin-access', () => {
      expect(hasPermission('SUPERVISOR', 'incidents.manage')).toBe(true)
      expect(hasPermission('SUPERVISOR', 'operations.view')).toBe(true)
      expect(hasPermission('SUPERVISOR', 'admin.access')).toBe(false)
    })

    it('grants admin-access only to ADMIN', () => {
      expect(hasPermission('ADMIN', 'admin.access')).toBe(true)
      expect(hasPermission('ADMIN', 'incidents.manage')).toBe(true)
    })
  })

  describe('role constants', () => {
    it('defines the full role hierarchy sets', () => {
      expect(STAFF_ROLES).toEqual(['STAFF', 'SUPERVISOR', 'ADMIN'])
      expect(SUPERVISOR_ROLES).toEqual(['SUPERVISOR', 'ADMIN'])
      expect(ADMIN_ROLES).toEqual(['ADMIN'])
      expect(ANY_AUTHENTICATED).toEqual(['GUEST', 'STAFF', 'SUPERVISOR', 'ADMIN'])
    })

    it('every role has an entry in ROLE_PERMISSIONS', () => {
      for (const role of ['GUEST', 'STAFF', 'SUPERVISOR', 'ADMIN'] as const) {
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
      }
    })
  })
})
