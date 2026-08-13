import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, type Project } from './api';
import { useAuth } from './auth-store';

export const MAX_PROJECT_NAME = 40;

type ProjectsValue = {
  projects: Project[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: { name: string; icon: string; color: string }) => Promise<Project>;
  edit: (id: string, patch: { name?: string; icon?: string; color?: string }) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  find: (id: string | null | undefined) => Project | null;
};

const ProjectsContext = createContext<ProjectsValue | null>(null);

export function projectNameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe un nombre';
  if (value.length > MAX_PROJECT_NAME) return 'Ese nombre es demasiado largo';

  return null;
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      const payload = await api.projects(session.accessToken);
      setProjects(payload.projects);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  const create = useCallback(
    async (input: { name: string; icon: string; color: string }) => {
      if (!session) throw new Error('No hay sesión');

      const project = await api.createProject(session.accessToken, input);
      setProjects((current) => [...current, project]);

      return project;
    },
    [session]
  );

  const edit = useCallback(
    async (id: string, patch: { name?: string; icon?: string; color?: string }) => {
      if (!session) throw new Error('No hay sesión');

      const updated = await api.updateProject(session.accessToken, id, patch);
      setProjects((current) =>
        current.map((project) => (project.id === id ? updated : project))
      );
    },
    [session]
  );

  const reorder = useCallback(
    async (ids: string[]) => {
      const anterior = projects;
      const porId = new Map(projects.map((project) => [project.id, project]));

      setProjects(
        ids
          .map((id, position) => {
            const project = porId.get(id);
            return project ? { ...project, position } : null;
          })
          .filter((project): project is Project => project !== null)
      );

      if (!session) return;

      try {
        await api.orderProjects(session.accessToken, ids);
      } catch {
        setProjects(anterior);
      }
    },
    [projects, session]
  );

  const remove = useCallback(
    async (id: string) => {
      const anterior = projects;
      setProjects((current) => current.filter((project) => project.id !== id));

      if (!session) return;

      try {
        await api.removeProject(session.accessToken, id);
      } catch (error) {
        setProjects(anterior);
        throw error;
      }
    },
    [projects, session]
  );

  const find = useCallback(
    (id: string | null | undefined) =>
      projects.find((project) => project.id === id) ?? null,
    [projects]
  );

  const value = useMemo(
    () => ({ projects, isLoading, refresh, create, edit, reorder, remove, find }),
    [projects, isLoading, refresh, create, edit, reorder, remove, find]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const value = useContext(ProjectsContext);
  if (!value) {
    throw new Error('useProjects debe usarse dentro de ProjectsProvider');
  }
  return value;
}
