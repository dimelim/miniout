import { detectHints } from './hints';

const MARTES = new Date(2026, 7, 11);

describe('detectHints', () => {
  it('no propone nada con texto vacio', () => {
    expect(detectHints('')).toEqual([]);
    expect(detectHints('   ')).toEqual([]);
  });

  it('saca la materia del texto', () => {
    expect(detectHints('repasar limites de calculo', MARTES)).toContainEqual({
      kind: 'subject',
      label: 'cálculo',
    });
  });

  it('encuentra la materia aunque venga con tilde', () => {
    expect(detectHints('taller de fisíca', MARTES)).toContainEqual({
      kind: 'subject',
      label: 'física',
    });
  });

  it('resuelve mañana como el día siguiente', () => {
    expect(detectHints('entregar manana', MARTES)).toContainEqual({
      kind: 'date',
      label: 'mañana',
      offsetDays: 1,
    });
  });

  it('acepta mañana con eñe', () => {
    expect(detectHints('entregar mañana', MARTES)).toContainEqual({
      kind: 'date',
      label: 'mañana',
      offsetDays: 1,
    });
  });

  it('resuelve un dia de la semana al proximo que toca', () => {
    expect(detectHints('parcial el viernes', MARTES)).toContainEqual({
      kind: 'date',
      label: 'viernes',
      offsetDays: 3,
    });
  });

  it('manda al de la semana que viene cuando el dia es hoy', () => {
    expect(detectHints('reunion el martes', MARTES)).toContainEqual({
      kind: 'date',
      label: 'martes',
      offsetDays: 7,
    });
  });

  it('saca materia y fecha del mismo texto', () => {
    const hints = detectHints('parcial de calculo el viernes', MARTES);
    expect(hints).toHaveLength(2);
    expect(hints[0]).toEqual({ kind: 'subject', label: 'cálculo' });
    expect(hints[1]).toEqual({ kind: 'date', label: 'viernes', offsetDays: 3 });
  });

  it('prefiere la fecha relativa sobre el día de la semana', () => {
    const hints = detectHints('el viernes no, manana', MARTES);
    const dates = hints.filter((hint) => hint.kind === 'date');
    expect(dates).toHaveLength(1);
    expect(dates[0]).toMatchObject({ label: 'mañana' });
  });

  it('no propone materia cuando el nombre va dentro de otra palabra', () => {
    const hints = detectHints('me duele fisicamente', MARTES);
    expect(hints.filter((hint) => hint.kind === 'subject')).toHaveLength(0);
  });

  it('propone la materia aunque lleve signos pegados', () => {
    expect(detectHints('parcial de quimica, el jueves', MARTES)).toContainEqual({
      kind: 'subject',
      label: 'química',
    });
  });
});
