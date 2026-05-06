export default async function approvalRouteRoutes(fastify, { approvalRouteRepository }) {
  fastify.get('/api/approval-routes', { preHandler: [fastify.authenticate] }, async () => {
    return approvalRouteRepository.findAll();
  });

  fastify.get('/api/approval-routes/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const route = await approvalRouteRepository.findById(Number(req.params.id));
    if (!route) {
      const err = new Error('承認ルートが見つかりません');
      err.statusCode = 404;
      throw err;
    }
    return route;
  });

  fastify.post('/api/approval-routes', { preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')] }, async (req, reply) => {
    const route = await approvalRouteRepository.save(req.body);
    reply.code(201);
    return route;
  });

  fastify.patch('/api/approval-routes/:id', { preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')] }, async (req, reply) => {
    const route = await approvalRouteRepository.update(Number(req.params.id), req.body);
    if (!route) {
      const err = new Error('承認ルートが見つかりません');
      err.statusCode = 404;
      throw err;
    }
    return route;
  });

  fastify.delete('/api/approval-routes/:id', { preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')] }, async (req, reply) => {
    await approvalRouteRepository.remove(Number(req.params.id));
    reply.code(204);
    return null;
  });
}
