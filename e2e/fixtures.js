import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  resetDb: [async ({ request }, use) => {
    await request.post('http://localhost:3000/api/test/reset');
    await use();
  }, { auto: true, scope: 'test' }]
});

export { expect };
