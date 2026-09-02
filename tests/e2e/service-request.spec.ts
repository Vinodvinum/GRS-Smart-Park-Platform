import { test, expect } from '@playwright/test'
import { signIn } from './helpers'

test.describe('Service request self-service journey', () => {
  test('guest can raise a service request and see it on My Visit', async ({ page }) => {
    await signIn(page, 'GUEST', '/help/new')

    await expect(page.getByText('How can we help?')).toBeVisible()

    const description = `E2E automated request ${Date.now()}`
    await page
      .getByPlaceholder('Tell the team what happened...')
      .fill(description)

    await page.getByRole('button', { name: /Submit Request/i }).click()

    await expect(page.getByText('Request created')).toBeVisible()
    await expect(page.getByText(/is now Open/i)).toBeVisible()

    await page.getByRole('link', { name: /View My Request/i }).click()
    await expect(page).toHaveURL(/\/my-visit/)

    await expect(page.getByText(new RegExp(description))).toBeVisible()
  })
})
