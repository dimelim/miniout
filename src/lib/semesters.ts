import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ICON } from '@/components/project-icons';

const KEY = 'miniout.semesters.v1';

export const MAX_SEMESTER_NAME = 40;
export const MAX_SUBJECT_NAME = 60;

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

export type Subject = {
  id: string;
  name: string;
  createdAt: string;
};

export type Semester = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subjects: Subject[];
  createdAt: string;
};

function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function isSemester(value: unknown): value is Semester {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Semester;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string';
}

export async function readSemesters(): Promise<Semester[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSemester).map((semester) => ({
      ...semester,
      icon: semester.icon ?? DEFAULT_ICON,
      color: semester.color ?? DEFAULT_COLOR,
      subjects: Array.isArray(semester.subjects) ? semester.subjects : [],
    }));
  } catch {
    return [];
  }
}

async function write(semesters: Semester[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(semesters));
  return semesters;
}

export function semesterNameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe un nombre';
  if (value.length > MAX_SEMESTER_NAME) return 'Ese nombre es demasiado largo';

  return null;
}

export function subjectNameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe una materia';
  if (value.length > MAX_SUBJECT_NAME) return 'Ese nombre es demasiado largo';

  return null;
}

export async function addSemester(input: { name: string; icon: string; color: string }) {
  const semesters = await readSemesters();

  const semester: Semester = {
    id: createId(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    subjects: [],
    createdAt: new Date().toISOString(),
  };

  return write([semester, ...semesters]);
}

export async function updateSemester(
  id: string,
  patch: { name?: string; icon?: string; color?: string }
) {
  const semesters = await readSemesters();

  return write(
    semesters.map((semester) =>
      semester.id === id
        ? {
            ...semester,
            ...patch,
            name: patch.name === undefined ? semester.name : patch.name.trim(),
          }
        : semester
    )
  );
}

export async function removeSemester(id: string) {
  const semesters = await readSemesters();

  return write(semesters.filter((semester) => semester.id !== id));
}

export async function addSubject(semesterId: string, name: string) {
  const semesters = await readSemesters();

  const subject: Subject = {
    id: createId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  return write(
    semesters.map((semester) =>
      semester.id === semesterId
        ? { ...semester, subjects: [...semester.subjects, subject] }
        : semester
    )
  );
}

export async function removeSubject(semesterId: string, subjectId: string) {
  const semesters = await readSemesters();

  return write(
    semesters.map((semester) =>
      semester.id === semesterId
        ? {
            ...semester,
            subjects: semester.subjects.filter((subject) => subject.id !== subjectId),
          }
        : semester
    )
  );
}

export function findSemester(semesters: Semester[], id: string | undefined) {
  return semesters.find((semester) => semester.id === id) ?? null;
}
