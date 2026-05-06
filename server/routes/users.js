import bcrypt from 'bcryptjs';

const userPostBodySchema = {
  type: 'object',
  required: ['id', 'name', 'password', 'userType'],
  additionalProperties: false,
  properties: {
    id:         { type: 'string' },
    name:       { type: 'string' },
    password:   { type: 'string' },
    userType:   { type: 'string' },
    department: { type: 'string' },
    position:   { type: 'string' },
    status:     { type: 'string' }
  }
};

const userPatchBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name:       { type: 'string' },
    password:   { type: 'string' },
    userType:   { type: 'string' },
    department: { type: 'string' },
    position:   { type: 'string' },
    status:     { type: 'string' }
  }
};

export default async function userRoutes(fastify, { userService }) {
  const hashPassword = (password) => bcrypt.hash(password, 10);

  fastify.get('/api/users', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')]
  }, async () => {
    return userService.listUsers();
  });

  fastify.get('/api/users/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')]
  }, async (request, reply) => {
    try {
      return await userService.getUserById(request.params.id);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/users', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')],
    schema: { body: userPostBodySchema }
  }, async (request, reply) => {
    try {
      const user = await userService.registerUser(request.body, { hashPassword });
      reply.code(201).send(user);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/users/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')],
    schema: { body: userPatchBodySchema }
  }, async (request, reply) => {
    try {
      return await userService.updateUser(request.params.id, request.body, { hashPassword });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
