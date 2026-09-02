import type { UserRole } from '@prisma/client'

export type Permission =
  | 'guest.booking.create'
  | 'guest.booking.view'
  | 'guest.service.create'
  | 'guest.service.view'
  | 'guest.feedback.submit'
  | 'operations.view'
  | 'operations.manage'
  | 'qr.validate'
  | 'staff.view'
  | 'incidents.view'
  | 'incidents.manage'
  | 'intelligence.view'
  | 'admin.access'
  | 'system.status'

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  GUEST: [
    'guest.booking.create',
    'guest.booking.view',
    'guest.service.create',
    'guest.service.view',
    'guest.feedback.submit',
  ],
  STAFF: [
    'operations.view',
    'operations.manage',
    'qr.validate',
    'staff.view',
    'incidents.view',
    'intelligence.view',
    'system.status',
  ],
  SUPERVISOR: [
    'operations.view',
    'operations.manage',
    'qr.validate',
    'staff.view',
    'incidents.view',
    'incidents.manage',
    'intelligence.view',
    'system.status',
  ],
  ADMIN: [
    'operations.view',
    'operations.manage',
    'qr.validate',
    'staff.view',
    'incidents.view',
    'incidents.manage',
    'intelligence.view',
    'system.status',
    'admin.access',
  ],
}

export const ALL_ROLES: readonly UserRole[] = ['GUEST', 'STAFF', 'SUPERVISOR', 'ADMIN']
export const ANY_AUTHENTICATED: readonly UserRole[] = ALL_ROLES
export const STAFF_ROLES: readonly UserRole[] = ['STAFF', 'SUPERVISOR', 'ADMIN']
export const SUPERVISOR_ROLES: readonly UserRole[] = ['SUPERVISOR', 'ADMIN']
export const ADMIN_ROLES: readonly UserRole[] = ['ADMIN']

export function hasRole(role: UserRole, allowed: readonly UserRole[]): boolean {
  return allowed.includes(role)
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}