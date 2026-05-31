import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.UAT_BASE_URL || 'https://transaction-mgt-production.up.railway.app';
const reportRoot = process.env.UAT_REPORT_ROOT || 'e2e-report/uat';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/uat-staging-scenario.spec.js'],
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${reportRoot}/html`, open: 'never' }],
    ['json', { outputFile: `${reportRoot}/results.json` }],
  ],
  outputDir: `${reportRoot}/artifacts`,
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on',
    video: 'on',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
});
