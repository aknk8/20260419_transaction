export default async function quotationRoutes(fastify, { quotationService, notificationService, approvalRouteRepository }) {
  fastify.get('/api/quotations', { preHandler: [fastify.authenticate] }, async () => {
    return quotationService.listQuotations();
  });

  fastify.get('/api/quotations/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await quotationService.getQuotationByCode(req.params.code);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/quotations', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const quotation = await quotationService.registerQuotation(req.body);
      reply.code(201).send(quotation);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/quotations/:code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      return await quotationService.updateQuotation(req.params.code, req.body);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/quotations/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'quotation', action: 'SUBMIT_APPROVAL' } }, async (req, reply) => {
    try {
      const result = await quotationService.submitQuotationApproval(req.params.code, {
        submittedBy: req.user.id
      });
      if (notificationService && approvalRouteRepository) {
        const routes = await approvalRouteRepository.findByDocumentType('quotation');
        const approverIds = routes.map(r => r.approverUserId).filter(Boolean);
        await notificationService.notifyApprovalRequest('quotation', req.params.code, approverIds);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/quotations/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'quotation', action: 'APPROVE' } }, async (req, reply) => {
    try {
      const result = await quotationService.approveQuotation(req.params.code, req.body?.comment);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyApprovalComplete('quotation', req.params.code, result.submittedBy);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/quotations/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'quotation', action: 'REJECT' } }, async (req, reply) => {
    try {
      const result = await quotationService.rejectQuotation(req.params.code, req.body?.reason);
      if (notificationService && result.submittedBy) {
        await notificationService.notifyRejection('quotation', req.params.code, result.submittedBy, req.body?.reason);
      }
      return result;
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
