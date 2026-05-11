import { describe, it, expect } from 'vitest';
import { buildProductionSeedSql } from './seedProduction.js';

describe('buildProductionSeedSql', () => {
  it('should return a non-empty SQL string', () => {
    // Arrange
    const options = { adminPasswordHash: '$2b$10$somehashedpassword' };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(typeof sql).toBe('string');
    expect(sql.length).toBeGreaterThan(0);
  });

  it('should include BEGIN and COMMIT for transactional execution', () => {
    // Arrange
    const options = { adminPasswordHash: '$2b$10$somehashedpassword' };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(sql).toContain('BEGIN;');
    expect(sql).toContain('COMMIT;');
  });

  it('should insert admin user with ON CONFLICT DO NOTHING for idempotency', () => {
    // Arrange
    const hash = '$2b$10$somehashedpassword';
    const options = { adminPasswordHash: hash };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(sql).toContain("INSERT INTO users");
    expect(sql).toContain("ON CONFLICT");
    expect(sql).toContain("DO NOTHING");
  });

  it('should embed the provided password hash into the SQL', () => {
    // Arrange
    const hash = '$2b$10$unique-test-hash-abc123';
    const options = { adminPasswordHash: hash };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(sql).toContain(hash);
  });

  it('should set admin user_type to システム管理者', () => {
    // Arrange
    const options = { adminPasswordHash: '$2b$10$somehashedpassword' };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(sql).toContain('システム管理者');
  });

  it('should set admin status to 有効', () => {
    // Arrange
    const options = { adminPasswordHash: '$2b$10$somehashedpassword' };

    // Act
    const sql = buildProductionSeedSql(options);

    // Assert
    expect(sql).toContain('有効');
  });

  it('should throw when adminPasswordHash is not provided', () => {
    // Arrange & Act & Assert
    expect(() => buildProductionSeedSql({})).toThrow();
  });

  it('should throw when adminPasswordHash is empty string', () => {
    // Arrange & Act & Assert
    expect(() => buildProductionSeedSql({ adminPasswordHash: '' })).toThrow();
  });
});
