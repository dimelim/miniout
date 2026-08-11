import { weekdayName } from './dates';

export type Hint =
  | { kind: 'subject'; label: string }
  | { kind: 'date'; label: string; offsetDays: number };

const SUBJECTS = [
  'cálculo',
  'álgebra',
  'física',
  'química',
  'biología',
  'estadística',
  'programación',
  'inglés',
  'historia',
  'filosofía',
  'economía',
  'derecho',
  'anatomía',
];

const RELATIVE_DAYS: Array<[RegExp, number, string]> = [
  [/\bhoy\b/, 0, 'hoy'],
  [/\bmanana\b/, 1, 'mañana'],
  [/\bpasado manana\b/, 2, 'pasado mañana'],
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

  const subject = SUBJECTS.find((name) =>
    new RegExp(`\\b${normalize(name)}\\b`).test(source)
  );
  if (subject) {
    hints.push({ kind: 'subject', label: subject });
  }

  for (const [pattern, offsetDays, label] of RELATIVE_DAYS) {
    if (pattern.test(source)) {
      hints.push({ kind: 'date', label, offsetDays });
      return hints;
    }
  }

  for (let index = 0; index < WEEKDAY_WORDS.length; index++) {
    if (new RegExp(`\\b${WEEKDAY_WORDS[index]}\\b`).test(source)) {
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
