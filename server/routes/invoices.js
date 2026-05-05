export default async function invoiceRoutes(fastify, { invoiceService, notificationService, approvalRouteRepository }) {
  const svc = invoiceService;
  const notifRepo = (req) => req.notificationRepository;

  fastify.get('/api/invoices', { preHandler: [fastify.authenticate] }, async () => {
    return svc.listInvoices({ repository: null });
  });

  fastify.get('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.getInvoiceByCode(req.params.code, { repository: null });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const invoice = await svc.registerInvoice(req.body, { repository: null });
      reply.code(201).send(invoice);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/invoices/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await svc.updateInvoice(req.params.code, req.body, { repository: null });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/submit-approval', { preHandler: [fastify.authenticate], config: { entityType: 'invoice', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      const result = await svc.submitInvoiceApproval(req.params.code, {
        repository: null,
        submittedBy: req.user.id
      });
      if (notificationService && approvalRouteRepository) {
        const routes = await approvalRouteRepository.findByDocumentType('invoice');
        const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
        await notificationService.notifyApprovalRequest('invoice', req.params.code, approverIds, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/approve', { preHandler: [fastify.authenticate], config: { entityType: 'invoice', action: 'APPROVE' } }, async (req, reply) => {
    try {
      const result = await svc.approveInvoice(req.params.code, req.body?.comment, { repository: null });
      if (notificationService && result.submittedBy) {
        await notificationService.notifyApprovalComplete('invoice', req.params.code, result.submittedBy, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/invoices/:code/reject', { preHandler: [fastify.authenticate], config: { entityType: 'invoice', action: 'REJECT' } }, async (req, reply) => {
    try {
      const result = await svc.rejectInvoice(req.params.code, req.body?.reason, { repository: null });
      if (notificationService && result.submittedBy) {
        await notificationService.notifyRejection('invoice', req.params.code, result.submittedBy, req.body?.reason, { repository: notifRepo(req) });
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
