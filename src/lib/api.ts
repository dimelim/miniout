import type { Hint } from './hints';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type Note = {
  id: string;
  body: string;
  hints: Hint[];
  done: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  isNew?: boolean;
};

export type Provider = 'google' | 'discord';

export type Account = {
  id: string;
  email: string;
  displayName: string | null;
  hasPassword: boolean;
  providers: Provider[];
  introSeen: boolean;
  createdAt: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isConfigured() {
  return BASE_URL.length > 0;
}

export function apiBaseUrl() {
  return BASE_URL;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string } = {}
): Promise<T> {
  if (!isConfigured()) {
    throw new ApiError('La app todavia no tiene servidor configurado', 0);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('No hay conexion con el servidor', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : 'Algo fallo del lado del servidor';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const api = {
  register(input: { email: string; password: string }) {
    return request<Session>('/auth/register', { method: 'POST', body: input });
  },

  login(input: { email: string; password: string }) {
    return request<Session>('/auth/login', { method: 'POST', body: input });
  },

  refresh(refreshToken: string) {
    return request<Session>('/auth/refresh', { method: 'POST', body: { refreshToken } });
  },

  logout(accessToken: string) {
    return request<{ ok: true }>('/auth/logout', { method: 'POST', accessToken });
  },

  exchange(code: string) {
    return request<Session>('/auth/exchange', { method: 'POST', body: { code } });
  },

  me(accessToken: string) {
    return request<Account>('/me', { accessToken });
  },

  updateName(accessToken: string, displayName: string) {
    return request<Account>('/me', {
      method: 'PATCH',
      body: { displayName },
      accessToken,
    });
  },

  markIntroSeen(accessToken: string) {
    return request<Account>('/me', {
      method: 'PATCH',
      body: { introSeen: true },
      accessToken,
    });
  },

  changePassword(
    accessToken: string,
    input: { currentPassword?: string; newPassword: string }
  ) {
    return request<Session>('/auth/password', { method: 'POST', body: input, accessToken });
  },

  logoutOthers(accessToken: string) {
    return request<Session>('/auth/logout-others', { method: 'POST', accessToken });
  },

  notes(accessToken: string) {
    return request<{ notes: Note[]; syncedAt: string }>('/notes', { accessToken });
  },

  createNote(accessToken: string, input: { body: string; hints: Hint[] }) {
    return request<Note>('/notes', { method: 'POST', body: input, accessToken });
  },

  updateNote(accessToken: string, id: string, input: { done?: boolean; body?: string }) {
    return request<Note>(`/notes/${id}`, { method: 'PATCH', body: input, accessToken });
  },

  removeNote(accessToken: string, id: string) {
    return request<{ ok: true }>(`/notes/${id}`, { method: 'DELETE', accessToken });
  },
};
