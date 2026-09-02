import { test, expect } from '@playwright/test'
import { signIn, type RoleName } from './helpers'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

type SignInRole = RoleName

test.describe('Phase 6 UI / accessibility regression', () => {
  test('operations QR validate dialog is accessible from the keyboard', async ({ page }) => {
    await signIn(page, 'STAFF', '/operations')
    await expect(page.getByRole('button', { name: /QR Validate/i })).toBeVisible()

    await page.getByRole('button', { name: /QR Validate/i }).click()

    const dialog = page.getByRole('dialog', { name: /Validate digital pass/i })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(page.getByRole('button', { name: /^Close$/ })).toBeFocused()

    const focusInside = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')
      return !!d && d.contains(document.activeElement)
    })
    expect(focusInside).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: /QR Validate/i })).toBeFocused()
  })
  test('no horizontal overflow on critical screens at supported viewports', async ({ browser }) => {
    const screens: Array<{ role: SignInRole; path: string }> = [
      { role: 'GUEST', path: '/booking' },
      { role: 'GUEST', path: '/help/new' },
      { role: 'STAFF', path: '/operations' },
      { role: 'SUPERVISOR', path: '/incidents' },
      { role: 'ADMIN', path: '/admin' },
    ]

    // One session per role (kept within the dev AUTH rate limit by not re-logging-in),
    // resized across supported viewports to assert no horizontal overflow.
    for (const role of ['GUEST', 'STAFF', 'SUPERVISOR', 'ADMIN'] as const) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await context.newPage()
      const roleScreens = screens.filter((s) => s.role === role)
      await signIn(page, role, roleScreens[0].path)
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        for (const { path } of roleScreens) {
          await page.goto(path)
          await page.waitForLoadState('domcontentloaded')
          await page.waitForTimeout(200)
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          )
          expect(
            overflow,
            `${path} overflows horizontally by ${overflow}px at ${viewport.name} (${viewport.width}px)`
          ).toBeLessThanOrEqual(0)
        }
      }
      await context.close()
    }
  })
})
