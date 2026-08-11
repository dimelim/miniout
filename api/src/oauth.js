import { config } from './config.js';

const PROVIDERS = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    credentials: () => config.oauth.google,
    toProfile: (profile) => ({
      accountId: profile.sub,
      email: profile.email_verified ? profile.email : null,
      displayName: profile.name ?? null,
    }),
  },
  discord: {
    tokenUrl: 'https://discord.com/api/oauth2/token',
    profileUrl: 'https://discord.com/api/users/@me',
    credentials: () => config.oauth.discord,
    toProfile: (profile) => ({
      accountId: profile.id,
      email: profile.verified ? profile.email : null,
      displayName: profile.global_name ?? profile.username ?? null,
    }),
  },
};

export async function exchangeOAuthCode(provider, code, codeVerifier) {
  const definition = PROVIDERS[provider];
  const { clientId, clientSecret } = definition.credentials();

  if (!clientId || !clientSecret) {
    throw new Error(`${provider} no esta configurado`);
  }

  const tokenResponse = await fetch(definition.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: config.oauth.redirectUri,
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
