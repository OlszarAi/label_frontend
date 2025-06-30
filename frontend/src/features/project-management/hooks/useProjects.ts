import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { projectService } from '../services/projectService';
import { 
  Project, 
  Label, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  CreateLabelRequest, 
  UpdateLabelRequest,
  ProjectsParams,
  LabelsParams
} from '../types/project.types';

export const useProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Project operations
  const fetchProjects = useCallback(async (params?: ProjectsParams) => {
    if (!token) {
      setError('No authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.getProjects(token, params);
      
      if (result.success && result.data) {
        setProjects(result.data.projects);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Fetch projects error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchProject = useCallback(async (projectId: string) => {
    if (!token) {
      setError('No authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.getProject(token, projectId);
      
      if (result.success && result.data) {
        setCurrentProject(result.data);
        setLabels(result.data.labels || []);
      } else {
        setError(result.error || 'Failed to fetch project');
      }
    } catch (err) {
      setError('Failed to fetch project');
      console.error('Fetch project error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createProject = useCallback(async (projectData: CreateProjectRequest) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.createProject(token, projectData);
      
      if (result.success && result.data) {
        // Add new project to the list
        setProjects(prev => [result.data!, ...prev]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create project');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to create project';
      setError(error);
      console.error('Create project error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateProject = useCallback(async (projectId: string, projectData: UpdateProjectRequest) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.updateProject(token, projectId, projectData);
      
      if (result.success && result.data) {
        // Update project in the list
        setProjects(prev => prev.map(p => p.id === projectId ? result.data! : p));
        if (currentProject?.id === projectId) {
          setCurrentProject(result.data);
        }
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update project');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to update project';
      setError(error);
      console.error('Update project error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token, currentProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.deleteProject(token, projectId);
      
      if (result.success) {
        // Remove project from the list
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          setLabels([]);
        }
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete project');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to delete project';
      setError(error);
      console.error('Delete project error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token, currentProject]);

  // Label operations
  const fetchProjectLabels = useCallback(async (projectId: string, params?: LabelsParams) => {
    if (!token) {
      setError('No authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.getProjectLabels(token, projectId, params);
      
      if (result.success && result.data) {
        setLabels(result.data);
      } else {
        setError(result.error || 'Failed to fetch labels');
      }
    } catch (err) {
      setError('Failed to fetch labels');
      console.error('Fetch labels error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createLabel = useCallback(async (projectId: string, labelData: CreateLabelRequest) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.createLabel(token, projectId, labelData);
      
      if (result.success && result.data) {
        // Add new label to the list
        setLabels(prev => [result.data!, ...prev]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create label');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to create label';
      setError(error);
      console.error('Create label error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateLabel = useCallback(async (labelId: string, labelData: UpdateLabelRequest) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.updateLabel(token, labelId, labelData);
      
      if (result.success && result.data) {
        // Update label in the list
        setLabels(prev => prev.map(l => l.id === labelId ? result.data! : l));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update label');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to update label';
      setError(error);
      console.error('Update label error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const deleteLabel = useCallback(async (labelId: string) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.deleteLabel(token, labelId);
      
      if (result.success) {
        // Remove label from the list
        setLabels(prev => prev.filter(l => l.id !== labelId));
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete label');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to delete label';
      setError(error);
      console.error('Delete label error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const duplicateLabel = useCallback(async (labelId: string) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'No authentication token' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.duplicateLabel(token, labelId);
      
      if (result.success && result.data) {
        // Add duplicated label to the list
        setLabels(prev => [result.data!, ...prev]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to duplicate label');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = 'Failed to duplicate label';
      setError(error);
      console.error('Duplicate label error:', err);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    // State
    projects,
    currentProject,
    labels,
    isLoading,
    error,
    pagination,

    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    duplicateLabel,
    clearError,

    // Setters for local state management
    setCurrentProject,
    setLabels
  };
};
