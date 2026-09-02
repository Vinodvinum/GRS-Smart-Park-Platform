import { expect, type Page } from '@playwright/test'

const CREDENTIALS: Record<'GUEST' | 'STAFF' | 'SUPERVISOR' | 'ADMIN', { email: string; password: string }> = {
  GUEST: { email: 'demo.guest@grs.local', password: 'GuestPass!2026' },
  STAFF: { email: 'demo.staff@grs.local', password: 'StaffPass!2026' },
  SUPERVISOR: { email: 'demo.supervisor@grs.local', password: 'SupervisorPass!2026' },
  ADMIN: { email: 'demo.admin@grs.local', password: 'AdminPass!2026' },
}

export type RoleName = keyof typeof CREDENTIALS

export async function signIn(page: Page, role: RoleName, next = '/') {
  await page.goto(`/login?next=${encodeURIComponent(next)}`)
  const creds = CREDENTIALS[role]
  await page.locator('input[type=email]').fill(creds.email)
  await page.locator('input[type=password]').fill(creds.password)
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45000 })
}

export async function signOut(page: Page) {
  await page.context().clearCookies()
}

export function expectSessionMounts(page: Page) {
  return page.getByText('Sign in to GRS.').first()
}
