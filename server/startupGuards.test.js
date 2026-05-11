import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assertProductionSecrets } from './startupGuards.js';

describe('assertProductionSecrets', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalDatabaseUrl = process.env.DATABASE_URL;

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
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
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

  it('should not call process.exit when JWT_SECRET and DATABASE_URL are both set in production', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-key-for-production';
    process.env.DATABASE_URL = 'postgres://localhost/test';

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should call process.exit(1) when NODE_ENV is production and DATABASE_URL is not set', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-key-for-production';
    delete process.env.DATABASE_URL;

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should log FATAL error containing DATABASE_URL when NODE_ENV is production and DATABASE_URL is not set', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-key-for-production';
    delete process.env.DATABASE_URL;

    // Act
    assertProductionSecrets();

    // Assert
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('DATABASE_URL'));
  });

  it('should not call process.exit when NODE_ENV is development and DATABASE_URL is not set', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should not call process.exit for DATABASE_URL when NODE_ENV is production and DATABASE_URL is set', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-key-for-production';
    process.env.DATABASE_URL = 'postgres://localhost/test';

    // Act
    assertProductionSecrets();

    // Assert
    expect(process.exit).not.toHaveBeenCalled();
  });
});
