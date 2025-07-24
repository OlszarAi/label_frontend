/**
 * Centralized hook for all label management operations
 * Replaces multiple scattered label management hooks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  labelManagementService, 
  type Label, 
  type CreateLabelRequest 
} from '../services/labelManagementService';

interface UseLabelManagementProps {
  projectId?: string;
  autoLoad?: boolean;
  onLabelCreated?: (label: Label) => void;
}

interface UseLabelManagementReturn {
  // State
  labels: Label[];
  currentLabel: Label | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadLabels: () => Promise<void>;
  loadLabel: (labelId: string) => Promise<Label | null>;
  createLabel: (request: Omit<CreateLabelRequest, 'projectId'>) => Promise<Label | null>;
  createLabelAndNavigate: (request?: Omit<CreateLabelRequest, 'projectId'>) => Promise<Label | null>;
  duplicateLabel: (labelId: string) => Promise<Label | null>;
  updateLabel: (labelId: string, updates: Partial<Label>) => Promise<Label | null>;
  deleteLabel: (labelId: string) => Promise<boolean>;
  createMultipleLabels: (requests: Omit<CreateLabelRequest, 'projectId'>[]) => Promise<Label[]>;
  
  // Utility
  refreshLabel: (labelId: string) => Promise<void>;
  setCurrentLabel: (label: Label | null) => void;
  clearError: () => void;
}

export const useLabelManagement = ({ 
  projectId, 
  autoLoad = true,
  onLabelCreated
}: UseLabelManagementProps = {}): UseLabelManagementReturn => {
  const router = useRouter();
  
  // State
  const [labels, setLabels] = useState<Label[]>([]);
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track loading state to prevent duplicate requests
  const loadingLabelsRef = useRef<Set<string>>(new Set());
  const lastLoadTimeRef = useRef<Map<string, number>>(new Map());

  // Auto-load labels when projectId changes
  useEffect(() => {
    if (projectId && autoLoad) {
      loadLabels();
    }
  }, [projectId, autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all labels for the project
  const loadLabels = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const projectLabels = await labelManagementService.getProjectLabels(projectId);
      setLabels(projectLabels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load labels';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Load a single label
  const loadLabel = useCallback(async (labelId: string): Promise<Label | null> => {
    // Prevent loading the same label multiple times
    if (loadingLabelsRef.current.has(labelId)) {
      return null;
    }
    
    // Check if we loaded this label recently (within 5 seconds)
    const now = Date.now();
    const lastLoadTime = lastLoadTimeRef.current.get(labelId) || 0;
    if (now - lastLoadTime < 5000) {
      // Return current label if it's the same ID
      if (currentLabel?.id === labelId) {
        return currentLabel;
      }
    }
    
    setError(null);
    loadingLabelsRef.current.add(labelId);
    lastLoadTimeRef.current.set(labelId, now);
    
    try {
      const label = await labelManagementService.getLabel(labelId);
      setCurrentLabel(label);
      
      // Update in labels array if it exists
      setLabels(prev => 
        prev.map(l => l.id === labelId ? label : l)
      );
      
      return label;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load label';
      setError(errorMessage);
      return null;
    } finally {
      loadingLabelsRef.current.delete(labelId);
    }
  }, [currentLabel]);

  // Create a new label
  const createLabel = useCallback(async (
    request: Omit<CreateLabelRequest, 'projectId'>
  ): Promise<Label | null> => {
    if (!projectId) {
      toast.error('Project ID is required');
      return null;
    }

    setError(null);
    
    try {
      const newLabel = await labelManagementService.createLabel({
        ...request,
        projectId
      });
      
      // Add to labels array
      setLabels(prev => [newLabel, ...prev]);
      
      // Call callback if provided
      onLabelCreated?.(newLabel);
      
      toast.success('Label created successfully');
      return newLabel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create label';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [projectId, onLabelCreated]);

  // Create a new label and navigate to it
  const createLabelAndNavigate = useCallback(async (
    request: Omit<CreateLabelRequest, 'projectId'> = {}
  ): Promise<Label | null> => {
    const newLabel = await createLabel(request);
    
    if (newLabel) {
      // Navigate to the new label in editor with projectId context
      const url = projectId ? `/editor/${newLabel.id}?projectId=${projectId}` : `/editor/${newLabel.id}`;
      router.push(url);
    }
    
    return newLabel;
  }, [createLabel, router, projectId]);

  // Duplicate an existing label
  const duplicateLabel = useCallback(async (labelId: string): Promise<Label | null> => {
    setError(null);
    
    try {
      const duplicatedLabel = await labelManagementService.duplicateLabel({ labelId });
      
      // Add to labels array
      setLabels(prev => [duplicatedLabel, ...prev]);
      
      toast.success('Label duplicated successfully');
      return duplicatedLabel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate label';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Update an existing label
  const updateLabel = useCallback(async (
    labelId: string, 
    updates: Partial<Label>
  ): Promise<Label | null> => {
    setError(null);
    
    try {
      const updatedLabel = await labelManagementService.updateLabel(labelId, updates);
      
      // Update in labels array
      setLabels(prev => 
        prev.map(l => l.id === labelId ? updatedLabel : l)
      );
      
      // Update current label if it's the one being updated
      if (currentLabel?.id === labelId) {
        setCurrentLabel(updatedLabel);
      }
      
      return updatedLabel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update label';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentLabel]);

  // Delete a label
  const deleteLabel = useCallback(async (labelId: string): Promise<boolean> => {
    setError(null);
    
    try {
      await labelManagementService.deleteLabel(labelId);
      
      // Remove from labels array
      setLabels(prev => prev.filter(l => l.id !== labelId));
      
      // Clear current label if it's the one being deleted
      if (currentLabel?.id === labelId) {
        setCurrentLabel(null);
      }
      
      toast.success('Label deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete label';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [currentLabel]);

  // Create multiple labels at once
  const createMultipleLabels = useCallback(async (
    requests: Omit<CreateLabelRequest, 'projectId'>[]
  ): Promise<Label[]> => {
    if (!projectId) {
      toast.error('Project ID is required');
      return [];
    }

    setError(null);
    
    try {
      const requestsWithProjectId = requests.map(req => ({
        ...req,
        projectId
      }));
      
      const newLabels = await labelManagementService.createMultipleLabels(requestsWithProjectId);
      
      // Add to labels array
      setLabels(prev => [...newLabels, ...prev]);
      
      toast.success(`${newLabels.length} labels created successfully`);
      return newLabels;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create labels';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, [projectId]);

  // Refresh a single label's data
  const refreshLabel = useCallback(async (labelId: string) => {
    try {
      const refreshedLabel = await labelManagementService.getLabel(labelId);
      
      // Update in labels array
      setLabels(prev => 
        prev.map(l => l.id === labelId ? refreshedLabel : l)
      );
      
      // Update current label if it's the one being refreshed
      if (currentLabel?.id === labelId) {
        setCurrentLabel(refreshedLabel);
      }
    } catch (err) {
      console.error('Failed to refresh label:', err);
    }
  }, [currentLabel]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    labels,
    currentLabel,
    isLoading,
    error,
    
    // Actions
    loadLabels,
    loadLabel,
    createLabel,
    createLabelAndNavigate,
    duplicateLabel,
    updateLabel,
    deleteLabel,
    createMultipleLabels,
    
    // Utility
    refreshLabel,
    setCurrentLabel,
    clearError,
  };
};
