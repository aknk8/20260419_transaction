export default async function invoiceRoutes(fastify, { invoiceService, notificationService, approvalRouteRepository }) {
  const svc = invoiceService;

  fastify.get('/api/invoices/candidates', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month || month < 1 || month > 12) {
      return reply.code(400).send({ error: { message: 'year と month は必須です（month: 1〜12）' } });
    }
    return svc.listInvoiceCandidates(year, month);
  });

  fastify.get('/api/reports/monthly-summary', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    if (!year || !month || month < 1 || month > 12) {
      return reply.code(400).send({ error: { message: 'year と month は必須です（month: 1〜12）' } });
    }
    return svc.getMonthlySummary(year, month);
  });

  fastify.get('/api/invoices', { preHandler: [fastify.authenticate] }, async () => {
    return svc.listInvoices();
  });

  fastify.get('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.getInvoiceByCode(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const invoice = await svc.registerInvoice(req.body);
      reply.code(201).send(invoice);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.updateInvoice(req.params.code, req.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'invoice', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      const result = await svc.submitInvoiceApproval(req.params.code, {
        submittedBy: req.user.id
      });
      if (notificationService && approvalRouteRepository) {
        const routes = await approvalRouteRepository.findByDocumentType('invoice');
        const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
        await notificationService.notifyApprovalRequest('invoice', req.params.code, approverIds);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'invoice', action: 'APPROVE' } }, async (req, reply) => {
    try {
      const result = await svc.approveInvoice(req.params.code, req.body?.comment);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyApprovalComplete('invoice', req.params.code, result.submittedBy);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'invoice', action: 'REJECT' } }, async (req, reply) => {
    try {
      const result = await svc.rejectInvoice(req.params.code, req.body?.reason);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyRejection('invoice', req.params.code, result.submittedBy, req.body?.reason);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
