const DAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const LONG_MONTHS = [
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

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);
}

export function formatDayLabel(date: Date, now = new Date()) {
  const diff = daysBetween(date, now);

  if (diff === 0) return 'Hoy';
  if (diff === -1) return 'Ayer';
  if (diff === 1) return 'Mañana';
  if (diff > 1 && diff < 7) return capitalize(DAYS[date.getDay()]);
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRelative(date: Date, now = new Date()) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  return formatDayLabel(date, now);
}

export function weekdayName(index: number) {
  return DAYS[index];
}

export function formatLongDate(date: Date) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} de ${LONG_MONTHS[date.getMonth()]}`;
}

export function isSameDay(a: Date, b: Date) {
  return daysBetween(a, b) === 0;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
