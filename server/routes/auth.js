import bcrypt from 'bcryptjs';
import { authenticate } from '../services/authService.js';

export default async function authRoutes(fastify, { userRepository }) {
  fastify.post('/api/auth/login', {
    config: { entityType: 'auth', action: 'LOGIN', actionOnFailure: 'LOGIN_FAILED' },
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 1 },
          password: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    try {
      const user = await authenticate(username, password, {
        findUser: (u) => userRepository.findByUsername(u),
        comparePassword: bcrypt.compare
      });
      const token = fastify.jwt.sign(
        { id: user.id, name: user.name, userType: user.userType },
        { expiresIn: '15m' }
      );
      reply
        .setCookie('token', token, {
          httpOnly: true,
          sameSite: 'Strict',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 15 * 60
        })
        .send({ user });
    } catch {
      reply.code(401).send({ error: { message: 'ユーザ名またはパスワードが正しくありません' } });
    }
  });

  fastify.post('/api/auth/logout', { config: { entityType: 'auth', action: 'LOGOUT' } }, async (request, reply) => {
    reply
      .clearCookie('token', { path: '/' })
      .send({ message: 'ログアウトしました' });
  });

  fastify.get('/api/auth/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return { user: request.user };
  });
}
