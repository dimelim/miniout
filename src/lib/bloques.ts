import type { Note, NoteDrawing, NoteImage } from './api';
import { moverPosicion, type Cambio } from './format';

export type Bloque =
  | { tipo: 'texto'; clave: string; texto: string; desde: number }
  | { tipo: 'imagen'; clave: string; imagen: NoteImage }
  | { tipo: 'trazo'; clave: string; trazo: NoteDrawing };

type Anclado = { at?: number; arriba?: boolean };

function ancla(elemento: Anclado, largo: number) {
  if (typeof elemento.at === 'number') return Math.min(largo, Math.max(0, elemento.at));

  return elemento.arriba ? 0 : largo;
}

export function sanearNota(note: Note): Note {
  const largo = note.body.length;

  return {
    ...note,
    media: (note.media ?? []).map((imagen) => ({
      name: imagen.name,
      at: ancla(imagen, largo),
      width: imagen.width,
      height: imagen.height,
      scale: imagen.scale,
      rotation: imagen.rotation,
      offsetX: imagen.offsetX,
      offsetY: imagen.offsetY,
    })),
    drawings: (note.drawings ?? []).map((trazo) => ({
      id: trazo.id,
      at: ancla(trazo, largo),
      width: trazo.width,
      height: trazo.height,
      strokes: trazo.strokes,
    })),
  };
}

export function construir(
  texto: string,
  imagenes: NoteImage[],
  trazos: NoteDrawing[]
): Bloque[] {
  const anclados = [
    ...imagenes.map((imagen) => ({
      at: imagen.at,
      bloque: { tipo: 'imagen', clave: imagen.name, imagen } as Bloque,
    })),
    ...trazos.map((trazo) => ({
      at: trazo.at,
      bloque: { tipo: 'trazo', clave: trazo.id, trazo } as Bloque,
    })),
  ].sort((uno, otro) => uno.at - otro.at);

  const bloques: Bloque[] = [];
  let cursor = 0;

  for (const anclado of anclados) {
    const corte = Math.min(texto.length, Math.max(cursor, anclado.at));

    bloques.push({
      tipo: 'texto',
      clave: `texto-${bloques.length}`,
      texto: texto.slice(cursor, corte),
      desde: cursor,
    });
    bloques.push(anclado.bloque);
    cursor = corte;
  }

  bloques.push({
    tipo: 'texto',
    clave: `texto-${bloques.length}`,
    texto: texto.slice(cursor),
    desde: cursor,
  });

  return bloques;
}

export function desplazarAnclas<T extends { at: number }>(elementos: T[], cambio: Cambio) {
  return elementos.map((elemento) => ({
    ...elemento,
    at: moverPosicion(elemento.at, cambio),
  }));
}

export function fusionar<T extends { at: number }>(
  locales: T[],
  guardados: T[],
  clave: (elemento: T) => string
) {
  const posiciones = new Map(locales.map((elemento) => [clave(elemento), elemento.at]));

  return guardados.map((elemento) => {
    const at = posiciones.get(clave(elemento));

    return at === undefined ? elemento : { ...elemento, at };
  });
}
