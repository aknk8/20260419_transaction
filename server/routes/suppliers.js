export default async function supplierRoutes(fastify, { supplierService }) {
  fastify.get('/api/suppliers', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return supplierService.listSuppliers({ repository: request.supplierRepository });
  });

  fastify.get('/api/suppliers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await supplierService.getSupplierByCode(request.params.code, {
        repository: request.supplierRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/suppliers', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const supplier = await supplierService.registerSupplier(request.body, {
        repository: request.supplierRepository
      });
      reply.code(201).send(supplier);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/suppliers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await supplierService.updateSupplier(request.params.code, request.body, {
        repository: request.supplierRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
