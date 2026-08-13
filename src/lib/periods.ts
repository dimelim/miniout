export type Clase = {
  id: string;
  dia: number;
  inicio: string;
  fin: string;
  lugar?: string;
};

export type Apunte = {
  id: string;
  fecha: string;
  texto: string;
};

export type Encargo = {
  id: string;
  titulo: string;
  fecha: string | null;
  hecho: boolean;
};

export type Evaluacion = {
  id: string;
  nombre: string;
  peso: number;
  nota: number | null;
  fecha: string | null;
};

export type Subject = {
  id: string;
  name: string;
  createdAt: string;
  creditos?: number;
  clases: Clase[];
  apuntes: Apunte[];
  encargos: Encargo[];
  evaluaciones: Evaluacion[];
};


export const REPARTOS: { id: string; label: string; pesos: number[]; detalle: string }[] = [
  { id: 'tres-cortes', label: 'Tres cortes', pesos: [30, 30, 40], detalle: '30, 30 y 40' },
  { id: 'dos-parciales', label: 'Dos parciales', pesos: [50, 50], detalle: 'Mitad y mitad' },
  { id: 'cuatro', label: 'Cuatro notas', pesos: [25, 25, 25, 25], detalle: 'Todas valen igual' },
  { id: 'con-final', label: 'Con examen final', pesos: [20, 20, 20, 40], detalle: 'El final pesa 40' },
];

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const MAX_SUBJECT_NAME = 60;
export const MAX_APUNTE = 500;
export const MAX_ENCARGO = 120;

export function crearId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function subjectNameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe una materia';
  if (value.length > MAX_SUBJECT_NAME) return 'Ese nombre es demasiado largo';

  return null;
}

export function completarSubject(subject: Partial<Subject> & { id: string; name: string }): Subject {
  return {
    id: subject.id,
    name: subject.name,
    createdAt: subject.createdAt ?? new Date().toISOString(),
    ...(subject.creditos ? { creditos: subject.creditos } : {}),
    clases: subject.clases ?? [],
    apuntes: subject.apuntes ?? [],
    encargos: subject.encargos ?? [],
    evaluaciones: subject.evaluaciones ?? [],
  };
}

export function ordenarClases(clases: Clase[] = []) {
  return [...clases].sort((una, otra) =>
    una.dia === otra.dia ? una.inicio.localeCompare(otra.inicio) : una.dia - otra.dia
  );
}

export function resumenHorario(clases: Clase[] = []) {
  if (clases.length === 0) return null;

  return ordenarClases(clases)
    .map((clase) => `${DIAS_CORTOS[clase.dia]} ${clase.inicio}`)
    .join(' · ');
}

export function horaValida(valor: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

export function normalizarHora(valor: string) {
  const limpio = valor.replace(/[^0-9]/g, '').slice(0, 4);

  if (limpio.length <= 2) return limpio;

  if (limpio.length === 3 && Number(limpio[0]) > 2) {
    return `0${limpio[0]}:${limpio.slice(1)}`;
  }

  return `${limpio.slice(0, 2)}:${limpio.slice(2)}`;
}

export function clasesDelDia(subjects: Subject[] = [], dia: number) {
  return subjects
    .flatMap((subject) =>
      (subject.clases ?? [])
        .filter((clase) => clase.dia === dia)
        .map((clase) => ({ subject, clase }))
    )
    .sort((una, otra) => una.clase.inicio.localeCompare(otra.clase.inicio));
}

export function encargosPendientes(subjects: Subject[] = []) {
  return subjects
    .flatMap((subject) =>
      (subject.encargos ?? []).filter((encargo) => !encargo.hecho).map((encargo) => ({ subject, encargo }))
    )
    .sort((uno, otro) => {
      if (!uno.encargo.fecha && !otro.encargo.fecha) return 0;
      if (!uno.encargo.fecha) return 1;
      if (!otro.encargo.fecha) return -1;

      return uno.encargo.fecha.localeCompare(otro.encargo.fecha);
    });
}
