export default async function receiptRoutes(fastify, { receiptService }) {
  fastify.get('/api/receipts', { preHandler: [fastify.authenticate] }, async () => {
    return receiptService.listReceipts({ repository: null });
  });

  fastify.post('/api/receipts', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const receipt = await receiptService.registerReceipt(req.body, { repository: null });
      reply.code(201).send(receipt);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
