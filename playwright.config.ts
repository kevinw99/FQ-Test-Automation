import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    timeout: 30000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.api\.spec\.ts/
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*\.api\.spec\.ts/
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /.*\.api\.spec\.ts/
    },
    {
      name: 'api-tests',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3001'
      },
      testMatch: /.*\.api\.spec\.ts/
    }
  ],

  webServer: [
    {
      command: 'cd services/user-service && node server.js',
      port: 3002,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // 3 minutes
    },
    {
      command: 'cd services/transaction-service && node server.js',
      port: 3003,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // 3 minutes
    },
    {
      command: 'cd services/notification-service && node server.js',
      port: 3004,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // 3 minutes
    },
    {
      command: 'cd services/api-gateway && node server.js',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // 3 minutes
    },
    {
      command: 'cd mock-backend && node server.js',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // 3 minutes
    }
  ],
});
