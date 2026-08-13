import { decrypt, decryptJson, encrypt, encryptJson } from '../crypto.js';
import { query, queryOne } from '../db.js';
import { createId } from '../ids.js';

const MAX_NAME_LENGTH = 40;
const MAX_PERIODS = 30;
const MAX_SUBJECTS = 40;

const COLUMNS = 'id, name, icon, color, data, position, created_at, updated_at';

const claseSchema = {
  type: 'object',
  required: ['id', 'dia', 'inicio', 'fin'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', maxLength: 30 },
    dia: { type: 'integer', minimum: 0, maximum: 6 },
    inicio: { type: 'string', maxLength: 5 },
    fin: { type: 'string', maxLength: 5 },
    lugar: { type: 'string', maxLength: 40 },
  },
};

const apunteSchema = {
  type: 'object',
  required: ['id', 'fecha', 'texto'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', maxLength: 30 },
    fecha: { type: 'string', maxLength: 40 },
    texto: { type: 'string', maxLength: 500 },
  },
};

const encargoSchema = {
  type: 'object',
  required: ['id', 'titulo'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', maxLength: 30 },
    titulo: { type: 'string', maxLength: 120 },
    fecha: { type: ['string', 'null'], maxLength: 40 },
    hecho: { type: 'boolean' },
  },
};

const evaluacionSchema = {
  type: 'object',
  required: ['id', 'nombre', 'peso'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', maxLength: 30 },
    nombre: { type: 'string', minLength: 1, maxLength: 60 },
    peso: { type: 'number', minimum: 0, maximum: 100 },
    nota: { type: ['number', 'null'], minimum: 0, maximum: 1000 },
    fecha: { type: ['string', 'null'], maxLength: 40 },
  },
};

const subjectSchema = {
  type: 'object',
  required: ['id', 'name'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', maxLength: 30 },
    name: { type: 'string', minLength: 1, maxLength: 60 },
    createdAt: { type: 'string', maxLength: 40 },
    creditos: { type: 'integer', minimum: 0, maximum: 30 },
    clases: { type: 'array', maxItems: 20, items: claseSchema },
    apuntes: { type: 'array', maxItems: 200, items: apunteSchema },
    encargos: { type: 'array', maxItems: 100, items: encargoSchema },
    evaluaciones: { type: 'array', maxItems: 30, items: evaluacionSchema },
  },
};

const subjectsSchema = { type: 'array', maxItems: MAX_SUBJECTS, items: subjectSchema };

function toPeriod(row) {
  return {
    id: row.id,
    name: decrypt(row.name),
    icon: row.icon,
    color: row.color,
    subjects: decryptJson(row.data),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function periodRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/periods', async (request) => {
    const rows = await query(
      `SELECT ${COLUMNS} FROM periods
       WHERE user_id = :userId AND deleted_at IS NULL
       ORDER BY position ASC, created_at ASC
       LIMIT ${MAX_PERIODS}`,
      { userId: request.userId }
    );

    return { periods: rows.map(toPeriod) };
  });

  app.post(
    '/periods',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'icon', 'color'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: MAX_NAME_LENGTH },
            icon: { type: 'string', minLength: 1, maxLength: 40 },
            color: { type: 'string', minLength: 4, maxLength: 20 },
            subjects: subjectsSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const total = await queryOne(
        `SELECT COUNT(*) AS total FROM periods
         WHERE user_id = :userId AND deleted_at IS NULL`,
        { userId: request.userId }
      );

      if (Number(total.total) >= MAX_PERIODS) {
        return reply.code(400).send({ error: 'ya tienes demasiados periodos' });
      }

      const id = createId();

      await query(
        `INSERT INTO periods (id, user_id, name, icon, color, data, position)
         VALUES (:id, :userId, :name, :icon, :color, :data, :position)`,
        {
          id,
          userId: request.userId,
          name: encrypt(request.body.name),
          icon: request.body.icon,
          color: request.body.color,
          data: encryptJson(request.body.subjects ?? []),
          position: Number(total.total),
        }
      );

      const row = await queryOne(
        `SELECT ${COLUMNS} FROM periods WHERE id = :id AND user_id = :userId`,
        { id, userId: request.userId }
      );

      return reply.code(201).send(toPeriod(row));
    }
  );

  app.patch(
    '/periods/:id',
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
            name: { type: 'string', minLength: 1, maxLength: MAX_NAME_LENGTH },
            icon: { type: 'string', minLength: 1, maxLength: 40 },
            color: { type: 'string', minLength: 4, maxLength: 20 },
            subjects: subjectsSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const fields = [];
      const params = { id: request.params.id, userId: request.userId };

      if (request.body.name !== undefined) {
        fields.push('name = :name');
        params.name = encrypt(request.body.name);
      }
      if (request.body.icon !== undefined) {
        fields.push('icon = :icon');
        params.icon = request.body.icon;
      }
      if (request.body.color !== undefined) {
        fields.push('color = :color');
        params.color = request.body.color;
      }
      if (request.body.subjects !== undefined) {
        fields.push('data = :data');
        params.data = encryptJson(request.body.subjects);
      }

      const result = await query(
        `UPDATE periods SET ${fields.join(', ')}
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        params
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'ese periodo no existe' });
      }

      const row = await queryOne(
        `SELECT ${COLUMNS} FROM periods WHERE id = :id AND user_id = :userId`,
        params
      );

      return toPeriod(row);
    }
  );

  app.delete(
    '/periods/:id',
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
        `UPDATE periods SET deleted_at = NOW()
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        { id: request.params.id, userId: request.userId }
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'ese periodo no existe' });
      }

      return reply.code(204).send();
    }
  );
}
