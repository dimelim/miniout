import { createHash, randomBytes } from 'node:crypto';

import { SignJWT, jwtVerify } from 'jose';

import { config } from './config.js';
import { query, queryOne } from './db.js';
import { createId } from './ids.js';

const ALGORITHM = 'HS256';
const ISSUER = 'miniout';

export async function signAccessToken(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenMinutes}m`)
    .sign(config.jwtSecret);
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, config.jwtSecret, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: ISSUER,
  });
  return payload.sub;
}

function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueRefreshToken(userId) {
  const token = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + config.refreshTokenDays * 86_400_000);

  await query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
     VALUES (:id, :userId, :tokenHash, :expiresAt)`,
    {
      id: createId(),
      userId,
      tokenHash: hashRefreshToken(token),
      expiresAt,
    }
  );

  return token;
}

export async function rotateRefreshToken(token) {
  const stored = await queryOne(
    `SELECT id, user_id, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = :tokenHash`,
    { tokenHash: hashRefreshToken(token) }
  );

  if (!stored || stored.revoked_at || new Date(stored.expires_at) < new Date()) {
    return null;
  }

  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = :id`, {
    id: stored.id,
  });

  return {
    userId: stored.user_id,
    refreshToken: await issueRefreshToken(stored.user_id),
  };
}

export async function revokeAllRefreshTokens(userId) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = :userId AND revoked_at IS NULL`,
    { userId }
  );
}
