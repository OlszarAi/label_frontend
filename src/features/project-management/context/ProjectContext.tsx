"use client";
import React, { createContext, useContext, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useProjects } from '../hooks/useProjects';
import { Project, Label } from '../types/project.types';

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  labels: Label[];
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
  refreshCurrentProject: (id?: string) => Promise<void>;
  refreshLabels: (projectId?: string) => Promise<void>;
  // Add direct project operations from hook
  createProject: (projectData: any) => Promise<{ success: boolean; data?: Project; error?: string }>;
  updateProject: (projectId: string, projectData: any) => Promise<{ success: boolean; data?: Project; error?: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading, token } = useAuthContext();
  const {
    projects,
    currentProject,
    labels,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    fetchProjectLabels,
    setCurrentProject,
    createProject: hookCreateProject,
    updateProject: hookUpdateProject,
    deleteProject: hookDeleteProject
  } = useProjects();

  console.log('🏗️ ProjectContext: Provider mounted', { 
    isAuthenticated, 
    authLoading, 
    hasToken: !!token 
  });

  useEffect(() => {
    // Only fetch projects if user is authenticated and auth is not loading
    if (isAuthenticated && !authLoading && token) {
      console.log('🏗️ ProjectContext: User authenticated, fetching projects...');
      fetchProjects();
    } else {
      console.log('🏗️ ProjectContext: Not ready to fetch projects', { 
        isAuthenticated, 
        authLoading, 
        hasToken: !!token 
      });
    }
  }, [isAuthenticated, authLoading, token]); // Depend on auth state

  const refreshProjects = async () => {
    if (isAuthenticated && token) {
      console.log('🔄 ProjectContext: Force refreshing projects...');
      // Force fresh fetch by clearing local state first
      await fetchProjects();
    } else {
      console.log('🔄 ProjectContext: Cannot refresh - not authenticated');
    }
  };

  const refreshCurrentProject = async (id?: string) => {
    if (isAuthenticated && token) {
      const target = id || currentProject?.id;
      console.log('🔄 ProjectContext: Refreshing current project:', target);
      if (target) await fetchProject(target);
    } else {
      console.log('🔄 ProjectContext: Cannot refresh project - not authenticated');
    }
  };

  const refreshLabels = async (projectId?: string) => {
    if (isAuthenticated && token) {
      const target = projectId || currentProject?.id;
      console.log('🔄 ProjectContext: Refreshing labels for project:', target);
      if (target) await fetchProjectLabels(target);
    } else {
      console.log('🔄 ProjectContext: Cannot refresh labels - not authenticated');
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      labels,
      isLoading,
      error,
      setCurrentProject,
      refreshProjects,
      refreshCurrentProject,
      refreshLabels,
      createProject: hookCreateProject,
      updateProject: hookUpdateProject,
      deleteProject: hookDeleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
};
