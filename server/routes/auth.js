import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { authenticate } from '../services/authService.js';
import { verifyAndRotate } from '../services/refreshTokenService.js';

export default async function authRoutes(fastify, { userRepository, sessionRepository, refreshTokenRepository }) {
  fastify.post('/api/auth/login', {
    config: {
      entityType: 'auth',
      action: 'LOGIN',
      actionOnFailure: 'LOGIN_FAILED',
      // Strict login rate limit only in production; dev/test relies on the global limit
      //...(process.env.NODE_ENV === 'production' && { rateLimit: { max: 5, timeWindow: '1 minute' } })
      rateLimit: { max: 5, timeWindow: '1 minute' }
    },
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
        comparePassword: bcrypt.compare,
        updateLoginState: (id, state) => userRepository.updateLoginState(id, state)
      });
      const jti = randomUUID();
      const token = fastify.jwt.sign(
        { id: user.id, name: user.name, userType: user.userType, permissions: user.permissions, jti },
        { expiresIn: '8h' }
      );
      if (sessionRepository) {
        sessionRepository.save({
          jti,
          userId: user.id,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
          revoked: false
        });
      }
      reply.setCookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 8 * 60 * 60
      });
      return { user };
    } catch {
      const err = new Error('ユーザ名またはパスワードが正しくありません');
      err.statusCode = 401;
      throw err;
    }
  });

  fastify.post('/api/auth/logout', { config: { entityType: 'auth', action: 'LOGOUT' } }, async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true });
      const jti = request.user?.jti;
      if (jti && sessionRepository) {
        sessionRepository.revoke(jti);
      }
    } catch {
      // Proceed with logout regardless of token validity
    }
    reply.clearCookie('token', { path: '/' });
    return { message: 'ログアウトしました' };
  });

  fastify.post('/api/auth/refresh-token', async (request, reply) => {
    const tokenId = request.cookies.refreshToken;
    try {
      const { newTokenId, userId } = await verifyAndRotate(tokenId, { repository: refreshTokenRepository });
      const user = await userRepository.findById(userId);
      const jti = randomUUID();
      const token = fastify.jwt.sign(
        { id: user.id, name: user.name, userType: user.userType, jti },
        { expiresIn: '8h' }
      );
      if (sessionRepository) {
        sessionRepository.save({ jti, userId: user.id, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), revoked: false });
      }
      reply.setCookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 8 * 60 * 60
      });
      reply.setCookie('refreshToken', newTokenId, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth/refresh-token',
        maxAge: 7 * 24 * 60 * 60
      });
      return { message: 'トークンを更新しました' };
    } catch {
      const err = new Error('再認証が必要です');
      err.statusCode = 401;
      throw err;
    }
  });

  fastify.get('/api/auth/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return { user: request.user };
  });
}
