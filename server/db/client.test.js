import { describe, it, expect, vi } from 'vitest';

vi.mock('postgres', () => {
  const sqlFn = Object.assign(() => Promise.resolve([]), {
    unsafe: vi.fn(() => Promise.resolve([{ '?column?': 1 }]))
  });
  return { default: vi.fn(() => sqlFn) };
});
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn((_sql, _opts) => ({ _isMock: true }))
}));

import { createDbClient } from './client.js';

describe('createDbClient', () => {
  it('should return null when url is null', () => {
    // Arrange
    const url = null;

    // Act
    const result = createDbClient(url);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null when url is undefined', () => {
    // Arrange
    const url = undefined;

    // Act
    const result = createDbClient(url);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null when url is empty string', () => {
    // Arrange
    const url = '';

    // Act
    const result = createDbClient(url);

    // Assert
    expect(result).toBeNull();
  });

  it('should return object with db and health when url is valid', () => {
    // Arrange
    const url = 'postgres://localhost/test';

    // Act
    const result = createDbClient(url);

    // Assert
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('db');
    expect(result).toHaveProperty('health');
  });

  it('should include query function in health object when url is valid', () => {
    // Arrange
    const url = 'postgres://localhost/test';

    // Act
    const result = createDbClient(url);

    // Assert
    expect(result.health).toHaveProperty('query');
    expect(typeof result.health.query).toBe('function');
  });
});
