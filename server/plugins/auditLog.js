import fp from 'fastify-plugin';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function methodToAction(method) {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return method;
}

export const auditLogPlugin = fp(async (fastify, { auditLogRepository }) => {
  fastify.addHook('preHandler', async (request) => {
    if (!MUTATION_METHODS.has(request.method)) return;
    const config = request.routeOptions?.config ?? {};
    request.auditContext = {
      defaultAction:    methodToAction(request.method),
      action:           config.action ?? null,
      actionOnFailure:  config.actionOnFailure ?? null,
      entityType:       config.entityType ?? null,
      ipAddress:        request.headers['x-forwarded-for']?.toString() ?? request.ip ?? null,
      userAgent:        request.headers['user-agent'] ?? null
    };
  });

  fastify.addHook('onSend', async (request, reply, payload) => {
    if (!request.auditContext || request.auditContext.logged) return payload;
    request.auditContext.logged = true;

    const isSuccess = reply.statusCode < 400;
    const entityId = reply.getHeader('x-entity-id')?.toString() ?? null;

    let action;
    if (isSuccess) {
      action = request.auditContext.action ?? request.auditContext.defaultAction;
    } else {
      action = request.auditContext.actionOnFailure ?? request.auditContext.action ?? request.auditContext.defaultAction;
    }

    await auditLogRepository.save({
      userId:      request.user?.id ?? null,
      userName:    request.user?.name ?? null,
      action,
      entityType:  request.auditContext.entityType,
      entityId,
      ipAddress:   request.auditContext.ipAddress,
      userAgent:   request.auditContext.userAgent,
      result:      isSuccess ? 'SUCCESS' : 'FAILURE',
      errorDetail: isSuccess ? null : payload
    });

    return payload;
  });
});
