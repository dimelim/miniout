import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`falta la variable de entorno ${name}`);
  }
  return value.trim();
}

function optional(name, fallback = '') {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function number(name, fallback) {
  const value = Number(optional(name, String(fallback)));
  if (!Number.isFinite(value)) {
    throw new Error(`la variable ${name} no es un numero`);
  }
  return value;
}

const jwtSecret = required('JWT_SECRET');

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET necesita al menos 32 caracteres');
}

const dataKey = Buffer.from(required('DATA_KEY'), 'base64');

if (dataKey.length !== 32) {
  throw new Error('DATA_KEY tiene que ser una clave de 32 bytes en base64');
}

export const config = {
  port: number('PORT', 8787),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  db: {
    host: required('DB_HOST'),
    port: number('DB_PORT', 3306),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    name: required('DB_NAME'),
    ssl: optional('DB_SSL', 'true') !== 'false',
  },

  jwtSecret: new TextEncoder().encode(jwtSecret),
  dataKey,
  accessTokenMinutes: number('ACCESS_TOKEN_MINUTES', 15),
  refreshTokenDays: number('REFRESH_TOKEN_DAYS', 30),

  allowedOrigins: optional('ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  apiBaseUrl: optional('API_BASE_URL', 'http://localhost:8787').replace(/\/+$/, ''),
  appRedirect: optional('APP_REDIRECT', 'miniout://auth'),
  mediaDir: optional('MEDIA_DIR', 'media'),

  oauth: {
    google: {
      clientId: optional('GOOGLE_CLIENT_ID'),
      clientSecret: optional('GOOGLE_CLIENT_SECRET'),
    },
    discord: {
      clientId: optional('DISCORD_CLIENT_ID'),
      clientSecret: optional('DISCORD_CLIENT_SECRET'),
    },
  },
};
