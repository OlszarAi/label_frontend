'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '../../project-management/types/project.types';

interface UseProjectLabelsProps {
  projectId: string | null;
}

interface ProjectLabel extends Omit<Label, 'projectId'> {
  projectId: string;
}

export const useProjectLabels = ({ projectId }: UseProjectLabelsProps) => {
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Debounce thumbnail updates to prevent too many simultaneous requests
  const thumbnailUpdateQueue = useRef<Set<string>>(new Set());
  const thumbnailUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const lastThumbnailUpdate = useRef<Map<string, number>>(new Map());

  // Load project labels
  const loadLabels = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setLabels(data || []);
      } else {
        throw new Error('Failed to load labels');
      }
    } catch (error) {
      console.error('Error loading labels:', error);
      setError(error instanceof Error ? error.message : 'Failed to load labels');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Enhanced thumbnail refresh with time-based debouncing
  const refreshLabelThumbnail = useCallback(async (labelId: string) => {
    if (!labelId) return;
    
    // Check if we updated this thumbnail recently (within last 5 seconds)
    const now = Date.now();
    const lastUpdate = lastThumbnailUpdate.current.get(labelId) || 0;
    const timeSinceLastUpdate = now - lastUpdate;
    
    // If updated recently, add to queue for later processing
    if (timeSinceLastUpdate < 5000) {
      thumbnailUpdateQueue.current.add(labelId);
      
      // Clear existing timer
      if (thumbnailUpdateTimer.current) {
        clearTimeout(thumbnailUpdateTimer.current);
      }
      
      // Process queue after delay
      thumbnailUpdateTimer.current = setTimeout(async () => {
        const idsToUpdate = Array.from(thumbnailUpdateQueue.current);
        thumbnailUpdateQueue.current.clear();
        
        if (idsToUpdate.length === 0) return;
        
        try {
          // Update thumbnails in smaller batches
          const batchSize = 3;
          for (let i = 0; i < idsToUpdate.length; i += batchSize) {
            const batch = idsToUpdate.slice(i, i + batchSize);
            const promises = batch.map(async (id) => {
              try {
                const response = await fetch(`/api/projects/labels/${id}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                  },
                });
                
                if (response.ok) {
                  const { data: updatedLabel } = await response.json();
                  lastThumbnailUpdate.current.set(id, Date.now());
                  return updatedLabel;
                }
              } catch (error) {
                console.error(`Error refreshing thumbnail for label ${id}:`, error);
                return null;
              }
            });
            
            const updatedLabels = await Promise.all(promises);
            
            // Update labels state with new data
            setLabels(prev => prev.map(label => {
              const updated = updatedLabels.find(ul => ul?.id === label.id);
              return updated ? { ...label, ...updated } : label;
            }));
            
            // Small delay between batches to avoid overwhelming the server
            if (i + batchSize < idsToUpdate.length) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
        } catch (error) {
          console.error('Error in batch thumbnail refresh:', error);
        }
      }, 2000); // 2 second delay for batching
      
      return;
    }
    
    // Update immediately if enough time has passed
    try {
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const { data: updatedLabel } = await response.json();
        lastThumbnailUpdate.current.set(labelId, now);
        setLabels(prev => prev.map(label => 
          label.id === labelId ? { ...label, ...updatedLabel } : label
        ));
      }
    } catch (error) {
      console.error('Error refreshing label thumbnail:', error);
    }
  }, []);

  // Immediate thumbnail refresh for critical updates (manual saves)
  const refreshLabelThumbnailImmediate = useCallback(async (labelId: string) => {
    if (!labelId) return;
    
    try {
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const { data: updatedLabel } = await response.json();
        setLabels(prev => prev.map(label => 
          label.id === labelId ? { ...label, ...updatedLabel } : label
        ));
      }
    } catch (error) {
      console.error('Error refreshing label thumbnail:', error);
    }
  }, []);

  const createLabel = useCallback(async (labelData: {
    name: string;
    description?: string;
  }) => {
    if (!projectId) return null;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: labelData.name,
          description: labelData.description || '',
          width: 100,
          height: 50,
          fabricData: {
            objects: [],
            background: '#ffffff',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create label');
      }

      const { data } = await response.json();
      setLabels(prev => [data, ...prev]); // Add to beginning of list
      return data;
    } catch (err) {
      console.error('Error creating label:', err);
      return null;
    }
  }, [projectId]);

  const createLabelAndNavigate = useCallback(async () => {
    const newLabel = await createLabel({
      name: `New Label ${labels.length + 1}`,
      description: '',
    });
    
    if (newLabel) {
      // Navigate to the new label immediately
      router.push(`/editor/${newLabel.id}`);
    }
    
    return newLabel;
  }, [createLabel, labels.length, router]);

  const deleteLabel = useCallback(async (labelId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete label');
      }

      setLabels(prev => prev.filter(label => label.id !== labelId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label');
      return false;
    }
  }, []);

  const updateLabelInList = useCallback((labelId: string, updates: Partial<Label>) => {
    setLabels(prev => prev.map(label => 
      label.id === labelId 
        ? { ...label, ...updates, updatedAt: new Date().toISOString() }
        : label
    ));
  }, []);

  useEffect(() => {
    loadLabels();
    
    // Cleanup function to clear any pending timers and tracking data
    return () => {
      if (thumbnailUpdateTimer.current) {
        clearTimeout(thumbnailUpdateTimer.current);
        thumbnailUpdateTimer.current = null;
      }
      // Copy current values to avoid stale closure warnings
      const currentQueue = thumbnailUpdateQueue.current;
      const currentLastUpdate = lastThumbnailUpdate.current;
      currentQueue.clear();
      currentLastUpdate.clear();
    };
  }, [projectId, loadLabels]); // Use projectId directly instead of fetchLabels

  // Reset state when projectId changes
  useEffect(() => {
    if (!projectId) {
      setLabels([]);
      lastThumbnailUpdate.current.clear();
    }
  }, [projectId]);

  return {
    labels,
    loading,
    error,
    loadLabels,
    refreshLabelThumbnail,
    refreshLabelThumbnailImmediate,
    createLabel,
    createLabelAndNavigate,
    deleteLabel,
    updateLabelInList,
  };
};
