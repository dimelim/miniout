import * as AuthSession from 'expo-auth-session';

import { api, type Session } from './api';

export type Provider = 'google' | 'discord';

const ENDPOINTS: Record<Provider, AuthSession.DiscoveryDocument> = {
  google: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  },
  discord: {
    authorizationEndpoint: 'https://discord.com/oauth2/authorize',
    tokenEndpoint: 'https://discord.com/api/oauth2/token',
  },
};

const SCOPES: Record<Provider, string[]> = {
  google: ['openid', 'email', 'profile'],
  discord: ['identify', 'email'],
};

const CLIENT_IDS: Record<Provider, string> = {
  google: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  discord: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID ?? '',
};

export function isProviderConfigured(provider: Provider) {
  return CLIENT_IDS[provider].length > 0;
}

export function redirectUri() {
  return AuthSession.makeRedirectUri({ scheme: 'miniout', path: 'auth' });
}

export async function signInWithProvider(provider: Provider): Promise<Session> {
  const clientId = CLIENT_IDS[provider];

  if (!clientId) {
    throw new Error(`Falta el client id de ${provider}`);
  }

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: SCOPES[provider],
    redirectUri: redirectUri(),
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });

  const result = await request.promptAsync(ENDPOINTS[provider]);

  if (result.type === 'dismiss' || result.type === 'cancel') {
    throw new Error('cancelado');
  }

  if (result.type !== 'success' || !result.params.code) {
    throw new Error('No se pudo verificar la cuenta');
  }

  if (!request.codeVerifier) {
    throw new Error('Falta el verificador de PKCE');
  }

  return api.oauth(provider, {
    code: result.params.code,
    codeVerifier: request.codeVerifier,
  });
}
