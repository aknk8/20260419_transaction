import { describe, it, expect } from 'vitest';
import { createSessionRepository } from './sessionRepository.js';

describe('createSessionRepository', () => {
  it('should save and retrieve a session by jti', () => {
    // Arrange
    const repo = createSessionRepository();
    const session = { jti: 'abc-123', userId: 'u01', expiresAt: new Date(), revoked: false };

    // Act
    repo.save(session);
    const found = repo.findByJti('abc-123');

    // Assert
    expect(found).not.toBeNull();
    expect(found.userId).toBe('u01');
  });

  it('should return null when jti does not exist', () => {
    // Arrange
    const repo = createSessionRepository();

    // Act
    const found = repo.findByJti('nonexistent');

    // Assert
    expect(found).toBeNull();
  });

  it('should mark session as revoked when revoke() is called', () => {
    // Arrange
    const repo = createSessionRepository();
    repo.save({ jti: 'abc-123', userId: 'u01', expiresAt: new Date(), revoked: false });

    // Act
    repo.revoke('abc-123');
    const found = repo.findByJti('abc-123');

    // Assert
    expect(found.revoked).toBe(true);
  });

  it('should not throw when revoking non-existent jti', () => {
    // Arrange
    const repo = createSessionRepository();

    // Act & Assert
    expect(() => repo.revoke('nonexistent')).not.toThrow();
  });

  it('should store multiple sessions independently', () => {
    // Arrange
    const repo = createSessionRepository();
    repo.save({ jti: 'jti-1', userId: 'u01', expiresAt: new Date(), revoked: false });
    repo.save({ jti: 'jti-2', userId: 'u02', expiresAt: new Date(), revoked: false });

    // Act
    repo.revoke('jti-1');

    // Assert
    expect(repo.findByJti('jti-1').revoked).toBe(true);
    expect(repo.findByJti('jti-2').revoked).toBe(false);
  });
});
