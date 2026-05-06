export default async function settingsRoutes(fastify, { settingsService }) {
  const svc = settingsService;

  fastify.get('/api/settings', { preHandler: [fastify.authenticate] }, async () => {
    return svc.getSettings();
  });

  fastify.put('/api/settings', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.updateSettings(req.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
