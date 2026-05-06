export default async function supplierRoutes(fastify, { supplierService }) {
  fastify.get('/api/suppliers', {
    preHandler: [fastify.authenticate]
  }, async () => {
    return supplierService.listSuppliers();
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
