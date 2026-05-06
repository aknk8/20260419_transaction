import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assertProductionSecrets } from './startupGuards.js';

describe('assertProductionSecrets', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.spyOn(process, 'exit').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    vi.restoreAllMocks();
  });

  it('should call process.exit(1) when NODE_ENV is production and JWT_SECRET is not set', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should log FATAL error when NODE_ENV is production and JWT_SECRET is not set', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    // Act
    assertProductionSecrets();

    // Assert
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET'));
  });

  it('should not call process.exit when NODE_ENV is development', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should not call process.exit when NODE_ENV is test', () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    delete process.env.JWT_SECRET;

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should not call process.exit when JWT_SECRET is set in production', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-key-for-production';

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });
});
