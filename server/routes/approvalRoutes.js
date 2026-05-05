export default async function approvalRouteRoutes(fastify, { approvalRouteRepository }) {
  fastify.get('/api/approval-routes', { preHandler: [fastify.authenticate] }, async () => {
    return approvalRouteRepository.findAll();
  });

  fastify.get('/api/approval-routes/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const route = await approvalRouteRepository.findById(Number(req.params.id));
    if (!route) return reply.code(404).send({ error: { message: '承認ルートが見つかりません' } });
    return route;
  });

  fastify.post('/api/approval-routes', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const route = await approvalRouteRepository.save(req.body);
    reply.code(201).send(route);
  });

  fastify.patch('/api/approval-routes/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const route = await approvalRouteRepository.update(Number(req.params.id), req.body);
    if (!route) return reply.code(404).send({ error: { message: '承認ルートが見つかりません' } });
    return route;
  });

  fastify.delete('/api/approval-routes/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    await approvalRouteRepository.remove(Number(req.params.id));
    reply.code(204).send();
  });
}
