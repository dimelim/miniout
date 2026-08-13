import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ICON } from '@/components/project-icons';

export const VIEJOS = 'miniout.semesters.v1';

export const MAX_SEMESTER_NAME = 40;

export const PROJECT_COLORS = [
  '#e0891c',
  '#c2553c',
  '#7f8f3f',
  '#4f9068',
  '#4a7fb5',
  '#6b6fc4',
  '#a05a94',
  '#7a7469',
];

export const DEFAULT_COLOR = PROJECT_COLORS[0];

type SemesterViejo = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subjects: { id: string; name: string; createdAt: string }[];
};

function esSemestre(value: unknown): value is SemesterViejo {
  if (!value || typeof value !== 'object') return false;

  const candidato = value as SemesterViejo;

  return typeof candidato.id === 'string' && typeof candidato.name === 'string';
}

export async function readSemesters(): Promise<SemesterViejo[]> {
  try {
    const raw = await AsyncStorage.getItem(VIEJOS);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(esSemestre).map((semestre) => ({
      ...semestre,
      icon: semestre.icon ?? DEFAULT_ICON,
      color: semestre.color ?? DEFAULT_COLOR,
      subjects: Array.isArray(semestre.subjects) ? semestre.subjects : [],
    }));
  } catch {
    return [];
  }
}

export function semesterNameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe un nombre';
  if (value.length > MAX_SEMESTER_NAME) return 'Ese nombre es demasiado largo';

  return null;
}
