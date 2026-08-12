import { daysBetween, formatDayLabel } from './dates';

export type Atajo = { id: string; etiqueta: string; dias: number };

export const ATAJOS: Atajo[] = [
  { id: 'hoy', etiqueta: 'Hoy', dias: 0 },
  { id: 'manana', etiqueta: 'Mañana', dias: 1 },
  { id: 'pasado', etiqueta: 'Pasado mañana', dias: 2 },
  { id: 'semana', etiqueta: 'En una semana', dias: 7 },
];

export function conDias(dias: number, desde = new Date()) {
  const fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + dias, 9, 0, 0);
  return fecha;
}

export function mismoDia(a: Date, b: Date) {
  return daysBetween(a, b) === 0;
}

export function estadoDeEntrega(dueAt: string | null, ahora = new Date()) {
  if (!dueAt) return null;

  const fecha = new Date(dueAt);
  const diferencia = daysBetween(fecha, ahora);

  if (diferencia < 0) return { tono: 'vencido' as const, etiqueta: 'venció ' + formatDayLabel(fecha, ahora).toLowerCase() };
  if (diferencia === 0) return { tono: 'hoy' as const, etiqueta: 'para hoy' };
  if (diferencia === 1) return { tono: 'pronto' as const, etiqueta: 'para mañana' };

  return { tono: 'lejos' as const, etiqueta: `para el ${formatDayLabel(fecha, ahora).toLowerCase()}` };
}

export function nombreDelMes(fecha: Date) {
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  return `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function diasDelMes(fecha: Date) {
  const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const hueco = (primero.getDay() + 6) % 7;
  const total = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();

  const celdas: (Date | null)[] = Array.from({ length: hueco }, () => null);

  for (let dia = 1; dia <= total; dia++) {
    celdas.push(new Date(fecha.getFullYear(), fecha.getMonth(), dia, 9, 0, 0));
  }

  return celdas;
}
