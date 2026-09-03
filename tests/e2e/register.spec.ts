import { test, expect } from '@playwright/test'
import crypto from 'node:crypto'

function randomEmail() {
  return `reg.${crypto.randomBytes(6).toString('hex')}@test.local`
}

const VALID_PASSWORD = 'SecurePass!2026'

test.describe('Registration form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('NEW GUEST ACCOUNT')).toBeVisible()
  })

  test('matching passwords submit and redirect to login', async ({ page }) => {
    const email = randomEmail()

    await page.getByLabel('Full name').fill('Test Guest')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: false }).first().fill(VALID_PASSWORD)
    await page.getByLabel('Confirm password').fill(VALID_PASSWORD)

    await page.getByRole('button', { name: /Create guest account/i }).click()

    await page.waitForURL(/\/login\?registered=1/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login\?registered=1/)
  })

  test('mismatched passwords show an error and block submission', async ({ page }) => {
    await page.getByLabel('Full name').fill('Test Guest')
    await page.getByLabel('Email address').fill(randomEmail())
    await page.getByLabel('Password', { exact: false }).first().fill('SecurePass!2026')
    await page.getByLabel('Confirm password').fill('DifferentPass!2026')

    await page.getByRole('button', { name: /Create guest account/i }).click()

    const alert = page.getByRole('alert').filter({ hasText: 'Passwords do not match' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Passwords do not match')
    await expect(page).toHaveURL(/\/register/)
  })

  test('password visibility toggle reveals and hides the password field', async ({ page }) => {
    await page.getByLabel('Password', { exact: false }).first().fill('MySecret123')
    await page.getByLabel('Confirm password').fill('MySecret123')

    const showBtn = page.getByRole('button', { name: 'Show password' }).first()
    await expect(showBtn).toBeVisible()

    await showBtn.click()

    const hideBtn = page.getByRole('button', { name: 'Hide password' }).first()
    await expect(hideBtn).toBeVisible()
    const passwordInput = page.getByLabel('Password', { exact: false }).first()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    await hideBtn.click()

    await expect(page.getByRole('button', { name: 'Show password' }).first()).toBeVisible()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
