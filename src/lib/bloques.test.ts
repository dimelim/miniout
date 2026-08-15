import type { Note, NoteDrawing, NoteImage } from './api';
import { construir, desplazarAnclas, fusionar, sanearNota } from './bloques';
import { diferencia } from './format';

const IMAGEN: NoteImage = { name: 'una.jpg', at: 0, width: 100, height: 100 };

const TRAZO: NoteDrawing = {
  id: 'firma1',
  at: 0,
  width: 1000,
  height: 640,
  strokes: [{ d: 'M0 0L10 10', color: 'tinta', width: 10 }],
};

function nota(campos: Partial<Note>): Note {
  return {
    id: 'nota1',
    title: null,
    body: '',
    hints: [],
    format: [],
    media: [],
    drawings: [],
    grade: null,
    projectId: null,
    done: false,
    dueAt: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...campos,
  };
}

describe('saneo', () => {
  it('manda al principio lo que estaba arriba y al final lo demas', () => {
    const vieja = nota({
      body: 'hola mundo',
      media: [
        { name: 'a.jpg', arriba: true, width: 10, height: 10 },
        { name: 'b.jpg', width: 10, height: 10 },
      ] as unknown as NoteImage[],
    });

    expect(sanearNota(vieja).media.map((imagen) => imagen.at)).toEqual([0, 10]);
  });

  it('quita los campos viejos que la api ya no acepta', () => {
    const vieja = nota({
      body: 'hola',
      media: [{ name: 'a.jpg', arriba: true, width: 10, height: 10 }] as unknown as NoteImage[],
    });

    expect(Object.keys(sanearNota(vieja).media[0])).not.toContain('arriba');
  });

  it('mete el ancla dentro del texto cuando se pasa', () => {
    const vieja = nota({ body: 'hola', media: [{ ...IMAGEN, at: 900 }] });

    expect(sanearNota(vieja).media[0].at).toBe(4);
  });
});

describe('bloques', () => {
  it('parte el texto donde esta el ancla', () => {
    const bloques = construir('hola mundo', [{ ...IMAGEN, at: 4 }], []);

    expect(bloques.map((bloque) => bloque.tipo)).toEqual(['texto', 'imagen', 'texto']);
    expect(bloques[0]).toMatchObject({ texto: 'hola', desde: 0 });
    expect(bloques[2]).toMatchObject({ texto: ' mundo', desde: 4 });
  });

  it('ordena las imagenes y las firmas por su sitio', () => {
    const bloques = construir('abcdef', [{ ...IMAGEN, at: 4 }], [{ ...TRAZO, at: 2 }]);

    expect(bloques.map((bloque) => bloque.tipo)).toEqual([
      'texto',
      'trazo',
      'texto',
      'imagen',
      'texto',
    ]);
  });

  it('deja un solo bloque cuando no hay nada anclado', () => {
    expect(construir('hola', [], [])).toEqual([
      { tipo: 'texto', clave: 'texto-0', texto: 'hola', desde: 0 },
    ]);
  });
});

describe('anclas', () => {
  it('corre el ancla cuando escribes antes', () => {
    const cambio = diferencia('hola mundo', 'hola gran mundo');

    expect(desplazarAnclas([{ ...IMAGEN, at: 10 }], cambio)[0].at).toBe(15);
  });

  it('deja el ancla donde estaba cuando escribes despues', () => {
    const cambio = diferencia('hola mundo', 'hola mundo largo');

    expect(desplazarAnclas([{ ...IMAGEN, at: 4 }], cambio)[0].at).toBe(4);
  });

  it('sube el ancla al borde cuando borras el trozo donde estaba', () => {
    const cambio = diferencia('hola mundo', 'hola');

    expect(desplazarAnclas([{ ...IMAGEN, at: 8 }], cambio)[0].at).toBe(4);
  });
});

describe('fusion', () => {
  it('respeta el sitio que tiene el editor y hace caso al servidor con la lista', () => {
    const locales = [{ ...IMAGEN, at: 7 }];
    const guardados = [
      { ...IMAGEN, at: 0 },
      { name: 'otra.jpg', at: 3, width: 10, height: 10 },
    ];

    expect(fusionar(locales, guardados, (imagen) => imagen.name)).toEqual([
      { ...IMAGEN, at: 7 },
      { name: 'otra.jpg', at: 3, width: 10, height: 10 },
    ]);
  });

  it('se olvida de lo que ya no esta guardado', () => {
    expect(fusionar([{ ...IMAGEN, at: 7 }], [], (imagen) => imagen.name)).toEqual([]);
  });
});
