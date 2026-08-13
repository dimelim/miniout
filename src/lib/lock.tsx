import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';

const KEY = 'miniout.minilock.v1';
export const LARGO_CLAVE = 4;

type LockValue = {
  tieneClave: boolean;
  bloqueada: boolean;
  isReady: boolean;
  poner: (codigo: string) => Promise<void>;
  quitar: () => Promise<void>;
  abrir: (codigo: string) => Promise<boolean>;
  bloquear: () => void;
};

const LockContext = createContext<LockValue | null>(null);

async function leer() {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(KEY);
}

async function escribir(valor: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (valor === null) globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, valor);
    } catch {}
    return;
  }

  if (valor === null) {
    await SecureStore.deleteItemAsync(KEY);
    return;
  }

  await SecureStore.setItemAsync(KEY, valor);
}

export function LockProvider({ children }: { children: ReactNode }) {
  const [clave, setClave] = useState<string | null>(null);
  const [bloqueada, setBloqueada] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const fondoDesde = useRef<number | null>(null);

  useEffect(() => {
    let cancelado = false;

    leer()
      .then((guardada) => {
        if (cancelado) return;
        setClave(guardada);
        setBloqueada(Boolean(guardada));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setIsReady(true);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      if (estado === 'background') {
        fondoDesde.current = Date.now();
        if (clave) setBloqueada(true);
        return;
      }

      if (estado !== 'active' || !clave || fondoDesde.current === null) return;

      if (Date.now() - fondoDesde.current <= 20_000) {
        setBloqueada(false);
      }

      fondoDesde.current = null;
    });

    return () => subscription.remove();
  }, [clave]);

  const poner = useCallback(async (codigo: string) => {
    await escribir(codigo);
    setClave(codigo);
    setBloqueada(false);
  }, []);

  const quitar = useCallback(async () => {
    await escribir(null);
    setClave(null);
    setBloqueada(false);
  }, []);

  const abrir = useCallback(
    async (codigo: string) => {
      if (codigo !== clave) return false;

      setBloqueada(false);
      return true;
    },
    [clave]
  );

  const bloquear = useCallback(() => {
    if (clave) setBloqueada(true);
  }, [clave]);

  const value = useMemo(
    () => ({
      tieneClave: Boolean(clave),
      bloqueada,
      isReady,
      poner,
      quitar,
      abrir,
      bloquear,
    }),
    [clave, bloqueada, isReady, poner, quitar, abrir, bloquear]
  );

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
}

export function useLock() {
  const value = useContext(LockContext);
  if (!value) {
    throw new Error('useLock debe usarse dentro de LockProvider');
  }
  return value;
}
