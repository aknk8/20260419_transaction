import { eq } from 'drizzle-orm';
import { refreshTokens } from '../db/schema.js';

export function createRefreshTokenRepository(db) {
  return {
    async save({ id, userId, tokenHash, expiresAt }) {
      const [row] = await db.insert(refreshTokens).values({ id, userId, tokenHash, expiresAt }).returning();
      return row;
    },

    async findById(id) {
      const row = await db.query.refreshTokens.findFirst({
        where: (t, { eq }) => eq(t.id, id)
      });
      return row ?? null;
    },

    async revoke(id) {
      await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, id));
    },

    async revokeAllForUser(userId) {
      await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
    }
  };
}

export function createInMemoryRefreshTokenRepository() {
  const store = new Map();
  return {
    reset() { store.clear(); },
    async save({ id, userId, tokenHash, expiresAt }) {
      const record = { id, userId, tokenHash, expiresAt, revoked: false, createdAt: new Date() };
      store.set(id, record);
      return record;
    },

    async findById(id) {
      return store.get(id) ?? null;
    },

    async revoke(id) {
      const t = store.get(id);
      if (t) store.set(id, { ...t, revoked: true });
    },

    async revokeAllForUser(userId) {
      for (const [k, t] of store.entries()) {
        if (t.userId === userId) store.set(k, { ...t, revoked: true });
      }
    }
  };
}
