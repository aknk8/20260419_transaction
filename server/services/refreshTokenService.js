import crypto from 'crypto';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId, { repository }) {
  const tokenId = crypto.randomUUID();
  const tokenHash = hashToken(tokenId);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await repository.save({ id: tokenId, userId, tokenHash, expiresAt });
  return tokenId;
}

export async function verifyAndRotate(tokenId, { repository }) {
  if (!tokenId) throw new Error('リフレッシュトークンが見つかりません');

  const record = await repository.findById(tokenId);
  if (!record) throw new Error('無効なリフレッシュトークンです');

  if (record.revoked) {
    await repository.revokeAllForUser(record.userId);
    throw new Error('不正なトークン使用が検出されました');
  }

  if (new Date(record.expiresAt) < new Date()) {
    throw new Error('リフレッシュトークンの有効期限が切れています');
  }

  if (record.tokenHash !== hashToken(tokenId)) {
    throw new Error('無効なリフレッシュトークンです');
  }

  await repository.revoke(tokenId);

  const newTokenId = crypto.randomUUID();
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await repository.save({
    id: newTokenId,
    userId: record.userId,
    tokenHash: hashToken(newTokenId),
    expiresAt: newExpiresAt
  });

  return { newTokenId, userId: record.userId };
}

export async function revokeToken(tokenId, { repository }) {
  if (!tokenId) return;
  await repository.revoke(tokenId);
}
