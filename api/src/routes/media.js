import { readFile, writeFile } from 'node:fs/promises';

import { decryptBuffer, encryptBuffer } from '../crypto.js';
import {
  ensureUserFolder,
  isMediaName,
  mediaMime,
  mediaPath,
  removeMedia,
} from '../media.js';
import { createId } from '../ids.js';

const MAX_BYTES = 6 * 1024 * 1024;
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

export async function mediaRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.post(
    '/media',
    {
      bodyLimit: MAX_BYTES,
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: { ext: { type: 'string', enum: EXTENSIONS } },
        },
      },
    },
    async (request, reply) => {
      if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
        return reply.code(400).send({ error: 'no llego ninguna imagen' });
      }

      const name = `${createId()}.${request.query.ext ?? 'jpg'}`;

      await ensureUserFolder(request.userId);
      await writeFile(mediaPath(request.userId, name), encryptBuffer(request.body));

      return reply.code(201).send({ name });
    }
  );

  app.get(
    '/media/:name',
    {
      schema: {
        params: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string', maxLength: 40 } },
        },
      },
    },
    async (request, reply) => {
      const { name } = request.params;

      if (!isMediaName(name)) {
        return reply.code(404).send({ error: 'esa imagen no existe' });
      }

      let cifrada;

      try {
        cifrada = await readFile(mediaPath(request.userId, name));
      } catch {
        return reply.code(404).send({ error: 'esa imagen no existe' });
      }

      return reply
        .header('Content-Type', mediaMime(name))
        .header('Cache-Control', 'private, max-age=31536000, immutable')
        .send(decryptBuffer(cifrada));
    }
  );

  app.delete(
    '/media/:name',
    {
      schema: {
        params: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string', maxLength: 40 } },
        },
      },
    },
    async (request, reply) => {
      await removeMedia(request.userId, [request.params.name]);

      return reply.code(204).send();
    }
  );
}
