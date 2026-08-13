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

const KEY = 'miniout.mascota.v1';

export const MAX_NOMBRE_MASCOTA = 20;

export type Accesorio = 'ninguno' | 'casco' | 'gafas' | 'antena';

export type Mascota = {
  nombre: string;
  color: string | null;
  accesorio: Accesorio;
};

export const MASCOTA_COLORES = [
  '#e0891c',
  '#c2553c',
  '#7f8f3f',
  '#4f9068',
  '#4a7fb5',
  '#6b6fc4',
  '#a05a94',
];

export const ACCESORIOS: { id: Accesorio; label: string }[] = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'casco', label: 'Casco' },
  { id: 'gafas', label: 'Gafas' },
  { id: 'antena', label: 'Antena' },
];

const VACIA: Mascota = { nombre: '', color: null, accesorio: 'ninguno' };

type MascotaValue = {
  mascota: Mascota;
  cambiar: (patch: Partial<Mascota>) => Promise<void>;
};

const MascotaContext = createContext<MascotaValue>({
  mascota: VACIA,
  cambiar: async () => {},
});

export function MascotaProvider({ children }: { children: ReactNode }) {
  const [mascota, setMascota] = useState<Mascota>(VACIA);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;

        const parsed = JSON.parse(raw) as Partial<Mascota>;

        setMascota({
          nombre: typeof parsed.nombre === 'string' ? parsed.nombre : '',
          color: typeof parsed.color === 'string' ? parsed.color : null,
          accesorio: ACCESORIOS.some((uno) => uno.id === parsed.accesorio)
            ? (parsed.accesorio as Accesorio)
            : 'ninguno',
        });
      })
      .catch(() => {});
  }, []);

  const cambiar = useCallback(async (patch: Partial<Mascota>) => {
    setMascota((actual) => {
      const siguiente = { ...actual, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(siguiente)).catch(() => {});
      return siguiente;
    });
  }, []);

  const value = useMemo(() => ({ mascota, cambiar }), [mascota, cambiar]);

  return <MascotaContext.Provider value={value}>{children}</MascotaContext.Provider>;
}

export function useMascota() {
  return useContext(MascotaContext);
}
