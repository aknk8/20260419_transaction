export default async function notificationRoutes(fastify, { notificationService }) {
  const repo = (req) => req.notificationRepository;

  fastify.get('/api/notifications', { preHandler: [fastify.authenticate] }, async (req) => {
    const userId = req.user.id;
    return notificationService.getNotificationsForUser(userId, { repository: repo(req) });
  });

  fastify.put('/api/notifications/:id/read', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await notificationService.markAsRead(req.params.id, { repository: repo(req) });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
