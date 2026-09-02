import { vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('@/lib/auth', async () => {
  const authSession = await import('../tests/helpers/auth-session')
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

function loadEnvFile(relative: string) {
  const file = path.resolve(process.cwd(), relative)
  if (!fs.existsSync(file)) return
  const content = fs.readFileSync(file, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const eq = trimmed.indexOf('=')
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.test')

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('grs_smart_park_test')) {
  throw new Error(
    'Test setup FAILED: DATABASE_URL must point to grs_smart_park_test. Refusing to run against other databases.',
  )
}
