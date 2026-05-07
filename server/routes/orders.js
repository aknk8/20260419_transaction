import { paginateArray } from '../db/paginate.js';

export default async function orderRoutes(fastify, { orderService, notificationService, approvalRouteRepository }) {
  fastify.get('/api/orders', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await orderService.listOrders();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/orders/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await orderService.getOrderByCode(req.params.code);
  });

  fastify.post('/api/orders', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const order = await orderService.registerOrder(req.body);
    reply.code(201);
    return order;
  });

  fastify.patch('/api/orders/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await orderService.updateOrder(req.params.code, req.body);
  });

  fastify.post('/api/orders/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'order', action: 'SUBMIT_APPROVAL' } }, async (req) => {
    const result = await orderService.submitOrderApproval(req.params.code, {
      submittedBy: req.user.id
    });
    if (notificationService && approvalRouteRepository) {
      const routes = await approvalRouteRepository.findByDocumentType('order');
      const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
      await notificationService.notifyApprovalRequest('order', req.params.code, approverIds);
    }
    return result;
  });

  fastify.post('/api/orders/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'order', action: 'APPROVE' } }, async (req) => {
    const result = await orderService.approveOrder(req.params.code, req.body?.comment);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyApprovalComplete('order', req.params.code, result.submittedBy);
    }
    return result;
  });

  fastify.post('/api/orders/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'order', action: 'REJECT' } }, async (req) => {
    const result = await orderService.rejectOrder(req.params.code, req.body?.reason);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyRejection('order', req.params.code, result.submittedBy, req.body?.reason);
    }
    return result;
  });
}
