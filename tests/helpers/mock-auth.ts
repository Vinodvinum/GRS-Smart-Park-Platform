import { vi } from 'vitest'

export function installAuthMock() {
  vi.mock('@/lib/auth', async () => {
    const authSession = await import('../helpers/auth-session')
    return {
      auth: authSession.mockAuth,
      signIn: authSession.mockSignIn,
      signOut: authSession.mockSignOut,
      handlers: {
        GET: () => new Response(null, { status: 200 }),
        POST: () => new Response(null, { status: 200 }),
      },
    }
  })
}
