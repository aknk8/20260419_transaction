export default async function purchaseOrderRoutes(fastify, { purchaseOrderService, notificationService, approvalRouteRepository }) {
  const svc = purchaseOrderService;
  const notifRepo = (req) => req.notificationRepository;

  fastify.get('/api/purchase-orders', { preHandler: [fastify.authenticate] }, async () => {
    return svc.listPurchaseOrders({ repository: null });
  });

  fastify.get('/api/purchase-orders/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.getPurchaseOrderByCode(req.params.code, { repository: null });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/purchase-orders', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const po = await svc.registerPurchaseOrder(req.body, { repository: null });
      reply.code(201).send(po);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/purchase-orders/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.updatePurchaseOrder(req.params.code, req.body, { repository: null });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/purchase-orders/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'purchaseOrder', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      const result = await svc.submitPurchaseOrderApproval(req.params.code, {
        repository: null,
        submittedBy: req.user.id
      });
      if (notificationService && approvalRouteRepository) {
        const routes = await approvalRouteRepository.findByDocumentType('purchaseOrder');
        const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
        await notificationService.notifyApprovalRequest('purchaseOrder', req.params.code, approverIds, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/purchase-orders/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'purchaseOrder', action: 'APPROVE' } }, async (req, reply) => {
    try {
      const result = await svc.approvePurchaseOrder(req.params.code, req.body?.comment, { repository: null });
      if (notificationService && result.submittedBy) {
        await notificationService.notifyApprovalComplete('purchaseOrder', req.params.code, result.submittedBy, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/purchase-orders/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'purchaseOrder', action: 'REJECT' } }, async (req, reply) => {
    try {
      const result = await svc.rejectPurchaseOrder(req.params.code, req.body?.reason, { repository: null });
      if (notificationService && result.submittedBy) {
        await notificationService.notifyRejection('purchaseOrder', req.params.code, result.submittedBy, req.body?.reason, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
