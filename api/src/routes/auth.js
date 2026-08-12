import argon2 from 'argon2';

import { config } from '../config.js';
import { decrypt, encrypt } from '../crypto.js';
import { query, queryOne } from '../db.js';
import { createHandoff, redeemHandoff } from '../handoff.js';
import { createId } from '../ids.js';
import { authorizeUrl, fetchProfile, isConfigured, signState, verifyState } from '../oauth.js';
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

const ESTRICTO = {
  rateLimit: { max: 10, timeWindow: '5 minutes' },
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

async function session(userId, isNew = false) {
  return {
    accessToken: await signAccessToken(userId),
    refreshToken: await issueRefreshToken(userId),
    isNew,
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function findAccount(userId) {
  const user = await queryOne(
    `SELECT id, email, display_name, avatar_url, password_hash, intro_seen_at, created_at
     FROM users WHERE id = :id`,
    { id: userId }
  );

  if (!user) return null;

  const identities = await query(
    'SELECT provider, avatar_url FROM identities WHERE user_id = :id ORDER BY created_at ASC',
    { id: userId }
  );

  return {
    id: user.id,
    email: user.email,
    displayName: decrypt(user.display_name),
    avatarUrl: user.avatar_url,
    photos: identities
      .filter((identity) => identity.avatar_url)
      .map((identity) => ({ provider: identity.provider, url: identity.avatar_url })),
    hasPassword: Boolean(user.password_hash),
    providers: identities.map((identity) => identity.provider),
    introSeen: Boolean(user.intro_seen_at),
    createdAt: user.created_at,
  };
}

async function linkAccount(provider, profile) {
  const identity = await queryOne(
    `SELECT user_id FROM identities
     WHERE provider = :provider AND provider_account_id = :accountId`,
    { provider, accountId: profile.accountId }
  );

  if (identity) {
    await query(
      `UPDATE identities SET avatar_url = :avatarUrl
       WHERE provider = :provider AND provider_account_id = :accountId`,
      { avatarUrl: profile.avatarUrl ?? null, provider, accountId: profile.accountId }
    );

    await query(
      `UPDATE users SET avatar_url = :avatarUrl
       WHERE id = :id AND avatar_url IS NULL`,
      { avatarUrl: profile.avatarUrl ?? null, id: identity.user_id }
    );

    return { userId: identity.user_id, isNew: false };
  }

  const byEmail = profile.email
    ? await queryOne('SELECT id FROM users WHERE email = :email', {
        email: normalizeEmail(profile.email),
      })
    : null;

  const userId = byEmail?.id ?? createId();

  if (!byEmail) {
    await query(
      `INSERT INTO users (id, email, display_name, avatar_url)
       VALUES (:id, :email, :displayName, :avatarUrl)`,
      {
        id: userId,
        email: profile.email
          ? normalizeEmail(profile.email)
          : `${provider}:${profile.accountId}`,
        displayName: profile.displayName ? encrypt(profile.displayName) : null,
        avatarUrl: profile.avatarUrl ?? null,
      }
    );
  } else {
    await query(
      'UPDATE users SET avatar_url = :avatarUrl WHERE id = :id AND avatar_url IS NULL',
      { avatarUrl: profile.avatarUrl ?? null, id: userId }
    );
  }

  await query(
    `INSERT INTO identities (id, user_id, provider, provider_account_id, avatar_url)
     VALUES (:id, :userId, :provider, :accountId, :avatarUrl)`,
    {
      id: createId(),
      userId,
      provider,
      accountId: profile.accountId,
      avatarUrl: profile.avatarUrl ?? null,
    }
  );

  return { userId, isNew: !byEmail };
}

export async function authRoutes(app) {
  app.post('/auth/register', { schema: credentialsSchema, config: ESTRICTO }, async (request, reply) => {
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
        displayName: displayName?.trim() ? encrypt(displayName.trim()) : null,
      }
    );

    return reply.code(201).send(await session(id, true));
  });

  app.post('/auth/login', { schema: credentialsSchema, config: ESTRICTO }, async (request, reply) => {
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

  const providerParams = {
    type: 'object',
    required: ['provider'],
    properties: { provider: { type: 'string', enum: ['google', 'discord'] } },
  };

  app.get(
    '/auth/:provider/start',
    { schema: { params: providerParams } },
    async (request, reply) => {
      const { provider } = request.params;

      if (!isConfigured(provider)) {
        return reply.code(503).send({ error: `${provider} no esta configurado` });
      }

      return reply.redirect(authorizeUrl(provider, await signState(provider)), 302);
    }
  );

  app.get(
    '/auth/:provider/callback',
    {
      schema: {
        params: providerParams,
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string', maxLength: 2048 },
            state: { type: 'string', maxLength: 2048 },
            error: { type: 'string', maxLength: 200 },
          },
        },
      },
    },
    async (request, reply) => {
      const { provider } = request.params;
      const { code, state } = request.query;

      const back = (params) =>
        reply.redirect(`${config.appRedirect}?${new URLSearchParams(params).toString()}`, 302);

      if (request.query.error || !code || !state) {
        return back({ error: 'cancelado' });
      }

      let profile;
      try {
        await verifyState(state, provider);
        profile = await fetchProfile(provider, code);
      } catch (error) {
        request.log.warn({ provider, err: error.message }, 'fallo el intercambio de oauth');
        return back({ error: 'no_verificado' });
      }

      const { userId, isNew } = await linkAccount(provider, profile);
      return back({ code: await createHandoff(userId, isNew) });
    }
  );

  app.post(
    '/auth/exchange',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code'],
          additionalProperties: false,
          properties: { code: { type: 'string', maxLength: 200 } },
        },
      },
    },
    async (request, reply) => {
      const redeemed = await redeemHandoff(request.body.code);

      if (!redeemed) {
        return reply.code(401).send({ error: 'ese codigo ya no sirve, vuelve a entrar' });
      }

      return session(redeemed.userId, redeemed.isNew);
    }
  );

  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const account = await findAccount(request.userId);

    if (!account) {
      return reply.code(404).send({ error: 'esa cuenta ya no existe' });
    }

    return account;
  });

  app.patch(
    '/me',
    {
      preHandler: app.authenticate,
      schema: {
        body: {
          type: 'object',
          minProperties: 1,
          additionalProperties: false,
          properties: {
            displayName: { type: 'string', maxLength: 80 },
            introSeen: { type: 'boolean' },
            avatarUrl: { type: ['string', 'null'], maxLength: 500 },
          },
        },
      },
    },
    async (request, reply) => {
      if (request.body.avatarUrl !== undefined) {
        const avatarUrl = request.body.avatarUrl;

        if (avatarUrl !== null) {
          const known = await queryOne(
            `SELECT 1 AS ok FROM identities
             WHERE user_id = :id AND avatar_url = :avatarUrl`,
            { id: request.userId, avatarUrl }
          );

          if (!known) {
            return reply.code(400).send({ error: 'esa foto no es de tu cuenta' });
          }
        }

        await query('UPDATE users SET avatar_url = :avatarUrl WHERE id = :id', {
          avatarUrl,
          id: request.userId,
        });
      }

      if (request.body.displayName !== undefined) {
        const displayName = request.body.displayName.trim();

        if (!displayName) {
          return reply.code(400).send({ error: 'escribe un nombre' });
        }

        await query('UPDATE users SET display_name = :displayName WHERE id = :id', {
          displayName: encrypt(displayName),
          id: request.userId,
        });
      }

      if (request.body.introSeen !== undefined) {
        await query(
          'UPDATE users SET intro_seen_at = :seen WHERE id = :id',
          { seen: request.body.introSeen ? new Date() : null, id: request.userId }
        );
      }

      const account = await findAccount(request.userId);

      if (!account) {
        return reply.code(404).send({ error: 'esa cuenta ya no existe' });
      }

      return account;
    }
  );

  app.post(
    '/auth/password',
    {
      preHandler: app.authenticate,
      config: ESTRICTO,
      schema: {
        body: {
          type: 'object',
          required: ['newPassword'],
          additionalProperties: false,
          properties: {
            currentPassword: { type: 'string', maxLength: 200 },
            newPassword: { type: 'string', maxLength: 200 },
          },
        },
      },
    },
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body;

      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return reply
          .code(400)
          .send({ error: `la contrasena necesita al menos ${MIN_PASSWORD_LENGTH} caracteres` });
      }

      const user = await queryOne('SELECT password_hash FROM users WHERE id = :id', {
        id: request.userId,
      });

      if (!user) {
        return reply.code(404).send({ error: 'esa cuenta ya no existe' });
      }

      if (user.password_hash) {
        if (!currentPassword) {
          return reply.code(400).send({ error: 'escribe tu contrasena actual' });
        }

        const matches = await argon2
          .verify(user.password_hash, currentPassword)
          .catch(() => false);

        if (!matches) {
          return reply.code(401).send({ error: 'la contrasena actual no es correcta' });
        }
      }

      await query('UPDATE users SET password_hash = :hash WHERE id = :id', {
        hash: await argon2.hash(newPassword, HASH_OPTIONS),
        id: request.userId,
      });

      await revokeAllRefreshTokens(request.userId);

      return session(request.userId);
    }
  );

  app.post('/auth/logout-others', { preHandler: app.authenticate }, async (request) => {
    await revokeAllRefreshTokens(request.userId);

    return session(request.userId);
  });
}
