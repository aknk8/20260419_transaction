import { and, eq } from 'drizzle-orm';
import { notifications } from '../db/schema.js';

export function createInMemoryNotificationRepository(initialData = []) {
  const store = initialData.map(r => ({ ...r }));

  return {
    async findByRecipientId(userId) {
      return store
        .filter(n => n.recipientId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(n => ({ ...n }));
    },
    async save(notification) {
      const record = { ...notification };
      store.push(record);
      return record;
    },
    async markAsRead(id) {
      const idx = store.findIndex(n => n.id === id);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], isRead: true };
      return { ...store[idx] };
    },
    async markAllAsRead(userId) {
      for (let i = 0; i < store.length; i++) {
        if (store[i].recipientId === userId && !store[i].isRead) {
          store[i] = { ...store[i], isRead: true };
        }
      }
    },
    async findById(id) {
      return store.find(n => n.id === id) ?? null;
    }
  };
}

export function createNotificationRepository(db) {
  return {
    async findByRecipientId(userId) {
      return db.query.notifications.findMany({
        where: (n, { eq }) => eq(n.recipientId, userId),
        orderBy: (n, { desc }) => [desc(n.createdAt)]
      });
    },

    async save(notification) {
      const [saved] = await db.insert(notifications).values(notification).returning();
      return saved;
    },

    async markAsRead(id) {
      const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      return updated;
    },

    async markAllAsRead(userId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)));
    },

    async findById(id) {
      const row = await db.query.notifications.findFirst({
        where: (n, { eq }) => eq(n.id, id)
      });
      return row ?? null;
    }
  };
}
