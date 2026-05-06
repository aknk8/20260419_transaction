import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-report/html', open: 'never' }],
    ['json', { outputFile: 'e2e-report/results.json' }],
    ['junit', { outputFile: 'e2e-report/results.xml' }],
  ],
  outputDir: 'e2e-report/artifacts',
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
      reuseExistingServer: true,
    },
  ],
});
