import { decrypt, decryptJson, encrypt, encryptJson } from '../crypto.js';
import { query, queryOne } from '../db.js';
import { createId } from '../ids.js';

const MAX_BODY_LENGTH = 8000;

const hintSchema = {
  type: 'object',
  required: ['kind', 'label'],
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['subject', 'date'] },
    label: { type: 'string', maxLength: 60 },
    offsetDays: { type: 'integer', minimum: -3650, maximum: 3650 },
  },
};

function toNote(row) {
  return {
    id: row.id,
    body: decrypt(row.body),
    hints: decryptJson(row.hints),
    done: Boolean(row.done),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export async function noteRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/notes',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: { since: { type: 'string', maxLength: 40 } },
        },
      },
    },
    async (request) => {
      const since = request.query.since ? new Date(request.query.since) : null;
      const validSince = since && !Number.isNaN(since.getTime()) ? since : new Date(0);

      const rows = await query(
        `SELECT id, body, hints, done, created_at, updated_at, deleted_at
         FROM notes
         WHERE user_id = :userId AND updated_at > :since
         ORDER BY updated_at ASC
         LIMIT 1000`,
        { userId: request.userId, since: validSince }
      );

      return { notes: rows.map(toNote), syncedAt: new Date().toISOString() };
    }
  );

  app.post(
    '/notes',
    {
      schema: {
        body: {
          type: 'object',
          required: ['body'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', maxLength: 26 },
            body: { type: 'string', minLength: 1, maxLength: MAX_BODY_LENGTH },
            hints: { type: 'array', maxItems: 8, items: hintSchema },
            createdAt: { type: 'string', maxLength: 40 },
          },
        },
      },
    },
    async (request, reply) => {
      const id = request.body.id ?? createId();
      const createdAt = request.body.createdAt ? new Date(request.body.createdAt) : new Date();

      await query(
        `INSERT INTO notes (id, user_id, body, hints, created_at)
         VALUES (:id, :userId, :body, :hints, :createdAt)
         ON DUPLICATE KEY UPDATE
           body = VALUES(body),
           hints = VALUES(hints)`,
        {
          id,
          userId: request.userId,
          body: encrypt(request.body.body),
          hints: encryptJson(request.body.hints ?? []),
          createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
        }
      );

      const row = await queryOne(
        `SELECT id, body, hints, done, created_at, updated_at, deleted_at
         FROM notes WHERE id = :id AND user_id = :userId`,
        { id, userId: request.userId }
      );

      return reply.code(201).send(toNote(row));
    }
  );

  app.patch(
    '/notes/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', maxLength: 26 } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          properties: {
            body: { type: 'string', minLength: 1, maxLength: MAX_BODY_LENGTH },
            hints: { type: 'array', maxItems: 8, items: hintSchema },
            done: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const fields = [];
      const params = { id: request.params.id, userId: request.userId };

      if (request.body.body !== undefined) {
        fields.push('body = :body');
        params.body = encrypt(request.body.body);
      }
      if (request.body.hints !== undefined) {
        fields.push('hints = :hints');
        params.hints = encryptJson(request.body.hints);
      }
      if (request.body.done !== undefined) {
        fields.push('done = :done');
        params.done = request.body.done ? 1 : 0;
      }

      const result = await query(
        `UPDATE notes SET ${fields.join(', ')}
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        params
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'esa nota no existe' });
      }

      const row = await queryOne(
        `SELECT id, body, hints, done, created_at, updated_at, deleted_at
         FROM notes WHERE id = :id AND user_id = :userId`,
        params
      );

      return toNote(row);
    }
  );

  app.delete(
    '/notes/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', maxLength: 26 } },
        },
      },
    },
    async (request, reply) => {
      const result = await query(
        `UPDATE notes SET deleted_at = NOW()
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        { id: request.params.id, userId: request.userId }
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'esa nota no existe' });
      }

      return reply.code(204).send();
    }
  );
}
