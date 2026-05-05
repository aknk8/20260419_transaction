import bcrypt from 'bcryptjs';

export default async function userRoutes(fastify, { userService }) {
  const hashPassword = (password) => bcrypt.hash(password, 10);

  fastify.get('/api/users', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return userService.listUsers({ repository: request.userRepository });
  });

  fastify.get('/api/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await userService.getUserById(request.params.id, {
        repository: request.userRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/users', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await userService.registerUser(request.body, {
        repository: request.userRepository,
        hashPassword
      });
      reply.code(201).send(user);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await userService.updateUser(request.params.id, request.body, {
        repository: request.userRepository,
        hashPassword
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
