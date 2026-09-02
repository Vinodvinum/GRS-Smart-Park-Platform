import { defineConfig, devices } from '@playwright/test'

const TEST_DB_URL = 'postgresql://grs:grs_dev_password@localhost:5432/grs_smart_park_test?schema=public'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: { timeout: 20000 },
  globalSetup: './tests/e2e/global-setup.ts',
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npx next dev -p 3100',
    url: 'http://localhost:3100/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL: TEST_DB_URL,
      PORT: '3100',
    },
  },
})
