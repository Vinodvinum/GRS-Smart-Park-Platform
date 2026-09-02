import { test, expect } from '@playwright/test'
import { signIn } from './helpers'

async function waitForExperiences(page: import('@playwright/test').Page) {
  const select = page.getByRole('combobox')
  await expect(select).toHaveValue(/.+/)
  await expect(select.locator('option').filter({ hasNotText: 'Loading…' }).first()).toHaveCount(1)
}

test.describe('Guest booking → digital pass (happy path)', () => {
  test('guest can create a booking and view their digital pass', async ({ page }) => {
    await signIn(page, 'GUEST', '/booking')

    await expect(page.getByText('Reserve your day.')).toBeVisible()
    await expect(page.getByText('BOOKING CONFIRMED')).not.toBeVisible()
    await waitForExperiences(page)

    await page.getByRole('button', { name: /Review booking/i }).click()
    await expect(page.getByText('Review your booking.')).toBeVisible()

    await page.getByRole('button', { name: /Confirm booking/i }).click()
    await expect(page.getByText('BOOKING CONFIRMED')).toBeVisible()
    await expect(page.getByText("You're all set.")).toBeVisible()
  })

  test('guest digital pass page reflects the booking made in-session', async ({ page }) => {
    await signIn(page, 'GUEST', '/booking')
    await waitForExperiences(page)
    await page.getByRole('button', { name: /Review booking/i }).click()
    await page.getByRole('button', { name: /Confirm booking/i }).click()
    await expect(page.getByText('BOOKING CONFIRMED')).toBeVisible()

    await page.getByRole('link', { name: /Open Digital Pass/i }).click()
    await expect(page).toHaveURL(/\/pass$/)
  })
})
