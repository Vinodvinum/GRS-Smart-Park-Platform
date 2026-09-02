import type { UserRole } from '@prisma/client'
import type { DefaultSession } from 'next-auth'

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: UserRole
  isActive: boolean
}

declare module 'next-auth' {
  interface User {
    role: UserRole
    isActive: boolean
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      isActive: boolean
    } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    isActive?: boolean
  }
}