'use client';

import { useState, useEffect, useCallback } from 'react';

interface Label {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  width: number;
  height: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
  createdAt: string;
  projectId: string;
}

export const useProjectLabels = (projectId?: string | null) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!projectId) {
      setLabels([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }

      const { data } = await response.json();
      setLabels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createLabel = useCallback(async (labelData: {
    name: string;
    description?: string;
    width?: number;
    height?: number;
  }) => {
    if (!projectId) return null;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: labelData.name,
          description: labelData.description,
          width: labelData.width || 100,
          height: labelData.height || 50,
          fabricData: {
            version: '6.0.0',
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
      setError(err instanceof Error ? err.message : 'Unknown error');
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
      window.location.href = `/editor/${newLabel.id}`;
    }
    
    return newLabel;
  }, [createLabel, labels.length]);

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
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  const refreshLabelThumbnail = useCallback(async (labelId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        updateLabelInList(labelId, {
          thumbnail: data.thumbnail,
          name: data.name,
          description: data.description,
          width: data.width,
          height: data.height,
          updatedAt: data.updatedAt
        });
      }
    } catch (err) {
      console.warn('Failed to refresh label thumbnail:', err);
    }
  }, [updateLabelInList]);

  useEffect(() => {
    fetchLabels();
  }, [projectId]); // Use projectId directly instead of fetchLabels

  // Reset state when projectId changes
  useEffect(() => {
    if (!projectId) {
      setLabels([]);
      setError(null);
    }
  }, [projectId]);

  return {
    labels,
    loading,
    error,
    refetch: fetchLabels,
    createLabel,
    createLabelAndNavigate,
    deleteLabel,
    updateLabelInList,
    refreshLabelThumbnail,
  };
};
