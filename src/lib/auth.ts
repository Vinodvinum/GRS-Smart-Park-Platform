import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'
import type { User } from 'next-auth'
import './auth-types'

const credentialsSchema = z.object({
  email: z.string().email().max(190).trim().toLowerCase(),
  password: z.string().min(8).max(200),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const authenticated = user as User
        token.id = authenticated.id
        token.role = authenticated.role
        token.isActive = authenticated.isActive
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    authorized({ auth: session }) {
      return Boolean(session)
    },
  },
  providers: [
    Credentials({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null

        if (!user.isActive) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      },
    }),
  ],
})