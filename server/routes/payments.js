export default async function paymentRoutes(fastify, { paymentService }) {
  const svc = paymentService;

  fastify.post('/api/payments/:code/cancel', { preHandler: [fastify.authenticate], config: { entityType: 'payment', action: 'CANCEL' } }, async (req, reply) => {
    try {
      return await svc.cancelPayment(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.get('/api/payments', { preHandler: [fastify.authenticate] }, async () => {
    return svc.listPayments();
  });

  fastify.get('/api/payments/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.getPaymentByCode(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/payments', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const payment = await svc.registerPayment(req.body);
      reply.code(201).send(payment);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/payments/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'payment', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      return await svc.submitPaymentApproval(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/payments/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'payment', action: 'APPROVE' } }, async (req, reply) => {
    try {
      return await svc.approvePayment(req.params.code, req.body?.comment);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/payments/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'payment', action: 'REJECT' } }, async (req, reply) => {
    try {
      return await svc.rejectPayment(req.params.code, req.body?.reason);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/payments/:code/register', { preHandler: [fastify.authenticate, fastify.requirePermission('payment:edit')], config: { entityType: 'payment', action: 'REGISTER' } }, async (req, reply) => {
    try {
      return await svc.registerPaymentResult(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
