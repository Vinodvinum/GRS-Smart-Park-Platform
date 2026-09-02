import type { SessionUser } from '@/lib/auth-types'

let currentUser: SessionUser | null = null

export function mockAuthUser(user: SessionUser | null) {
  currentUser = user
}

export function __getMockAuthUser() {
  return currentUser
}

export async function mockAuth() {
  return currentUser ? { user: currentUser } : null
}

export async function mockSignIn() {
  return { error: null }
}

export async function mockSignOut() {
  return null
}
