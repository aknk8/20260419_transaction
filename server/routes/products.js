export default async function productRoutes(fastify, { productService }) {
  fastify.get('/api/products', {
    preHandler: [fastify.authenticate]
  }, async () => {
    return productService.listProducts();
  });

  fastify.get('/api/products/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await productService.getProductByCode(request.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/products', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    try {
      const product = await productService.registerProduct(request.body);
      reply.code(201).send(product);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/products/:code', {
    preHandler: [fastify.authenticate, fastify.requirePermission('master:edit')]
  }, async (request, reply) => {
    try {
      return await productService.updateProduct(request.params.code, request.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
