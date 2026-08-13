import type { Evaluacion, Subject } from './periods';
import { SCALES, findScale, formatGrade, type Profile } from './profile';

export type GradeTone = 'alto' | 'justo' | 'bajo';

const FALLBACK = SCALES.find((scale) => scale.id === '0-20')!;

export function gradeScale(profile: Profile) {
  const elegida = findScale(profile.scale);

  return elegida && elegida.max > 0 ? elegida : FALLBACK;
}

export function passMarkOf(profile: Profile) {
  const scale = gradeScale(profile);

  return profile.passMark !== null && profile.scale === scale.id
    ? profile.passMark
    : scale.defaultPass;
}

export function gradeTone(value: number, profile: Profile): GradeTone {
  const scale = gradeScale(profile);
  const pass = passMarkOf(profile);

  if (value < pass) return 'bajo';
  if (value < pass + (scale.max - pass) * 0.4) return 'justo';

  return 'alto';
}

export function gradeLabel(value: number, profile: Profile) {
  return formatGrade(value, gradeScale(profile).decimals);
}

export function pesoTotal(evaluaciones: Evaluacion[]) {
  return evaluaciones.reduce((suma, una) => suma + una.peso, 0);
}

export function pesoCalificado(evaluaciones: Evaluacion[]) {
  return evaluaciones
    .filter((una) => una.nota !== null)
    .reduce((suma, una) => suma + una.peso, 0);
}

export function aporteActual(evaluaciones: Evaluacion[]) {
  return evaluaciones
    .filter((una) => una.nota !== null)
    .reduce((suma, una) => suma + (una.nota as number) * (una.peso / 100), 0);
}

export function notaHastaAhora(evaluaciones: Evaluacion[]) {
  const calificado = pesoCalificado(evaluaciones);

  if (calificado === 0) return null;

  return (aporteActual(evaluaciones) * 100) / calificado;
}

export function faltaParaPasar(evaluaciones: Evaluacion[], profile: Profile) {
  const pendiente = pesoTotal(evaluaciones) - pesoCalificado(evaluaciones);

  if (pendiente <= 0) return null;

  const necesario = ((passMarkOf(profile) - aporteActual(evaluaciones)) * 100) / pendiente;
  const scale = gradeScale(profile);

  return {
    pendiente,
    necesario: Math.max(scale.min, Number(necesario.toFixed(2))),
    imposible: necesario > scale.max,
    yaPasaste: necesario <= scale.min,
  };
}

export function promedioDelPeriodo(subjects: Subject[]) {
  const conNota = subjects
    .map((subject) => ({
      nota: notaHastaAhora(subject.evaluaciones),
      creditos: subject.creditos && subject.creditos > 0 ? subject.creditos : 1,
    }))
    .filter((una): una is { nota: number; creditos: number } => una.nota !== null);

  if (conNota.length === 0) return null;

  const creditos = conNota.reduce((suma, una) => suma + una.creditos, 0);

  return conNota.reduce((suma, una) => suma + una.nota * una.creditos, 0) / creditos;
}

export function gradeSteps(profile: Profile) {
  const scale = gradeScale(profile);
  const total = Math.round((scale.max - scale.min) / scale.step);

  return Array.from({ length: total + 1 }, (_, paso) =>
    Number((scale.min + paso * scale.step).toFixed(2))
  );
}
