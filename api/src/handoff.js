import { createHash, randomBytes } from 'node:crypto';

import { query, queryOne } from './db.js';
import { createId } from './ids.js';

const TTL_SECONDS = 90;

function hash(code) {
  return createHash('sha256').update(code).digest('hex');
}

export async function createHandoff(userId, isNew) {
  const code = randomBytes(32).toString('base64url');

  await query(
    `INSERT INTO handoffs (id, user_id, code_hash, is_new, expires_at)
     VALUES (:id, :userId, :codeHash, :isNew, DATE_ADD(NOW(), INTERVAL :ttl SECOND))`,
    {
      id: createId(),
      userId,
      codeHash: hash(code),
      isNew: isNew ? 1 : 0,
      ttl: TTL_SECONDS,
    }
  );

  return code;
}

export async function redeemHandoff(code) {
  const stored = await queryOne(
    `SELECT id, user_id, is_new, expires_at, used_at
     FROM handoffs WHERE code_hash = :codeHash`,
    { codeHash: hash(code) }
  );

  if (!stored || stored.used_at || new Date(stored.expires_at) < new Date()) {
    return null;
  }

  const result = await query(
    `UPDATE handoffs SET used_at = NOW() WHERE id = :id AND used_at IS NULL`,
    { id: stored.id }
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return { userId: stored.user_id, isNew: Boolean(stored.is_new) };
}
