import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { ApiError, api, isConfigured, type Account, type Session } from './api';

const KEY = 'miniout.session.v1';

type AuthValue = {
  session: Session | null;
  account: Account | null;
  isReady: boolean;
  isConfigured: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  saveName: (displayName: string) => Promise<void>;
  saveAvatar: (avatarUrl: string | null) => Promise<void>;
  markIntroSeen: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function readStored(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

async function writeStored(value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, value);
    } catch {}
    return;
  }
  if (value === null) {
    await SecureStore.deleteItemAsync(KEY);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const raw = await readStored();

      if (!raw || cancelled) {
        if (!cancelled) setIsReady(true);
        return;
      }

      let stored: Session;
      try {
        stored = JSON.parse(raw) as Session;
      } catch {
        await writeStored(null);
        if (!cancelled) setIsReady(true);
        return;
      }

      try {
        const fresh = await api.refresh(stored.refreshToken);
        if (cancelled) return;

        await writeStored(JSON.stringify(fresh));
        setSession(fresh);

        try {
          setAccount(await api.me(fresh.accessToken));
        } catch {}
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await writeStored(null);
        } else if (!cancelled) {
          setSession(stored);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    const rendirse = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 4000);

    restore()
      .catch(() => {
        if (!cancelled) setIsReady(true);
      })
      .finally(() => clearTimeout(rendirse));

    return () => {
      cancelled = true;
      clearTimeout(rendirse);
    };
  }, []);

  const signIn = useCallback(async (next: Session) => {
    await writeStored(JSON.stringify(next));
    setSession(next);
    try {
      setAccount(await api.me(next.accessToken));
    } catch {
      setAccount(null);
    }
  }, []);

  const saveName = useCallback(
    async (displayName: string) => {
      if (!session) throw new Error('No hay sesión');
      setAccount(await api.updateName(session.accessToken, displayName));
    },
    [session]
  );

  const saveAvatar = useCallback(
    async (avatarUrl: string | null) => {
      if (!session) throw new Error('No hay sesión');
      setAccount(await api.updateAvatar(session.accessToken, avatarUrl));
    },
    [session]
  );

  const markIntroSeen = useCallback(async () => {
    if (!session) return;

    try {
      setAccount(await api.markIntroSeen(session.accessToken));
    } catch {
      setAccount((current) => (current ? { ...current, introSeen: true } : current));
    }
  }, [session]);

  const signOut = useCallback(async () => {
    if (session) {
      await api.logout(session.accessToken).catch(() => {});
    }
    await writeStored(null);
    setSession(null);
    setAccount(null);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      account,
      isReady,
      isConfigured: isConfigured(),
      signIn,
      signOut,
      saveName,
      saveAvatar,
      markIntroSeen,
    }),
    [session, account, isReady, signIn, signOut, saveName, saveAvatar, markIntroSeen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return value;
}
