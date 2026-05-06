import { and, eq } from 'drizzle-orm';
import { notifications } from '../db/schema.js';

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
