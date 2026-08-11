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

import { api, isConfigured, type Account, type Session } from './api';

const KEY = 'miniout.session.v1';

type AuthValue = {
  session: Session | null;
  account: Account | null;
  isReady: boolean;
  isConfigured: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
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
        setAccount(await api.me(fresh.accessToken));
      } catch {
        await writeStored(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    restore();

    return () => {
      cancelled = true;
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
    }),
    [session, account, isReady, signIn, signOut]
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
