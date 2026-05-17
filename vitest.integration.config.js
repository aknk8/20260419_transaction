import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/**/*.integration.test.js'],
    environment: 'node',
    setupFiles: ['dotenv/config'],
    testTimeout: 30000,
    singleFork: true,
  },
});
