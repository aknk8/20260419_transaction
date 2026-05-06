import { paginateArray } from '../db/paginate.js';

export default async function supplierRoutes(fastify, { supplierService }) {
  fastify.get('/api/suppliers', {
    preHandler: [fastify.authenticate]
  }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await supplierService.listSuppliers();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/suppliers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await supplierService.getSupplierByCode(request.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/suppliers', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    try {
      const supplier = await supplierService.registerSupplier(request.body);
      reply.code(201).send(supplier);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/suppliers/:code', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    try {
      return await supplierService.updateSupplier(request.params.code, request.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
