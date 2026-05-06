import { paginateArray } from '../db/paginate.js';

export default async function deliveryRoutes(fastify, { deliveryService }) {
  const svc = deliveryService;

  fastify.get('/api/deliveries', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await svc.listDeliveries();
    return paginateArray(all, { page, limit });
  });

  fastify.post('/api/deliveries', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const delivery = await svc.registerDelivery(req.body);
    reply.code(201);
    return delivery;
  });

  fastify.patch('/api/deliveries/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.updateDelivery(req.params.code, req.body);
  });
}
