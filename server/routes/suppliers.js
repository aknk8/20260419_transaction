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
  }, async (request) => {
    return await supplierService.getSupplierByCode(request.params.code);
  });

  fastify.post('/api/suppliers', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    const supplier = await supplierService.registerSupplier(request.body);
    reply.code(201);
    return supplier;
  });

  fastify.patch('/api/suppliers/:code', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request) => {
    return await supplierService.updateSupplier(request.params.code, request.body);
  });
}
