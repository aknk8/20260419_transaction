export default async function settingsRoutes(fastify, { settingsService }) {
  const svc = settingsService;

  fastify.get('/api/settings', { preHandler: [fastify.authenticate] }, async () => {
    return svc.getSettings();
  });

  fastify.put('/api/settings', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.updateSettings(req.body, req.log);
  });
}
