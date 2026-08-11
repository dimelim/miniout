import { weekdayName } from './dates';

export type Hint =
  | { kind: 'subject'; label: string }
  | { kind: 'date'; label: string; offsetDays: number };

const SUBJECTS = [
  'calculo',
  'algebra',
  'fisica',
  'quimica',
  'biologia',
  'estadistica',
  'programacion',
  'ingles',
  'historia',
  'filosofia',
  'economia',
  'derecho',
  'anatomia',
];

const RELATIVE_DAYS: Array<[RegExp, number]> = [
  [/\bhoy\b/, 0],
  [/\bmanana\b|\bmañana\b/, 1],
  [/\bpasado manana\b|\bpasado mañana\b/, 2],
];

const WEEKDAY_WORDS = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

const COMBINING_MARKS = /[̀-ͯ]/g;

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

function nextWeekdayOffset(target: number, from: Date) {
  const diff = (target - from.getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
}

export function detectHints(text: string, now = new Date()): Hint[] {
  if (!text.trim()) return [];

  const source = normalize(text);
  const hints: Hint[] = [];

  const subject = SUBJECTS.find((name) => source.includes(name));
  if (subject) {
    hints.push({ kind: 'subject', label: subject });
  }

  for (const [pattern, offsetDays] of RELATIVE_DAYS) {
    if (pattern.test(source)) {
      hints.push({
        kind: 'date',
        label: offsetDays === 0 ? 'hoy' : offsetDays === 1 ? 'manana' : 'pasado manana',
        offsetDays,
      });
      return hints;
    }
  }

  for (let index = 0; index < WEEKDAY_WORDS.length; index++) {
    const word = WEEKDAY_WORDS[index];
    if (new RegExp(`\\b${word}\\b`).test(source)) {
      hints.push({
        kind: 'date',
        label: weekdayName(index),
        offsetDays: nextWeekdayOffset(index, now),
      });
      break;
    }
  }

  return hints;
}
