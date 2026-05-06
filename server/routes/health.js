export default async function healthRoutes(fastify, { db } = {}) {
  fastify.get('/api/health', async (request, reply) => {
    if (db) {
      try {
        await db.query('SELECT 1');
      } catch (err) {
        fastify.log.error(err, 'Health check: DB connection failed');
        return reply.code(503).send({ status: 'error', message: 'DB connection failed' });
      }
    }
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
