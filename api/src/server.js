import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { noteRoutes } from './routes/notes.js';
import { verifyAccessToken } from './tokens.js';

const app = Fastify({
  logger: {
    level: config.isProduction ? 'info' : 'debug',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.refreshToken',
        'req.body.code',
        'req.body.codeVerifier',
      ],
      remove: true,
    },
  },
  trustProxy: true,
  bodyLimit: 256 * 1024,
  disableRequestLogging: config.isProduction,
});

await app.register(helmet, { contentSecurityPolicy: false });

await app.register(cors, {
  origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  maxAge: 86400,
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
});

app.decorate('authenticate', async (request, reply) => {
  const header = request.headers.authorization ?? '';

  if (!header.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'falta el token' });
  }

  try {
    request.userId = await verifyAccessToken(header.slice(7));
  } catch {
    return reply.code(401).send({ error: 'token invalido o expirado' });
  }
});

app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    return reply.code(400).send({ error: 'los datos enviados no son validos' });
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.code(error.statusCode).send({ error: error.message });
  }

  request.log.error({ err: error }, 'fallo no controlado');
  return reply.code(500).send({ error: 'algo se rompio de nuestro lado' });
});

app.setNotFoundHandler(async (_request, reply) => {
  return reply.code(404).send({ error: 'esa ruta no existe' });
});

await app.register(authRoutes);
await app.register(noteRoutes);

app.get('/health', async () => ({ ok: true }));

try {
  await app.listen({ port: config.port, host: '127.0.0.1' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
