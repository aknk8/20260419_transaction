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
  }, async (request) => {
    const { code } = request.params;
    return await customerService.getCustomerByCode(code);
  });

  fastify.post('/api/customers', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    const customer = await customerService.registerCustomer(request.body, request.log);
    reply.code(201);
    return customer;
  });

  fastify.patch('/api/customers/:code', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request) => {
    const { code } = request.params;
    return await customerService.updateCustomer(code, request.body, request.log);
  });
}
