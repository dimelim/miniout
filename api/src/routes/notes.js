import { decrypt, decryptJson, encrypt, encryptJson } from '../crypto.js';
import { query, queryOne } from '../db.js';
import { createId } from '../ids.js';
import { removeMedia } from '../media.js';

const MAX_BODY_LENGTH = 8000;
const MAX_TITLE_LENGTH = 120;

const COLUMNS = `id, title, body, hints, format, media, grade, project_id, done, due_at,
  created_at, updated_at, deleted_at`;

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

const marcaSchema = {
  type: 'object',
  required: ['tipo', 'desde', 'hasta'],
  additionalProperties: false,
  properties: {
    tipo: { type: 'string', enum: ['negrita', 'cursiva', 'subrayado', 'titulo'] },
    desde: { type: 'integer', minimum: 0, maximum: MAX_BODY_LENGTH },
    hasta: { type: 'integer', minimum: 0, maximum: MAX_BODY_LENGTH },
  },
};

const mediaSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', maxLength: 40 },
    width: { type: 'integer', minimum: 0, maximum: 20000 },
    height: { type: 'integer', minimum: 0, maximum: 20000 },
    scale: { type: 'number', minimum: 0.1, maximum: 8 },
    rotation: { type: 'number', minimum: -360, maximum: 360 },
    offsetX: { type: 'number', minimum: -20000, maximum: 20000 },
    offsetY: { type: 'number', minimum: -20000, maximum: 20000 },
  },
};

function toNote(row) {
  return {
    id: row.id,
    title: row.title === null ? null : decrypt(row.title),
    body: decrypt(row.body),
    hints: decryptJson(row.hints),
    format: row.format === null ? [] : decryptJson(row.format),
    media: row.media === null ? [] : decryptJson(row.media),
    grade: row.grade === null ? null : Number(row.grade),
    projectId: row.project_id,
    done: Boolean(row.done),
    dueAt: row.due_at,
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
        `SELECT ${COLUMNS}
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
            title: { type: ['string', 'null'], maxLength: MAX_TITLE_LENGTH },
            body: { type: 'string', maxLength: MAX_BODY_LENGTH },
            hints: { type: 'array', maxItems: 8, items: hintSchema },
            format: { type: 'array', maxItems: 300, items: marcaSchema },
            media: { type: 'array', maxItems: 20, items: mediaSchema },
            grade: { type: ['number', 'null'], minimum: 0, maximum: 1000 },
            projectId: { type: ['string', 'null'], maxLength: 26 },
            createdAt: { type: 'string', maxLength: 40 },
            dueAt: { type: ['string', 'null'], maxLength: 40 },
          },
        },
      },
    },
    async (request, reply) => {
      const id = request.body.id ?? createId();
      const createdAt = request.body.createdAt ? new Date(request.body.createdAt) : new Date();
      const dueAt = request.body.dueAt ? new Date(request.body.dueAt) : null;

      await query(
        `INSERT INTO notes
           (id, user_id, title, body, hints, format, media, grade, project_id, due_at, created_at)
         VALUES
           (:id, :userId, :title, :body, :hints, :format, :media, :grade, :projectId, :dueAt,
            :createdAt)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           body = VALUES(body),
           hints = VALUES(hints),
           format = VALUES(format),
           media = VALUES(media),
           grade = VALUES(grade),
           project_id = VALUES(project_id),
           due_at = VALUES(due_at)`,
        {
          id,
          userId: request.userId,
          title: request.body.title ? encrypt(request.body.title) : null,
          body: encrypt(request.body.body),
          hints: encryptJson(request.body.hints ?? []),
          format: encryptJson(request.body.format ?? []),
          media: encryptJson(request.body.media ?? []),
          grade: request.body.grade ?? null,
          projectId: request.body.projectId ?? null,
          dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
          createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
        }
      );

      const row = await queryOne(
        `SELECT ${COLUMNS} FROM notes WHERE id = :id AND user_id = :userId`,
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
            title: { type: ['string', 'null'], maxLength: MAX_TITLE_LENGTH },
            body: { type: 'string', maxLength: MAX_BODY_LENGTH },
            hints: { type: 'array', maxItems: 8, items: hintSchema },
            format: { type: 'array', maxItems: 300, items: marcaSchema },
            media: { type: 'array', maxItems: 20, items: mediaSchema },
            grade: { type: ['number', 'null'], minimum: 0, maximum: 1000 },
            projectId: { type: ['string', 'null'], maxLength: 26 },
            done: { type: 'boolean' },
            dueAt: { type: ['string', 'null'], maxLength: 40 },
          },
        },
      },
    },
    async (request, reply) => {
      const fields = [];
      const params = { id: request.params.id, userId: request.userId };

      if (request.body.dueAt !== undefined) {
        const dueAt = request.body.dueAt ? new Date(request.body.dueAt) : null;

        fields.push('due_at = :dueAt');
        params.dueAt = dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null;
      }

      if (request.body.title !== undefined) {
        fields.push('title = :title');
        params.title = request.body.title ? encrypt(request.body.title) : null;
      }
      if (request.body.body !== undefined) {
        fields.push('body = :body');
        params.body = encrypt(request.body.body);
      }
      if (request.body.hints !== undefined) {
        fields.push('hints = :hints');
        params.hints = encryptJson(request.body.hints);
      }
      if (request.body.format !== undefined) {
        fields.push('format = :format');
        params.format = encryptJson(request.body.format);
      }
      if (request.body.media !== undefined) {
        fields.push('media = :media');
        params.media = encryptJson(request.body.media);
      }
      if (request.body.grade !== undefined) {
        fields.push('grade = :grade');
        params.grade = request.body.grade;
      }
      if (request.body.projectId !== undefined) {
        fields.push('project_id = :projectId');
        params.projectId = request.body.projectId;
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
        `SELECT ${COLUMNS} FROM notes WHERE id = :id AND user_id = :userId`,
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
      const anterior = await queryOne(
        `SELECT media FROM notes
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        { id: request.params.id, userId: request.userId }
      );

      const result = await query(
        `UPDATE notes SET deleted_at = NOW()
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        { id: request.params.id, userId: request.userId }
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'esa nota no existe' });
      }

      const imagenes = anterior?.media ? decryptJson(anterior.media) : [];
      await removeMedia(
        request.userId,
        imagenes.map((imagen) => imagen.name).filter(Boolean)
      );

      return reply.code(204).send();
    }
  );
}
