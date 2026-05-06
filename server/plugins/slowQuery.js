import fp from 'fastify-plugin';

export const slowQueryPlugin = fp(async (fastify, { thresholdMs = 500 } = {}) => {
  fastify.addHook('onResponse', async (request, reply) => {
    if (reply.elapsedTime > thresholdMs) {
      fastify.log.warn(
        { method: request.method, url: request.url, responseTime: Math.round(reply.elapsedTime) },
        'slow request detected'
      );
    }
  });
});
