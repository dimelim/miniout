import type { Note } from './api';
import type { NoteOrder } from './preferences';

type Filtro = {
  busqueda?: string;
  projectId?: string | null;
  hideDone?: boolean;
};

function tiempo(valor: string | null) {
  return valor ? new Date(valor).getTime() : null;
}

export function ordenarNotas(notes: Note[], order: NoteOrder) {
  const copia = [...notes];

  if (order === 'antiguas') {
    return copia.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  if (order === 'entrega') {
    return copia.sort((a, b) => {
      const uno = tiempo(a.dueAt);
      const otro = tiempo(b.dueAt);

      if (uno === null && otro === null) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (uno === null) return 1;
      if (otro === null) return -1;

      return uno - otro;
    });
  }

  return copia.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function filtrarNotas(notes: Note[], filtro: Filtro) {
  const texto = filtro.busqueda?.trim().toLowerCase() ?? '';

  return notes.filter((note) => {
    if (filtro.hideDone && note.done) return false;
    if (filtro.projectId !== undefined && note.projectId !== filtro.projectId) return false;

    if (!texto) return true;

    return (
      note.body.toLowerCase().includes(texto) ||
      (note.title?.toLowerCase().includes(texto) ?? false) ||
      note.hints.some((hint) => hint.label.toLowerCase().includes(texto))
    );
  });
}
