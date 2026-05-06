export default async function notificationRoutes(fastify, { notificationService }) {
  fastify.get('/api/notifications', { preHandler: [fastify.authenticate] }, async (req) => {
    const userId = req.user.id;
    return notificationService.getNotificationsForUser(userId);
  });

  fastify.put('/api/notifications/:id/read', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await notificationService.markAsRead(req.params.id, req.user.id);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/notifications/read-all', { preHandler: [fastify.authenticate] }, async (req) => {
    await notificationService.markAllAsRead(req.user.id);
    return { message: '全件既読にしました' };
  });
}
