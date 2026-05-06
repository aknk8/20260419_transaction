export default async function deliveryRoutes(fastify, { deliveryService }) {
  const svc = deliveryService;

  fastify.get('/api/deliveries', { preHandler: [fastify.authenticate] }, async () => {
    return svc.listDeliveries();
  });

  fastify.post('/api/deliveries', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const delivery = await svc.registerDelivery(req.body);
      reply.code(201).send(delivery);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/deliveries/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.updateDelivery(req.params.code, req.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
