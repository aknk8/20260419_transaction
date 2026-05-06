import bcrypt from 'bcryptjs';
import { paginateArray } from '../db/paginate.js';

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
  }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await userService.listUsers();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/users/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')]
  }, async (request) => {
    return await userService.getUserById(request.params.id);
  });

  fastify.post('/api/users', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')],
    schema: { body: userPostBodySchema }
  }, async (request, reply) => {
    const user = await userService.registerUser(request.body, { hashPassword });
    reply.code(201);
    return user;
  });

  fastify.patch('/api/users/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('user-permission:edit')],
    schema: { body: userPatchBodySchema }
  }, async (request) => {
    return await userService.updateUser(request.params.id, request.body, { hashPassword });
  });
}
