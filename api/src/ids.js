import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const RANDOM_LENGTH = 16;

function encodeTime(now) {
  let time = now;
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = ALPHABET[time % 32] + out;
    time = Math.floor(time / 32);
  }
  return out;
}

function encodeRandom() {
  const bytes = randomBytes(RANDOM_LENGTH);
  let out = '';
  for (let i = 0; i < RANDOM_LENGTH; i++) {
    out += ALPHABET[bytes[i] % 32];
  }
  return out;
}

export function createId() {
  return encodeTime(Date.now()) + encodeRandom();
}
