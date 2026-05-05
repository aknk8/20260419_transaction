export default async function customerRoutes(fastify, { customerService }) {
  fastify.get('/api/customers', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const customers = await customerService.listCustomers({ repository: request.customerRepository });
    return customers;
  });

  fastify.get('/api/customers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { code } = request.params;
    try {
      return await customerService.getCustomerByCode(code, { repository: request.customerRepository });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/customers', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const customer = await customerService.registerCustomer(request.body, {
        repository: request.customerRepository
      });
      reply.code(201).send(customer);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/customers/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { code } = request.params;
    try {
      return await customerService.updateCustomer(code, request.body, {
        repository: request.customerRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
