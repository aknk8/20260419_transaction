import { paginateArray } from '../db/paginate.js';

export default async function quotationRoutes(fastify, { quotationService, notificationService, approvalRouteRepository }) {
  fastify.get('/api/quotations', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await quotationService.listQuotations();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/quotations/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await quotationService.getQuotationByCode(req.params.code);
  });

  fastify.post('/api/quotations', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const quotation = await quotationService.registerQuotation(req.body);
    reply.code(201);
    return quotation;
  });

  fastify.patch('/api/quotations/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await quotationService.updateQuotation(req.params.code, req.body);
  });

  fastify.post('/api/quotations/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'quotation', action: 'SUBMIT_APPROVAL' } }, async (req) => {
    const result = await quotationService.submitQuotationApproval(req.params.code, {
      submittedBy: req.user.id
    });
    if (notificationService && approvalRouteRepository) {
      const routes = await approvalRouteRepository.findByDocumentType('quotation');
      const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
      await notificationService.notifyApprovalRequest('quotation', req.params.code, approverIds, req.log);
    }
    return result;
  });

  fastify.post('/api/quotations/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'quotation', action: 'APPROVE' } }, async (req) => {
    const result = await quotationService.approveQuotation(req.params.code, req.body?.comment);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyApprovalComplete('quotation', req.params.code, result.submittedBy, req.log);
    }
    return result;
  });

  fastify.post('/api/quotations/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'quotation', action: 'REJECT' } }, async (req) => {
    const result = await quotationService.rejectQuotation(req.params.code, req.body?.reason);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyRejection('quotation', req.params.code, result.submittedBy, req.body?.reason, req.log);
    }
    return result;
  });
}
