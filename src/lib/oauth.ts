import * as WebBrowser from 'expo-web-browser';

import { api, apiBaseUrl, type Session } from './api';

export type Provider = 'google' | 'discord';

const REDIRECT = 'miniout://auth';

export async function signInWithProvider(provider: Provider): Promise<Session> {
  const base = apiBaseUrl();

  if (!base) {
    throw new Error('La app todavía no tiene servidor configurado');
  }

  const result = await WebBrowser.openAuthSessionAsync(
    `${base}/auth/${provider}/start`,
    REDIRECT
  );

  if (result.type !== 'success') {
    throw new Error('cancelado');
  }

  const params = new URL(result.url).searchParams;

  if (params.get('error') === 'cancelado') {
    throw new Error('cancelado');
  }

  const code = params.get('code');

  if (!code) {
    throw new Error('No se pudo verificar la cuenta');
  }

  return api.exchange(code);
}
