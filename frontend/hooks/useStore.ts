import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Workflow, AIAgent, User } from '@/types';

interface AppState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  workflows: Workflow[];
  agents: AIAgent[];
  sidebarOpen: boolean;
  theme: 'dark' | 'light' | 'system';

  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  setAgents: (agents: AIAgent[]) => void;
  addAgent: (agent: AIAgent) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      projects: [],
      currentProject: null,
      workflows: [],
      agents: [],
      sidebarOpen: true,
      theme: 'dark',

      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      setWorkflows: (workflows) => set({ workflows }),
      addWorkflow: (workflow) =>
        set((state) => ({ workflows: [...state.workflows, workflow] })),
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) =>
        set((state) => ({ agents: [...state.agents, agent] })),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'leo-ai-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);
