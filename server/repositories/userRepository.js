import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';

export function createInMemoryUserRepository(initialUsers = []) {
  const store = initialUsers.map(u => ({ ...u }));

  return {
    async findByUsername(username) {
      return store.find(u => u.id === username) ?? null;
    },
    async findById(id) {
      return store.find(u => u.id === id) ?? null;
    },
    async findAll() {
      return [...store];
    },
    async save(user) {
      const record = { ...user };
      store.push(record);
      return record;
    },
    async update(id, data) {
      const idx = store.findIndex(u => u.id === id);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], ...data, updatedAt: new Date() };
      return { ...store[idx] };
    },
    async updateLoginState(id, { failedLoginCount, lockedUntil }) {
      const idx = store.findIndex(u => u.id === id);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], failedLoginCount, lockedUntil, updatedAt: new Date() };
      return { ...store[idx] };
    }
  };
}

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
