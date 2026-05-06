import { paginateArray } from '../db/paginate.js';

export default async function customerRoutes(fastify, { customerService }) {
  fastify.get('/api/customers', {
    preHandler: [fastify.authenticate]
  }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await customerService.listCustomers();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/customers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { code } = request.params;
    try {
      return await customerService.getCustomerByCode(code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/customers', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    try {
      const customer = await customerService.registerCustomer(request.body, request.log);
      reply.code(201).send(customer);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/customers/:code', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    const { code } = request.params;
    try {
      return await customerService.updateCustomer(code, request.body, request.log);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
