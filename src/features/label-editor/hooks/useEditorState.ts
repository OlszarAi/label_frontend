'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { EditorState, LabelDimensions, CanvasObject, EditorPreferences } from '../types/editor.types';
import { generateUUID } from '../utils/uuid';
import { generateThumbnailFromCanvas } from '../utils/thumbnailGenerator';

interface LabelData {
  id: string;
  name: string;
  description?: string;
  fabricData?: unknown;
  width: number;
  height: number;
  projectId: string;
  version?: number; // Add version for optimistic locking
}

const initialPreferences: EditorPreferences = {
  uuid: {
    uuidLength: 8,
    qrPrefix: 'https://example.com/',
  },
  grid: {
    size: 5, // 5mm grid by default
    snapToGrid: false,
    showGrid: false, // Don't show grid by default
    color: '#e0e0e0',
    opacity: 0.5,
  },
  ruler: {
    showRulers: false, // Rulers disabled by default
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    opacity: 0.9,
    size: 24, // Default ruler size in pixels
  },
};

const initialState: EditorState = {
  dimensions: { width: 100, height: 50 }, // Default 100x50mm
  zoom: 1,
  panX: 0,
  panY: 0,
  objects: [],
  selectedObjectId: null,
  preferences: initialPreferences,
};

export const useEditorState = (labelId?: string, projectId?: string | null) => {
  // Canvas reference for thumbnail generation
  const canvasRef = useRef<Canvas | null>(null);
  
  // Auto-save timer references for proper cleanup
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveAbortControllerRef = useRef<AbortController | null>(null);
  
  // Track if we're currently switching labels to prevent auto-save race conditions
  const isSwitchingLabelsRef = useRef(false);
  
  // Track loading state to prevent auto-save during initial load
  const isLoadingRef = useRef(false);

  const [state, setState] = useState<EditorState>(initialState);
  const [currentLabel, setCurrentLabel] = useState<LabelData | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cleanup function to cancel pending operations
  const cleanup = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (saveAbortControllerRef.current) {
      saveAbortControllerRef.current.abort();
      saveAbortControllerRef.current = null;
    }
  }, []);

  // Load label data when labelId changes, or create new label when projectId is provided
  useEffect(() => {
    if (labelId) {
      loadLabel(labelId);
    } else if (projectId) {
      createNewLabel(projectId);
    }
    
    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [labelId, projectId, cleanup]);

  // Debounced auto-save with proper race condition prevention
  const debouncedAutoSave = useCallback(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Don't auto-save if we're switching labels or loading
    if (isSwitchingLabelsRef.current || isLoadingRef.current || !hasUnsavedChanges || !currentLabel) {
      return;
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      // Double-check conditions before saving
      if (!isSwitchingLabelsRef.current && !isLoadingRef.current && hasUnsavedChanges && currentLabel) {
        try {
          // Abort any previous save request
          if (saveAbortControllerRef.current) {
            saveAbortControllerRef.current.abort();
          }
          
          // Create new abort controller for this save
          saveAbortControllerRef.current = new AbortController();
          
          const response = await fetch(`/api/projects/labels/${currentLabel.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              name: currentLabel.name,
              description: currentLabel.description,
              fabricData: {
                objects: state.objects,
                dimensions: state.dimensions,
                preferences: state.preferences,
              },
              width: state.dimensions.width,
              height: state.dimensions.height,
              version: currentLabel.version, // Include version for optimistic locking
            }),
            signal: saveAbortControllerRef.current.signal,
          });

          if (response.ok) {
            const { data: updatedLabel } = await response.json();
            setCurrentLabel(updatedLabel);
            setHasUnsavedChanges(false);
            setLastSaved(new Date());
            
            // Optimized thumbnail update - only update occasionally to reduce server load
            const shouldUpdateThumbnail = Math.random() < 0.2; // 20% chance
            if (shouldUpdateThumbnail && canvasRef.current) {
              // Use setTimeout to not block the save operation
              setTimeout(() => {
                try {
                  const thumbnailDataUrl = generateThumbnailFromCanvas(canvasRef.current!);
                  // Send thumbnail update in background without blocking
                  fetch(`/api/projects/labels/${currentLabel.id}/thumbnail`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    body: JSON.stringify({ thumbnail: thumbnailDataUrl }),
                  }).catch(() => {
                    // Silently fail thumbnail updates to avoid disrupting user experience
                  });
                } catch {
                  // Ignore thumbnail generation errors during autosave
                }
              }, 500);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Auto-save failed:', error);
          }
        }
      }
    }, 2000);
  }, [hasUnsavedChanges, currentLabel, state.objects, state.dimensions, state.preferences]);

  // Auto-save effect with improved dependencies
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && currentLabel && !isSwitchingLabelsRef.current && !isLoadingRef.current) {
      debouncedAutoSave();
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [autoSave, hasUnsavedChanges, currentLabel, debouncedAutoSave]);

  const loadLabel = async (id: string) => {
    try {
      // Set loading and switching flags to prevent auto-save race conditions
      isLoadingRef.current = true;
      isSwitchingLabelsRef.current = true;
      
      // Cleanup any pending operations
      cleanup();

      const response = await fetch(`/api/projects/labels/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const { data: label } = await response.json();
        
        // Update current label first
        setCurrentLabel(label);
        
        // Load fabric data into editor state
        if (label.fabricData) {
          setState(prev => ({
            ...prev,
            dimensions: { width: label.width, height: label.height },
            objects: label.fabricData.objects || [],
            selectedObjectId: null, // Clear selection when switching
          }));
        } else {
          setState(prev => ({
            ...prev,
            dimensions: { width: label.width, height: label.height },
            objects: [],
            selectedObjectId: null,
          }));
        }
        
        // Reset state flags
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error loading label:', error);
    } finally {
      // Clear loading and switching flags after a brief delay to ensure state has settled
      setTimeout(() => {
        isLoadingRef.current = false;
        isSwitchingLabelsRef.current = false;
      }, 100);
    }
  };

  const createNewLabel = async (projectId: string) => {
    try {
      isLoadingRef.current = true;
      cleanup();

      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: 'New Label',
          description: '',
          width: 100,
          height: 50,
          fabricData: {
            version: '6.0.0',
            objects: [],
            background: '#ffffff',
          },
        }),
      });

      if (response.ok) {
        const { data: label } = await response.json();
        setCurrentLabel(label);
        
        setState(prev => ({
          ...prev,
          dimensions: { width: label.width, height: label.height },
          objects: [],
          selectedObjectId: null,
        }));

        setHasUnsavedChanges(false);
        setLastSaved(new Date());

        // Navigate to the new label's URL
        window.history.replaceState(null, '', `/editor/${label.id}`);
      }
    } catch (error) {
      console.error('Error creating new label:', error);
    } finally {
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  };

  const saveLabel = async () => {
    if (!currentLabel || isSwitchingLabelsRef.current) return false;

    try {
      // Cancel any existing save request
      if (saveAbortControllerRef.current) {
        saveAbortControllerRef.current.abort();
      }
      
      // Create new abort controller for this save request
      saveAbortControllerRef.current = new AbortController();

      const fabricData = {
        version: '6.0.0',
        objects: state.objects,
        background: '#ffffff',
      };

      // Generate thumbnail using Fabric.js canvas if available
      let thumbnail = '';
      if (canvasRef.current) {
        try {
          thumbnail = await generateThumbnailFromCanvas(canvasRef.current, 200);
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError);
        }
      }

      const requestBody = {
        name: currentLabel.name,
        description: currentLabel.description,
        fabricData,
        width: state.dimensions.width,
        height: state.dimensions.height,
        thumbnail: thumbnail || undefined,
        // Include version for optimistic locking
        ...(currentLabel.version && { version: currentLabel.version }),
      };

      const response = await fetch(`/api/projects/labels/${currentLabel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(requestBody),
        signal: saveAbortControllerRef.current.signal,
      });

      if (response.ok) {
        const { data: updatedLabel } = await response.json();
        
        // Update current label with new version
        setCurrentLabel(prev => prev ? { ...prev, version: updatedLabel.version } : null);
        setLastSaved(new Date());
        return true;
      } else if (response.status === 409) {
        // Handle version conflict (optimistic locking)
        console.warn('Label was modified by another session, reloading...');
        await loadLabel(currentLabel.id);
        return false;
      } else {
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Save request was cancelled');
        return false;
      }
      console.error('Error saving label:', error);
      return false;
    } finally {
      saveAbortControllerRef.current = null;
    }
  };

  // Utility function for safe label switching
  const switchToLabel = useCallback(async (newLabelId: string) => {
    // Prevent race conditions during switching
    isSwitchingLabelsRef.current = true;
    
    try {
      // Cancel any pending auto-save
      cleanup();
      
      // Load the new label
      await loadLabel(newLabelId);
      
      // Update URL without page refresh
      window.history.pushState(null, '', `/editor/${newLabelId}`);
      
    } catch (error) {
      console.error('Error switching to label:', error);
    } finally {
      // Reset switching flag after a delay
      setTimeout(() => {
        isSwitchingLabelsRef.current = false;
      }, 100);
    }
  }, [cleanup]);

  // Track changes for unsaved state (only when not loading or switching)
  useEffect(() => {
    if (!isLoadingRef.current && !isSwitchingLabelsRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [state.objects, state.dimensions, currentLabel?.name, currentLabel?.description]);

  const updateLabelName = useCallback((name: string) => {
    if (currentLabel && !isLoadingRef.current) {
      setCurrentLabel(prev => prev ? { ...prev, name } : null);
    }
  }, [currentLabel]);

  const updateLabelDescription = useCallback((description: string) => {
    if (currentLabel && !isLoadingRef.current) {
      setCurrentLabel(prev => prev ? { ...prev, description } : null);
    }
  }, [currentLabel]);

  const updateDimensions = useCallback((dimensions: LabelDimensions) => {
    if (!isLoadingRef.current) {
      setState(prev => ({ ...prev, dimensions }));
    }
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, zoom)) }));
  }, []);

  const updatePan = useCallback((panX: number, panY: number) => {
    setState(prev => ({ ...prev, panX, panY }));
  }, []);

  const addObject = useCallback((object: Omit<CanvasObject, 'id'>) => {
    if (!isLoadingRef.current) {
      const newObject: CanvasObject = {
        ...object,
        id: crypto.randomUUID(),
      };
      setState(prev => ({ 
        ...prev, 
        objects: [...prev.objects, newObject],
        selectedObjectId: newObject.id 
      }));
      return newObject.id;
    }
    return null;
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    if (!isLoadingRef.current) {
      setState(prev => ({
        ...prev,
        objects: prev.objects.map(obj => 
          obj.id === id ? { ...obj, ...updates } : obj
        )
      }));
    }
  }, []);

  const deleteObject = useCallback((id: string) => {
    if (!isLoadingRef.current) {
      setState(prev => ({
        ...prev,
        objects: prev.objects.filter(obj => obj.id !== id),
        selectedObjectId: prev.selectedObjectId === id ? null : prev.selectedObjectId
      }));
    }
  }, []);

  const selectObject = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedObjectId: id }));
  }, []);

  const updatePreferences = useCallback((preferences: EditorPreferences) => {
    if (!isLoadingRef.current) {
      setState(prev => {
        const newState = { ...prev, preferences };
        
        // Update all existing UUID and QR objects with new preferences
        const updatedObjects = newState.objects.map(obj => {
          if (obj.type === 'uuid' || obj.type === 'qrcode') {
            // Generate new UUID if length changed or object doesn't have one
            const needsNewUUID = !obj.sharedUUID || 
              (obj.sharedUUID.length !== preferences.uuid.uuidLength);
            
            if (needsNewUUID) {
              const newUUID = generateUUID(preferences.uuid.uuidLength);
              return {
                ...obj,
                sharedUUID: newUUID,
                text: obj.type === 'uuid' ? newUUID : obj.text
              };
            }
          }
          return obj;
        });
        
        return { ...newState, objects: updatedObjects };
      });
    }
  }, []);

  const resetEditor = useCallback(() => {
    cleanup();
    setState(initialState);
    setCurrentLabel(null);
    setHasUnsavedChanges(false);
    setLastSaved(null);
  }, [cleanup]);

  const bringToFront = useCallback((id: string) => {
    if (!isLoadingRef.current) {
      setState(prev => {
        const objects = [...prev.objects];
        const index = objects.findIndex(obj => obj.id === id);
        if (index > -1 && index < objects.length - 1) {
          const [obj] = objects.splice(index, 1);
          objects.push(obj);
        }
        return { ...prev, objects };
      });
    }
  }, []);

  const sendToBack = useCallback((id: string) => {
    if (!isLoadingRef.current) {
      setState(prev => {
        const objects = [...prev.objects];
        const index = objects.findIndex(obj => obj.id === id);
        if (index > 0) {
          const [obj] = objects.splice(index, 1);
          objects.unshift(obj);
        }
        return { ...prev, objects };
      });
    }
  }, []);

  const moveUp = useCallback((id: string) => {
    if (!isLoadingRef.current) {
      setState(prev => {
        const objects = [...prev.objects];
        const index = objects.findIndex(obj => obj.id === id);
        if (index > -1 && index < objects.length - 1) {
          [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
        }
        return { ...prev, objects };
      });
    }
  }, []);

  const moveDown = useCallback((id: string) => {
    if (!isLoadingRef.current) {
      setState(prev => {
        const objects = [...prev.objects];
        const index = objects.findIndex(obj => obj.id === id);
        if (index > 0) {
          [objects[index], objects[index - 1]] = [objects[index - 1], objects[index]];
        }
        return { ...prev, objects };
      });
    }
  }, []);

  const setCanvasRef = useCallback((canvas: Canvas | null) => {
    canvasRef.current = canvas;
  }, []);

  const replaceObjects = useCallback((newObjects: CanvasObject[]) => {
    setState(prev => ({
      ...prev,
      objects: newObjects,
      selectedObjectId: null
    }));
  }, []);

  return {
    state,
    currentLabel,
    autoSave,
    setAutoSave,
    lastSaved,
    hasUnsavedChanges,
    updateDimensions,
    updateZoom,
    updatePan,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    updatePreferences,
    resetEditor,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    saveLabel,
    updateLabelName,
    updateLabelDescription,
    setCanvasRef,
    replaceObjects,
    switchToLabel, // New safe switching function
    setLastSaved,
  };
};
