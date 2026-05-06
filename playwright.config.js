import { defineConfig, devices } from '@playwright/test';

const reportRoot = 'C:/tmp/playwright-report';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${reportRoot}/html`, open: 'never' }],
    ['json', { outputFile: `${reportRoot}/results.json` }],
    ['junit', { outputFile: `${reportRoot}/results.xml` }],
  ],
  outputDir: `${reportRoot}/artifacts`,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: process.env.E2E_SCREENSHOT === 'on' ? 'on' : 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
    {
      command: 'npm run server',
      url: 'http://localhost:3000/api/auth/me',
      reuseExistingServer: false,
    },
  ],
});
