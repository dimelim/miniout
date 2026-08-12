import { SignJWT, jwtVerify } from 'jose';

import { config } from './config.js';

const PROVIDERS = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile',
    extraParams: { access_type: 'online', prompt: 'select_account' },
    credentials: () => config.oauth.google,
    toProfile: (profile) => ({
      accountId: profile.sub,
      email: profile.email_verified ? profile.email : null,
      displayName: profile.name ?? null,
    }),
  },
  discord: {
    authorizeUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    profileUrl: 'https://discord.com/api/users/@me',
    scope: 'identify email',
    extraParams: {},
    credentials: () => config.oauth.discord,
    toProfile: (profile) => ({
      accountId: profile.id,
      email: profile.verified ? profile.email : null,
      displayName: profile.global_name ?? profile.username ?? null,
    }),
  },
};

export function isSupported(provider) {
  return Object.hasOwn(PROVIDERS, provider);
}

export function isConfigured(provider) {
  const { clientId, clientSecret } = PROVIDERS[provider].credentials();
  return Boolean(clientId && clientSecret);
}

export function callbackUrl(provider) {
  return `${config.apiBaseUrl}/auth/${provider}/callback`;
}

export async function signState(provider) {
  return new SignJWT({ provider })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('miniout')
    .setAudience('oauth-state')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(config.jwtSecret);
}

export async function verifyState(state, provider) {
  const { payload } = await jwtVerify(state, config.jwtSecret, {
    algorithms: ['HS256'],
    issuer: 'miniout',
    audience: 'oauth-state',
  });

  if (payload.provider !== provider) {
    throw new Error('el estado no corresponde al proveedor');
  }
}

export function authorizeUrl(provider, state) {
  const definition = PROVIDERS[provider];
  const { clientId } = definition.credentials();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(provider),
    response_type: 'code',
    scope: definition.scope,
    state,
    ...definition.extraParams,
  });

  return `${definition.authorizeUrl}?${params.toString()}`;
}

export async function fetchProfile(provider, code) {
  const definition = PROVIDERS[provider];
  const { clientId, clientSecret } = definition.credentials();

  const tokenResponse = await fetch(definition.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl(provider),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`token endpoint devolvio ${tokenResponse.status}`);
  }

  const { access_token: accessToken } = await tokenResponse.json();

  if (!accessToken) {
    throw new Error('el proveedor no devolvio access_token');
  }

  const profileResponse = await fetch(definition.profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error(`perfil devolvio ${profileResponse.status}`);
  }

  const profile = definition.toProfile(await profileResponse.json());

  if (!profile.accountId) {
    throw new Error('el perfil no trae identificador');
  }

  return profile;
}
