export default async function testResetRoutes(fastify, { onReset }) {
  fastify.post('/api/test/reset', async (_request, reply) => {
    await onReset();
    return reply.code(204).send();
  });
}
