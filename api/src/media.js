import { mkdir, rm } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { config } from './config.js';

const NAME = /^[0-9A-Z]{26}\.(jpg|jpeg|png|webp|heic)$/;

const MIMES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

const root = isAbsolute(config.mediaDir)
  ? config.mediaDir
  : resolve(process.cwd(), config.mediaDir);

export function isMediaName(name) {
  return NAME.test(name);
}

export function mediaMime(name) {
  return MIMES[name.split('.').pop()] ?? 'application/octet-stream';
}

export function mediaPath(userId, name) {
  return join(root, userId, name);
}

export async function ensureUserFolder(userId) {
  await mkdir(join(root, userId), { recursive: true });
}

export async function removeMedia(userId, names) {
  for (const name of names) {
    if (!isMediaName(name)) continue;

    await rm(mediaPath(userId, name), { force: true });
  }
}
