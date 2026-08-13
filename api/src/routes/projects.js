import { decrypt, encrypt } from '../crypto.js';
import { query, queryOne } from '../db.js';
import { createId } from '../ids.js';

const MAX_NAME_LENGTH = 40;
const MAX_PROJECTS = 40;

function toProject(row) {
  return {
    id: row.id,
    name: decrypt(row.name),
    icon: row.icon,
    color: row.color,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function projectRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/projects', async (request) => {
    const rows = await query(
      `SELECT id, name, icon, color, position, created_at, updated_at
       FROM projects
       WHERE user_id = :userId AND deleted_at IS NULL
       ORDER BY position ASC, created_at ASC
       LIMIT ${MAX_PROJECTS}`,
      { userId: request.userId }
    );

    return { projects: rows.map(toProject) };
  });

  app.post(
    '/projects',
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
          },
        },
      },
    },
    async (request, reply) => {
      const total = await queryOne(
        `SELECT COUNT(*) AS total FROM projects
         WHERE user_id = :userId AND deleted_at IS NULL`,
        { userId: request.userId }
      );

      if (Number(total.total) >= MAX_PROJECTS) {
        return reply.code(400).send({ error: 'ya tienes demasiados proyectos' });
      }

      const id = createId();

      await query(
        `INSERT INTO projects (id, user_id, name, icon, color, position)
         VALUES (:id, :userId, :name, :icon, :color, :position)`,
        {
          id,
          userId: request.userId,
          name: encrypt(request.body.name),
          icon: request.body.icon,
          color: request.body.color,
          position: Number(total.total),
        }
      );

      const row = await queryOne(
        `SELECT id, name, icon, color, position, created_at, updated_at
         FROM projects WHERE id = :id AND user_id = :userId`,
        { id, userId: request.userId }
      );

      return reply.code(201).send(toProject(row));
    }
  );

  app.patch(
    '/projects/:id',
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

      const result = await query(
        `UPDATE projects SET ${fields.join(', ')}
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        params
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'ese proyecto no existe' });
      }

      const row = await queryOne(
        `SELECT id, name, icon, color, position, created_at, updated_at
         FROM projects WHERE id = :id AND user_id = :userId`,
        params
      );

      return toProject(row);
    }
  );

  app.post(
    '/projects/order',
    {
      schema: {
        body: {
          type: 'object',
          required: ['ids'],
          additionalProperties: false,
          properties: {
            ids: {
              type: 'array',
              maxItems: MAX_PROJECTS,
              items: { type: 'string', maxLength: 26 },
            },
          },
        },
      },
    },
    async (request) => {
      for (const [position, id] of request.body.ids.entries()) {
        await query(
          `UPDATE projects SET position = :position
           WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
          { position, id, userId: request.userId }
        );
      }

      const rows = await query(
        `SELECT id, name, icon, color, position, created_at, updated_at
         FROM projects
         WHERE user_id = :userId AND deleted_at IS NULL
         ORDER BY position ASC, created_at ASC
         LIMIT ${MAX_PROJECTS}`,
        { userId: request.userId }
      );

      return { projects: rows.map(toProject) };
    }
  );

  app.delete(
    '/projects/:id',
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
        `UPDATE projects SET deleted_at = NOW()
         WHERE id = :id AND user_id = :userId AND deleted_at IS NULL`,
        { id: request.params.id, userId: request.userId }
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'ese proyecto no existe' });
      }

      await query(
        `UPDATE notes SET project_id = NULL
         WHERE project_id = :id AND user_id = :userId`,
        { id: request.params.id, userId: request.userId }
      );

      return reply.code(204).send();
    }
  );
}
