import { paginateArray } from '../db/paginate.js';

export default async function invoiceRoutes(fastify, { invoiceService, notificationService, approvalRouteRepository }) {
  const svc = invoiceService;

  fastify.get('/api/invoices/candidates', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month || month < 1 || month > 12) {
      reply.code(400);
      return { error: { message: 'year と month は必須です（month: 1〜12）' } };
    }
    return svc.listInvoiceCandidates(year, month);
  });

  fastify.get('/api/reports/monthly-summary', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month || month < 1 || month > 12) {
      reply.code(400);
      return { error: { message: 'year と month は必須です（month: 1〜12）' } };
    }
    return svc.getMonthlySummary(year, month);
  });

  fastify.get('/api/invoices', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await svc.listInvoices();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.getInvoiceByCode(req.params.code);
  });

  fastify.post('/api/invoices', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const invoice = await svc.registerInvoice(req.body);
    reply.code(201);
    return invoice;
  });

  fastify.patch('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.updateInvoice(req.params.code, req.body);
  });

  fastify.post('/api/invoices/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'invoice', action: 'SUBMIT_APPROVAL' } }, async (req) => {
    const result = await svc.submitInvoiceApproval(req.params.code, {
      submittedBy: req.user.id
    });
    if (notificationService && approvalRouteRepository) {
      const routes = await approvalRouteRepository.findByDocumentType('invoice');
      const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
      await notificationService.notifyApprovalRequest('invoice', req.params.code, approverIds, req.log);
    }
    return result;
  });

  fastify.post('/api/invoices/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'invoice', action: 'APPROVE' } }, async (req) => {
    const result = await svc.approveInvoice(req.params.code, req.body?.comment);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyApprovalComplete('invoice', req.params.code, result.submittedBy, req.log);
    }
    return result;
  });

  fastify.post('/api/invoices/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'invoice', action: 'REJECT' } }, async (req) => {
    const result = await svc.rejectInvoice(req.params.code, req.body?.reason);
    if (notificationService && result.submittedBy) {
      await notificationService.notifyRejection('invoice', req.params.code, result.submittedBy, req.body?.reason, req.log);
    }
    return result;
  });
}
