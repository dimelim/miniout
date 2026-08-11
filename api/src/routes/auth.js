import argon2 from 'argon2';

import { query, queryOne } from '../db.js';
import { createId } from '../ids.js';
import { exchangeOAuthCode } from '../oauth.js';
import {
  issueRefreshToken,
  revokeAllRefreshTokens,
  rotateRefreshToken,
  signAccessToken,
} from '../tokens.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 10;

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

const credentialsSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', maxLength: 320 },
      password: { type: 'string', maxLength: 200 },
      displayName: { type: 'string', maxLength: 80 },
    },
  },
};

async function session(userId) {
  return {
    accessToken: await signAccessToken(userId),
    refreshToken: await issueRefreshToken(userId),
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function authRoutes(app) {
  app.post('/auth/register', { schema: credentialsSchema }, async (request, reply) => {
    const email = normalizeEmail(request.body.email);
    const { password, displayName } = request.body;

    if (!EMAIL_PATTERN.test(email)) {
      return reply.code(400).send({ error: 'ese correo no es valido' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return reply
        .code(400)
        .send({ error: `la contrasena necesita al menos ${MIN_PASSWORD_LENGTH} caracteres` });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = :email', { email });
    if (existing) {
      return reply.code(409).send({ error: 'ya hay una cuenta con ese correo' });
    }

    const id = createId();
    await query(
      `INSERT INTO users (id, email, password_hash, display_name)
       VALUES (:id, :email, :passwordHash, :displayName)`,
      {
        id,
        email,
        passwordHash: await argon2.hash(password, HASH_OPTIONS),
        displayName: displayName?.trim() || null,
      }
    );

    return reply.code(201).send(await session(id));
  });

  app.post('/auth/login', { schema: credentialsSchema }, async (request, reply) => {
    const email = normalizeEmail(request.body.email);
    const user = await queryOne(
      'SELECT id, password_hash FROM users WHERE email = :email',
      { email }
    );

    const hash = user?.password_hash ?? null;
    const matches = hash
      ? await argon2.verify(hash, request.body.password).catch(() => false)
      : await argon2
          .hash(request.body.password, HASH_OPTIONS)
          .then(() => false)
          .catch(() => false);

    if (!user || !matches) {
      return reply.code(401).send({ error: 'correo o contrasena incorrectos' });
    }

    return session(user.id);
  });

  app.post(
    '/auth/refresh',
    {
      schema: {
        body: {
          type: 'object',
          required: ['refreshToken'],
          additionalProperties: false,
          properties: { refreshToken: { type: 'string', maxLength: 200 } },
        },
      },
    },
    async (request, reply) => {
      const rotated = await rotateRefreshToken(request.body.refreshToken);
      if (!rotated) {
        return reply.code(401).send({ error: 'sesion expirada, vuelve a entrar' });
      }
      return {
        accessToken: await signAccessToken(rotated.userId),
        refreshToken: rotated.refreshToken,
      };
    }
  );

  app.post('/auth/logout', { preHandler: app.authenticate }, async (request) => {
    await revokeAllRefreshTokens(request.userId);
    return { ok: true };
  });

  app.post(
    '/auth/oauth/:provider',
    {
      schema: {
        params: {
          type: 'object',
          required: ['provider'],
          properties: { provider: { type: 'string', enum: ['google', 'discord'] } },
        },
        body: {
          type: 'object',
          required: ['code', 'codeVerifier'],
          additionalProperties: false,
          properties: {
            code: { type: 'string', maxLength: 2048 },
            codeVerifier: { type: 'string', maxLength: 256 },
          },
        },
      },
    },
    async (request, reply) => {
      const { provider } = request.params;

      let profile;
      try {
        profile = await exchangeOAuthCode(provider, request.body.code, request.body.codeVerifier);
      } catch (error) {
        request.log.warn({ provider, err: error.message }, 'fallo el intercambio de oauth');
        return reply.code(401).send({ error: 'no se pudo verificar la cuenta' });
      }

      const identity = await queryOne(
        `SELECT user_id FROM identities
         WHERE provider = :provider AND provider_account_id = :accountId`,
        { provider, accountId: profile.accountId }
      );

      if (identity) {
        return session(identity.user_id);
      }

      const byEmail = profile.email
        ? await queryOne('SELECT id FROM users WHERE email = :email', {
            email: normalizeEmail(profile.email),
          })
        : null;

      const userId = byEmail?.id ?? createId();

      if (!byEmail) {
        await query(
          `INSERT INTO users (id, email, display_name)
           VALUES (:id, :email, :displayName)`,
          {
            id: userId,
            email: profile.email ? normalizeEmail(profile.email) : `${provider}:${profile.accountId}`,
            displayName: profile.displayName || null,
          }
        );
      }

      await query(
        `INSERT INTO identities (id, user_id, provider, provider_account_id)
         VALUES (:id, :userId, :provider, :accountId)`,
        { id: createId(), userId, provider, accountId: profile.accountId }
      );

      return session(userId);
    }
  );

  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const user = await queryOne(
      'SELECT id, email, display_name, created_at FROM users WHERE id = :id',
      { id: request.userId }
    );
    if (!user) {
      return reply.code(404).send({ error: 'esa cuenta ya no existe' });
    }
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    };
  });
}
