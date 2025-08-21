"use client";
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useProjects } from '../hooks/useProjects';
import { Project, Label, CreateProjectRequest, UpdateProjectRequest } from '../types/project.types';

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
  createProject: (projectData: CreateProjectRequest) => Promise<{ success: boolean; data?: Project; error?: string }>;
  updateProject: (projectId: string, projectData: UpdateProjectRequest) => Promise<{ success: boolean; data?: Project; error?: string }>;
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
  }, [isAuthenticated, authLoading, token, fetchProjects]); // Depend on auth state

  const refreshProjects = useCallback(async () => {
    if (isAuthenticated && token) {
      console.log('🔄 ProjectContext: Force refreshing projects...');
      // Force fresh fetch by clearing local state first
      await fetchProjects();
    } else {
      console.log('🔄 ProjectContext: Cannot refresh - not authenticated');
    }
  }, [isAuthenticated, token, fetchProjects]);

  const refreshCurrentProject = useCallback(async (id?: string) => {
    if (isAuthenticated && token) {
      const target = id || currentProject?.id;
      console.log('🔄 ProjectContext: Refreshing current project:', target);
      if (target) await fetchProject(target);
    } else {
      console.log('🔄 ProjectContext: Cannot refresh project - not authenticated');
    }
  }, [isAuthenticated, token, currentProject?.id, fetchProject]);

  const refreshLabels = useCallback(async (projectId?: string) => {
    if (isAuthenticated && token) {
      const target = projectId || currentProject?.id;
      console.log('🔄 ProjectContext: Refreshing labels for project:', target);
      if (target) await fetchProjectLabels(target);
    } else {
      console.log('🔄 ProjectContext: Cannot refresh labels - not authenticated');
    }
  }, [isAuthenticated, token, currentProject?.id, fetchProjectLabels]);

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
