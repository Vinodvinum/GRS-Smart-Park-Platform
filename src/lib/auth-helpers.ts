import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { UserRole } from '@prisma/client'
import { auth } from '@/lib/auth'
import { hasRole } from '@/lib/rbac'
import type { SessionUser } from '@/lib/auth-types'

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  const user = session.user as SessionUser
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/')
  return user
}

export async function requireRole(allowed: readonly UserRole[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!hasRole(user.role, allowed)) redirect('/unauthorized')
  return user
}

export function unauthorized(
  message = 'You must be signed in to access this resource.',
): NextResponse {
  return NextResponse.json(
    { error: 'UNAUTHORIZED', message, code: 'UNAUTHENTICATED' },
    { status: 401 },
  )
}

export function forbidden(message = 'You do not have permission to access this resource.'): NextResponse {
  return NextResponse.json(
    { error: 'FORBIDDEN', message, code: 'FORBIDDEN' },
    { status: 403 },
  )
}

export function notFoundResponse(message = 'Resource not found.', code = 'NOT_FOUND'): NextResponse {
  return NextResponse.json(
    { error: 'NOT_FOUND', message, code },
    { status: 404 },
  )
}

export type ApiGuardOk = { user: SessionUser }
export type ApiGuardFail = { response: NextResponse }

export async function requireApiUser(): Promise<ApiGuardOk | ApiGuardFail> {
  const user = await getCurrentUser()
  if (!user) return { response: unauthorized() }
  return { user }
}

export async function requireApiRole(allowed: readonly UserRole[]): Promise<ApiGuardOk | ApiGuardFail> {
  const result = await requireApiUser()
  if ('response' in result) return result
  if (!hasRole(result.user.role, allowed)) return { response: forbidden() }
  return result
}

export function isGuardFailure(
  result: ApiGuardOk | ApiGuardFail,
): result is ApiGuardFail {
  return 'response' in result
}