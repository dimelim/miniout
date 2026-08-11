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

import type { Hint } from './hints';

export type Note = {
  id: string;
  body: string;
  hints: Hint[];
  createdAt: string;
  done?: boolean;
};

type NotesValue = {
  notes: Note[];
  isReady: boolean;
  addNote: (input: { body: string; hints: Hint[] }) => void;
  toggleDone: (id: string) => void;
  removeNote: (id: string) => void;
};

const STORAGE_KEY = 'miniout.notes.v1';

const NotesContext = createContext<NotesValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            setNotes(JSON.parse(raw) as Note[]);
          } catch {
            setNotes([]);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes)).catch(() => {});
  }, [notes, isReady]);

  const addNote = useCallback((input: { body: string; hints: Hint[] }) => {
    setNotes((current) => [
      {
        id: createId(),
        body: input.body,
        hints: input.hints,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const toggleDone = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, done: !note.done } : note))
    );
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  const value = useMemo(
    () => ({ notes, isReady, addNote, toggleDone, removeNote }),
    [notes, isReady, addNote, toggleDone, removeNote]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const value = useContext(NotesContext);
  if (!value) {
    throw new Error('useNotes debe usarse dentro de NotesProvider');
  }
  return value;
}
