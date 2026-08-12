import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'miniout.profile.v1';

export type Stage = 'colegio' | 'universidad';
export type ScaleId = '0-5' | '1-10' | '0-20' | '0-100' | 'letras';

export type Profile = {
  stage: Stage | null;
  scale: ScaleId | null;
  passMark: number | null;
};

export const EMPTY_PROFILE: Profile = { stage: null, scale: null, passMark: null };

export const SCALES: {
  id: ScaleId;
  label: string;
  sample: string;
  min: number;
  max: number;
  step: number;
  defaultPass: number;
  decimals: number;
}[] = [
  { id: '0-5', label: 'De 0 a 5', sample: '4,2', min: 0, max: 5, step: 0.1, defaultPass: 3, decimals: 1 },
  { id: '1-10', label: 'De 1 a 10', sample: '8,5', min: 1, max: 10, step: 0.5, defaultPass: 6, decimals: 1 },
  { id: '0-20', label: 'De 0 a 20', sample: '17', min: 0, max: 20, step: 1, defaultPass: 14, decimals: 0 },
  { id: '0-100', label: 'De 0 a 100', sample: '85', min: 0, max: 100, step: 1, defaultPass: 60, decimals: 0 },
  { id: 'letras', label: 'Con letras', sample: 'B+', min: 0, max: 0, step: 0, defaultPass: 0, decimals: 0 },
];

export function findScale(id: ScaleId | null) {
  return SCALES.find((scale) => scale.id === id) ?? null;
}

export function formatGrade(value: number, decimals: number) {
  return value.toFixed(decimals).replace('.', ',');
}

export function periodWords(stage: Stage | null) {
  if (stage === 'colegio') {
    return {
      plural: 'Tus periodos',
      singular: 'Periodo',
      one: 'Nuevo periodo',
      example: 'Tercer periodo',
      importTitle: 'Importar las materias de tu colegio',
      importHint: 'Eliges tu colegio y tu grado, y las materias del periodo entran solas.',
    };
  }

  return {
    plural: 'Tus semestres',
    singular: 'Semestre',
    one: 'Nuevo semestre',
    example: 'Semestre 2026-2',
    importTitle: 'Importar materias de tu universidad',
    importHint: 'Eliges tu universidad y tu carrera, y las materias del semestre entran solas.',
  };
}

export async function readProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY_PROFILE;

    const parsed = JSON.parse(raw) as Partial<Profile>;

    return {
      stage: parsed.stage ?? null,
      scale: parsed.scale ?? null,
      passMark: typeof parsed.passMark === 'number' ? parsed.passMark : null,
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: Profile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}
