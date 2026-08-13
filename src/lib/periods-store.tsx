import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, type Period } from './api';
import { useAuth } from './auth-store';
import { completarSubject, type Subject } from './periods';
import { readSemesters, VIEJOS } from './semesters';

type PeriodsValue = {
  periods: Period[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: { name: string; icon: string; color: string }) => Promise<Period>;
  edit: (
    id: string,
    patch: { name?: string; icon?: string; color?: string; subjects?: Subject[] }
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  find: (id: string | null | undefined) => Period | null;
};

const PeriodsContext = createContext<PeriodsValue | null>(null);

function sanear(period: Period): Period {
  return { ...period, subjects: (period.subjects ?? []).map(completarSubject) };
}

export function PeriodsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setPeriods([]);
      setIsLoading(false);
      return;
    }

    try {
      const payload = await api.periods(session.accessToken);

      if (payload.periods.length === 0) {
        const locales = await readSemesters();

        if (locales.length > 0) {
          const subidos: Period[] = [];

          for (const local of locales) {
            subidos.push(
              await api.createPeriod(session.accessToken, {
                name: local.name,
                icon: local.icon,
                color: local.color,
                subjects: local.subjects.map(completarSubject),
              })
            );
          }

          await AsyncStorage.removeItem(VIEJOS);
          setPeriods(subidos.map(sanear));
          return;
        }
      }

      setPeriods(payload.periods.map(sanear));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  const create = useCallback(
    async (input: { name: string; icon: string; color: string }) => {
      if (!session) throw new Error('No hay sesión');

      const period = sanear(await api.createPeriod(session.accessToken, input));
      setPeriods((current) => [...current, period]);

      return period;
    },
    [session]
  );

  const edit = useCallback(
    async (
      id: string,
      patch: { name?: string; icon?: string; color?: string; subjects?: Subject[] }
    ) => {
      if (!session) throw new Error('No hay sesión');

      const anterior = periods;

      if (patch.subjects) {
        setPeriods((current) =>
          current.map((period) =>
            period.id === id ? { ...period, subjects: patch.subjects as Subject[] } : period
          )
        );
      }

      try {
        const updated = sanear(await api.updatePeriod(session.accessToken, id, patch));
        setPeriods((current) => current.map((period) => (period.id === id ? updated : period)));
      } catch (error) {
        setPeriods(anterior);
        throw error;
      }
    },
    [periods, session]
  );

  const remove = useCallback(
    async (id: string) => {
      const anterior = periods;
      setPeriods((current) => current.filter((period) => period.id !== id));

      if (!session) return;

      try {
        await api.removePeriod(session.accessToken, id);
      } catch (error) {
        setPeriods(anterior);
        throw error;
      }
    },
    [periods, session]
  );

  const find = useCallback(
    (id: string | null | undefined) => periods.find((period) => period.id === id) ?? null,
    [periods]
  );

  const value = useMemo(
    () => ({ periods, isLoading, refresh, create, edit, remove, find }),
    [periods, isLoading, refresh, create, edit, remove, find]
  );

  return <PeriodsContext.Provider value={value}>{children}</PeriodsContext.Provider>;
}

export function usePeriods() {
  const value = useContext(PeriodsContext);
  if (!value) {
    throw new Error('usePeriods debe usarse dentro de PeriodsProvider');
  }
  return value;
}
