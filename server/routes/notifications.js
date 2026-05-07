import { paginateArray } from '../db/paginate.js';

export default async function notificationRoutes(fastify, { notificationService }) {
  fastify.get('/api/notifications', { preHandler: [fastify.authenticate] }, async (req) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await notificationService.getNotificationsForUser(userId);
    return paginateArray(all, { page, limit });
  });

  fastify.put('/api/notifications/:id/read', { preHandler: [fastify.authenticate] }, async (req) => {
    return await notificationService.markAsRead(req.params.id, req.user.id);
  });

  fastify.post('/api/notifications/read-all', { preHandler: [fastify.authenticate] }, async (req) => {
    await notificationService.markAllAsRead(req.user.id);
    return { message: '全件既読にしました' };
  });
}
