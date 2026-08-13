import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'miniout.notes.v1';

export type NoteOrder = 'recientes' | 'antiguas' | 'entrega' | 'calificacion';

export type NotePrefs = {
  order: NoteOrder;
  hideDone: boolean;
  projectId: string | null;
  soloConNota: boolean;
};

export const DEFAULT_PREFS: NotePrefs = {
  order: 'recientes',
  hideDone: false,
  projectId: null,
  soloConNota: false,
};

export const ORDERS: { id: NoteOrder; label: string }[] = [
  { id: 'recientes', label: 'Lo último' },
  { id: 'antiguas', label: 'Lo primero' },
  { id: 'entrega', label: 'Por entrega' },
  { id: 'calificacion', label: 'Por calificación' },
];

export function filtrosActivos(prefs: NotePrefs) {
  return [
    prefs.projectId !== null,
    prefs.soloConNota,
    prefs.hideDone,
    prefs.order !== DEFAULT_PREFS.order,
  ].filter(Boolean).length;
}

export async function readPrefs(): Promise<NotePrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;

    const parsed = JSON.parse(raw) as Partial<NotePrefs>;

    return {
      order: ORDERS.some((orden) => orden.id === parsed.order)
        ? (parsed.order as NoteOrder)
        : DEFAULT_PREFS.order,
      hideDone: parsed.hideDone === true,
      projectId: typeof parsed.projectId === 'string' ? parsed.projectId : null,
      soloConNota: parsed.soloConNota === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePrefs(prefs: NotePrefs) {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  return prefs;
}
