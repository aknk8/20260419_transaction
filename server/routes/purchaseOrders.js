import { paginateArray } from '../db/paginate.js';

export default async function purchaseOrderRoutes(fastify, { purchaseOrderService, notificationService, approvalRouteRepository }) {
  const svc = purchaseOrderService;

  fastify.get('/api/purchase-orders', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await svc.listPurchaseOrders();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/purchase-orders/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.getPurchaseOrderByCode(req.params.code);
  });

  fastify.post('/api/purchase-orders', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const po = await svc.registerPurchaseOrder(req.body);
    reply.code(201);
    return po;
  });

  fastify.patch('/api/purchase-orders/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.updatePurchaseOrder(req.params.code, req.body);
  });

  fastify.post('/api/purchase-orders/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'purchaseOrder', action: 'SUBMIT_APPROVAL' } }, async (req) => {
    const result = await svc.submitPurchaseOrderApproval(req.params.code, {
      submittedBy: req.user.id
    });
    if (notificationService && approvalRouteRepository) {
      const routes = await approvalRouteRepository.findByDocumentType('purchaseOrder');
      const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
      await notificationService.notifyApprovalRequest('purchaseOrder', req.params.code, approverIds, req.log);
    }
    return result;
  });

  fastify.post('/api/purchase-orders/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'purchaseOrder', action: 'APPROVE' } }, async (req) => {
    const result = await svc.approvePurchaseOrder(req.params.code, req.body?.comment);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyApprovalComplete('purchaseOrder', req.params.code, result.submittedBy, req.log);
    }
    return result;
  });

  fastify.post('/api/purchase-orders/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'purchaseOrder', action: 'REJECT' } }, async (req) => {
    const result = await svc.rejectPurchaseOrder(req.params.code, req.body?.reason);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyRejection('purchaseOrder', req.params.code, result.submittedBy, req.body?.reason, req.log);
    }
    return result;
  });
}
