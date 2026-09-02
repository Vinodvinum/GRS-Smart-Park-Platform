import { test, expect } from '@playwright/test'
import { signIn, signOut } from './helpers'

test.describe('Role-based authorization at the browser layer', () => {
  test('anonymous guest is redirected to login for a protected page', async ({ page }) => {
    await page.goto('/booking')
    await expect(page).toHaveURL(/\/login/)
  })

  test('guest cannot access staff operations page', async ({ page }) => {
    await signIn(page, 'GUEST', '/operations')
    await expect(page).toHaveURL(/\/unauthorized/)
  })

  test('staff can access the operations console', async ({ page }) => {
    await signIn(page, 'STAFF', '/operations')
    await expect(page).toHaveURL(/\/operations$/)
    await expect(page.getByText('LIVE OPERATIONS')).toBeVisible()
  })
})
