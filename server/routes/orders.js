export default async function orderRoutes(fastify, { orderService, notificationService, approvalRouteRepository }) {
  fastify.get('/api/orders', { preHandler: [fastify.authenticate] }, async () => {
    return orderService.listOrders();
  });

  fastify.get('/api/orders/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await orderService.getOrderByCode(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/orders', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const order = await orderService.registerOrder(req.body);
      reply.code(201).send(order);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/orders/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await orderService.updateOrder(req.params.code, req.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/orders/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'order', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      const result = await orderService.submitOrderApproval(req.params.code, {
        submittedBy: req.user.id
      });
      if (notificationService && approvalRouteRepository) {
        const routes = await approvalRouteRepository.findByDocumentType('order');
        const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
        await notificationService.notifyApprovalRequest('order', req.params.code, approverIds);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/orders/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'order', action: 'APPROVE' } }, async (req, reply) => {
    try {
      const result = await orderService.approveOrder(req.params.code, req.body?.comment);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyApprovalComplete('order', req.params.code, result.submittedBy);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/orders/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'order', action: 'REJECT' } }, async (req, reply) => {
    try {
      const result = await orderService.rejectOrder(req.params.code, req.body?.reason);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyRejection('order', req.params.code, result.submittedBy, req.body?.reason);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
