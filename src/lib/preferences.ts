import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'miniout.notes.v1';

export type NoteOrder = 'recientes' | 'antiguas' | 'entrega' | 'calificacion';

export type NotePrefs = {
  order: NoteOrder;
  hideDone: boolean;
};

export const DEFAULT_PREFS: NotePrefs = { order: 'recientes', hideDone: false };

export const ORDERS: { id: NoteOrder; label: string }[] = [
  { id: 'recientes', label: 'Lo último' },
  { id: 'antiguas', label: 'Lo primero' },
  { id: 'entrega', label: 'Por entrega' },
  { id: 'calificacion', label: 'Por nota' },
];

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
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePrefs(prefs: NotePrefs) {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  return prefs;
}
