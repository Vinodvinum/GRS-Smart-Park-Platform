import { execSync } from 'node:child_process'
import path from 'node:path'

const TEST_DB_URL = 'postgresql://grs:grs_dev_password@localhost:5432/grs_smart_park_test?schema=public'

export default async function globalSetup() {
  const root = path.resolve(__dirname, '..', '..')
  const env = { ...process.env, DATABASE_URL: TEST_DB_URL }
  try {
    execSync('npx prisma migrate deploy', { cwd: root, env, stdio: 'inherit' })
  } catch (err) {
    console.error('E2E globalSetup: prisma migrate deploy failed', err)
    throw err
  }
  try {
    execSync('npx tsx prisma/seed.ts', { cwd: root, env, stdio: 'inherit' })
  } catch (err) {
    console.error('E2E globalSetup: seed failed', err)
    throw err
  }
}
