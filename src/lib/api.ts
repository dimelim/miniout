import type { Marca } from './format';
import type { Hint } from './hints';
import type { Subject } from './periods';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type NoteImage = {
  name: string;
  width: number;
  height: number;
  scale?: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
};

export type Note = {
  id: string;
  title: string | null;
  body: string;
  hints: Hint[];
  format: Marca[];
  media: NoteImage[];
  grade: number | null;
  projectId: string | null;
  done: boolean;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Project = {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Period = Project & { subjects: Subject[] };

export type NotePatch = {
  title?: string | null;
  body?: string;
  hints?: Hint[];
  format?: Marca[];
  media?: NoteImage[];
  grade?: number | null;
  projectId?: string | null;
  done?: boolean;
  dueAt?: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  isNew?: boolean;
};

export type Provider = 'google' | 'discord';

export type AccountPhoto = {
  provider: Provider;
  url: string;
};

export type Account = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  photos: AccountPhoto[];
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

const TIMEOUT_MS = 12_000;

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

  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: control.signal,
    });
  } catch {
    throw new ApiError('No hay conexion con el servidor', 0);
  } finally {
    clearTimeout(corte);
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

  updateAvatar(accessToken: string, avatarUrl: string | null) {
    return request<Account>('/me', {
      method: 'PATCH',
      body: { avatarUrl },
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

  createNote(accessToken: string, input: NotePatch & { body: string }) {
    return request<Note>('/notes', { method: 'POST', body: input, accessToken });
  },

  updateNote(accessToken: string, id: string, input: NotePatch) {
    return request<Note>(`/notes/${id}`, { method: 'PATCH', body: input, accessToken });
  },

  removeNote(accessToken: string, id: string) {
    return request<{ ok: true }>(`/notes/${id}`, { method: 'DELETE', accessToken });
  },

  projects(accessToken: string) {
    return request<{ projects: Project[] }>('/projects', { accessToken });
  },

  createProject(accessToken: string, input: { name: string; icon: string; color: string }) {
    return request<Project>('/projects', { method: 'POST', body: input, accessToken });
  },

  updateProject(
    accessToken: string,
    id: string,
    input: { name?: string; icon?: string; color?: string }
  ) {
    return request<Project>(`/projects/${id}`, { method: 'PATCH', body: input, accessToken });
  },

  orderProjects(accessToken: string, ids: string[]) {
    return request<{ projects: Project[] }>('/projects/order', {
      method: 'POST',
      body: { ids },
      accessToken,
    });
  },

  removeProject(accessToken: string, id: string) {
    return request<{ ok: true }>(`/projects/${id}`, { method: 'DELETE', accessToken });
  },

  periods(accessToken: string) {
    return request<{ periods: Period[] }>('/periods', { accessToken });
  },

  createPeriod(
    accessToken: string,
    input: { name: string; icon: string; color: string; subjects?: Subject[] }
  ) {
    return request<Period>('/periods', { method: 'POST', body: input, accessToken });
  },

  updatePeriod(
    accessToken: string,
    id: string,
    input: { name?: string; icon?: string; color?: string; subjects?: Subject[] }
  ) {
    return request<Period>(`/periods/${id}`, { method: 'PATCH', body: input, accessToken });
  },

  removePeriod(accessToken: string, id: string) {
    return request<{ ok: true }>(`/periods/${id}`, { method: 'DELETE', accessToken });
  },

  removeImage(accessToken: string, name: string) {
    return request<{ ok: true }>(`/media/${name}`, { method: 'DELETE', accessToken });
  },
};

export function imageUrl(name: string) {
  return `${BASE_URL}/media/${name}`;
}

export function uploadUrl(ext: string) {
  return `${BASE_URL}/media?ext=${ext}`;
}
