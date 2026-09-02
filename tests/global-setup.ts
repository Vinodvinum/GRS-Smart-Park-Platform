import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

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

export default function globalSetup() {
  loadEnvFile('.env.test')

  const url = process.env.DATABASE_URL
  if (!url || !url.includes('grs_smart_park_test')) {
    throw new Error(
      'Test database isolation FAILED: DATABASE_URL must point to grs_smart_park_test. ' +
        'Refusing to run tests against the development/production database.',
    )
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env })
  execSync(`npx tsx prisma/seed.ts`, { stdio: 'inherit', env: process.env })

  return () => {
    process.env.DATABASE_URL = undefined
  }
}
