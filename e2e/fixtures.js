import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  resetDb: [async ({ request }, use) => {
    const response = await request.post('http://localhost:3000/api/test/reset');
    expect(response.status()).toBe(204);
    await use();
  }, { auto: true, scope: 'test' }]
});

export { expect };
