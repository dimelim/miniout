import {
  alternar,
  desdeMarkdown,
  desplazar,
  diferencia,
  tieneTodo,
  trozos,
  VINETA,
} from './format';

describe('marcas', () => {
  it('pone y quita una marca en el mismo rango', () => {
    const puesta = alternar([], 'negrita', 0, 5);
    expect(puesta).toEqual([{ tipo: 'negrita', desde: 0, hasta: 5 }]);
    expect(alternar(puesta, 'negrita', 0, 5)).toEqual([]);
  });

  it('junta marcas que se tocan', () => {
    const marcas = alternar(alternar([], 'negrita', 0, 5), 'negrita', 5, 9);
    expect(marcas).toEqual([{ tipo: 'negrita', desde: 0, hasta: 9 }]);
  });

  it('parte una marca al quitar el trozo de en medio', () => {
    const marcas = alternar([{ tipo: 'cursiva', desde: 0, hasta: 10 }], 'cursiva', 3, 6);
    expect(marcas).toEqual([
      { tipo: 'cursiva', desde: 0, hasta: 3 },
      { tipo: 'cursiva', desde: 6, hasta: 10 },
    ]);
  });

  it('sabe si todo el rango lleva la marca', () => {
    const marcas = [{ tipo: 'negrita' as const, desde: 2, hasta: 8 }];
    expect(tieneTodo(marcas, 'negrita', 3, 7)).toBe(true);
    expect(tieneTodo(marcas, 'negrita', 1, 7)).toBe(false);
  });
});

describe('edicion', () => {
  it('encuentra el trozo que cambio', () => {
    expect(diferencia('hola mundo', 'hola bonito mundo')).toEqual({
      desde: 5,
      borrados: 0,
      insertados: 7,
    });
  });

  it('mueve las marcas cuando escribes antes', () => {
    const marcas = [{ tipo: 'negrita' as const, desde: 5, hasta: 10 }];
    expect(desplazar(marcas, { desde: 0, borrados: 0, insertados: 3 })).toEqual([
      { tipo: 'negrita', desde: 8, hasta: 13 },
    ]);
  });

  it('recorta las marcas cuando borras dentro', () => {
    const marcas = [{ tipo: 'negrita' as const, desde: 0, hasta: 10 }];
    expect(desplazar(marcas, { desde: 2, borrados: 4, insertados: 0 })).toEqual([
      { tipo: 'negrita', desde: 0, hasta: 6 },
    ]);
  });
});

describe('trozos', () => {
  it('parte el texto por las marcas', () => {
    expect(trozos('hola mundo', [{ tipo: 'negrita', desde: 0, hasta: 4 }])).toEqual([
      { texto: 'hola', tipos: ['negrita'] },
      { texto: ' mundo', tipos: [] },
    ]);
  });

  it('devuelve un solo trozo si no hay marcas', () => {
    expect(trozos('hola', [])).toEqual([{ texto: 'hola', tipos: [] }]);
  });
});

describe('markdown viejo', () => {
  it('convierte negrita y cursiva en marcas', () => {
    const { texto, marcas } = desdeMarkdown('esto es **fuerte** y _flojo_');

    expect(texto).toBe('esto es fuerte y flojo');
    expect(marcas).toContainEqual({ tipo: 'negrita', desde: 8, hasta: 14 });
    expect(marcas).toContainEqual({ tipo: 'cursiva', desde: 17, hasta: 22 });
  });

  it('convierte las listas en vinetas', () => {
    const { texto } = desdeMarkdown('- uno\n- [ ] dos');

    expect(texto).toBe(`${VINETA}uno\n${VINETA}dos`);
  });

  it('marca los titulos', () => {
    const { texto, marcas } = desdeMarkdown('# Titulo\ncuerpo');

    expect(texto).toBe('Titulo\ncuerpo');
    expect(marcas).toContainEqual({ tipo: 'titulo', desde: 0, hasta: 6 });
  });
});
