import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';

export function createUserRepository(db) {
  return {
    async findByUsername(username) {
      const row = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, username)
      });
      return row ?? null;
    },

    async findById(id) {
      const row = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, id)
      });
      return row ?? null;
    },

    async findAll() {
      return db.query.users.findMany();
    },

    async save(user) {
      const [row] = await db.insert(users).values(user).returning();
      return row;
    },

    async update(id, data) {
      const [row] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return row;
    },

    async updateLoginState(id, { failedLoginCount, lockedUntil }) {
      const [row] = await db
        .update(users)
        .set({ failedLoginCount, lockedUntil, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return row;
    }
  };
}
