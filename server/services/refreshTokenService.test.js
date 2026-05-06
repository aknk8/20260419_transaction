import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRefreshToken, verifyAndRotate, revokeToken } from './refreshTokenService.js';

const makeRepo = () => ({
  save: vi.fn().mockImplementation(async (r) => ({ ...r, revoked: false })),
  findById: vi.fn(),
  revoke: vi.fn().mockResolvedValue(undefined),
  revokeAllForUser: vi.fn().mockResolvedValue(undefined)
});

describe('createRefreshToken', () => {
  it('should return a token string', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    const tokenId = await createRefreshToken('user01', { repository: repo });

    // Assert
    expect(typeof tokenId).toBe('string');
    expect(tokenId.length).toBeGreaterThan(0);
  });

  it('should save token to repository', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    await createRefreshToken('user01', { repository: repo });

    // Assert
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('should save token with correct userId', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    await createRefreshToken('user01', { repository: repo });

    // Assert
    const saved = repo.save.mock.calls[0][0];
    expect(saved.userId).toBe('user01');
  });

  it('should save token with future expiresAt', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    await createRefreshToken('user01', { repository: repo });

    // Assert
    const saved = repo.save.mock.calls[0][0];
    expect(saved.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should save hashed token not plain token', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    const tokenId = await createRefreshToken('user01', { repository: repo });

    // Assert – stored hash must differ from the plain token ID
    const saved = repo.save.mock.calls[0][0];
    expect(saved.tokenHash).not.toBe(tokenId);
  });
});

describe('verifyAndRotate', () => {
  const userId = 'user01';
  const makeValidRecord = (tokenId) => {
    const crypto = require('crypto');
    return {
      id: tokenId,
      userId,
      tokenHash: crypto.createHash('sha256').update(tokenId).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false
    };
  };

  it('should throw when tokenId is null', async () => {
    // Arrange
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(verifyAndRotate(null, { repository: repo }))
      .rejects.toThrow();
  });

  it('should throw when token is not found', async () => {
    // Arrange
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(verifyAndRotate('unknown-id', { repository: repo }))
      .rejects.toThrow();
  });

  it('should throw and revoke all user tokens when token is already revoked', async () => {
    // Arrange
    const repo = makeRepo();
    const tokenId = 'some-uuid';
    repo.findById.mockResolvedValue({ id: tokenId, userId, tokenHash: 'h', expiresAt: new Date(Date.now() + 1000), revoked: true });

    // Act
    try { await verifyAndRotate(tokenId, { repository: repo }); } catch { /* expected */ }

    // Assert – all user tokens are revoked (theft detection)
    expect(repo.revokeAllForUser).toHaveBeenCalledWith(userId);
  });

  it('should throw when token is expired', async () => {
    // Arrange
    const repo = makeRepo();
    const tokenId = 'some-uuid';
    const crypto = require('crypto');
    repo.findById.mockResolvedValue({
      id: tokenId,
      userId,
      tokenHash: crypto.createHash('sha256').update(tokenId).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
      revoked: false
    });

    // Act & Assert
    await expect(verifyAndRotate(tokenId, { repository: repo }))
      .rejects.toThrow();
  });

  it('should revoke old token on success', async () => {
    // Arrange
    const repo = makeRepo();
    const crypto = require('crypto');
    const tokenId = crypto.randomUUID();
    repo.findById.mockResolvedValue({
      id: tokenId,
      userId,
      tokenHash: crypto.createHash('sha256').update(tokenId).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    // Act
    await verifyAndRotate(tokenId, { repository: repo });

    // Assert
    expect(repo.revoke).toHaveBeenCalledWith(tokenId);
  });

  it('should return new token id and userId on success', async () => {
    // Arrange
    const repo = makeRepo();
    const crypto = require('crypto');
    const tokenId = crypto.randomUUID();
    repo.findById.mockResolvedValue({
      id: tokenId,
      userId,
      tokenHash: crypto.createHash('sha256').update(tokenId).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    // Act
    const result = await verifyAndRotate(tokenId, { repository: repo });

    // Assert
    expect(result.newTokenId).toBeDefined();
    expect(result.userId).toBe(userId);
  });

  it('should save new token after rotation', async () => {
    // Arrange
    const repo = makeRepo();
    const crypto = require('crypto');
    const tokenId = crypto.randomUUID();
    repo.findById.mockResolvedValue({
      id: tokenId,
      userId,
      tokenHash: crypto.createHash('sha256').update(tokenId).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    // Act
    await verifyAndRotate(tokenId, { repository: repo });

    // Assert – save was called to store the new token
    expect(repo.save).toHaveBeenCalledOnce();
  });
});

describe('revokeToken', () => {
  it('should call revoke on the repository', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    await revokeToken('some-token', { repository: repo });

    // Assert
    expect(repo.revoke).toHaveBeenCalledWith('some-token');
  });

  it('should do nothing when tokenId is null', async () => {
    // Arrange
    const repo = makeRepo();

    // Act
    await revokeToken(null, { repository: repo });

    // Assert
    expect(repo.revoke).not.toHaveBeenCalled();
  });
});
