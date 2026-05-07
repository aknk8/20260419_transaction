import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js', 'server/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.js', 'server/**/*.js'],
      exclude: ['**/*.test.js', 'server/db/seedData.js', 'server/index.js'],
    },
  },
});
