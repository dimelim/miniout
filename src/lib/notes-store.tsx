import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, type Note } from './api';
import { useAuth } from './auth-store';
import { detectHints, type Hint } from './hints';

type NotesValue = {
  notes: Note[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (body: string, hints?: Hint[]) => Promise<Note>;
  edit: (id: string, body: string) => Promise<void>;
  toggle: (note: Note) => Promise<void>;
  remove: (id: string) => Promise<void>;
  find: (id: string | undefined) => Note | null;
};

const NotesContext = createContext<NotesValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      const payload = await api.notes(session.accessToken);
      setNotes(payload.notes.filter((note) => !note.deletedAt));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  const create = useCallback(
    async (body: string, hints?: Hint[]) => {
      if (!session) throw new Error('No hay sesión');

      const note = await api.createNote(session.accessToken, {
        body,
        hints: hints ?? detectHints(body),
      });

      setNotes((current) => [note, ...current]);
      return note;
    },
    [session]
  );

  const edit = useCallback(
    async (id: string, body: string) => {
      if (!session) throw new Error('No hay sesión');

      const updated = await api.updateNote(session.accessToken, id, {
        body,
        hints: detectHints(body),
      });

      setNotes((current) => current.map((note) => (note.id === id ? updated : note)));
    },
    [session]
  );

  const toggle = useCallback(
    async (note: Note) => {
      const done = !note.done;
      setNotes((current) =>
        current.map((item) => (item.id === note.id ? { ...item, done } : item))
      );

      if (!session) return;

      try {
        await api.updateNote(session.accessToken, note.id, { done });
      } catch {
        setNotes((current) =>
          current.map((item) => (item.id === note.id ? { ...item, done: note.done } : item))
        );
      }
    },
    [session]
  );

  const remove = useCallback(
    async (id: string) => {
      const anterior = notes;
      setNotes((current) => current.filter((note) => note.id !== id));

      if (!session) return;

      try {
        await api.removeNote(session.accessToken, id);
      } catch (error) {
        setNotes(anterior);
        throw error;
      }
    },
    [notes, session]
  );

  const find = useCallback(
    (id: string | undefined) => notes.find((note) => note.id === id) ?? null,
    [notes]
  );

  const value = useMemo(
    () => ({ notes, isLoading, refresh, create, edit, toggle, remove, find }),
    [notes, isLoading, refresh, create, edit, toggle, remove, find]
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
