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

export function gradeSteps(profile: Profile) {
  const scale = gradeScale(profile);
  const total = Math.round((scale.max - scale.min) / scale.step);

  return Array.from({ length: total + 1 }, (_, paso) =>
    Number((scale.min + paso * scale.step).toFixed(2))
  );
}
