import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js', 'server/**/*.test.js'],
    exclude: ['**/*.integration.test.js', '**/node_modules/**'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.js', 'server/**/*.js'],
      exclude: ['**/*.test.js', 'server/db/seedData.js', 'server/index.js'],
    },
  },
});
