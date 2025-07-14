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
}

const initialPreferences: EditorPreferences = {
  uuid: {
    uuidLength: 8,
    qrPrefix: 'https://example.com/',
  },
  grid: {
    enabled: false,
    size: 5, // 5mm grid by default
    snapToGrid: false,
    showGrid: false, // Don't show grid by default
    color: '#e0e0e0',
    opacity: 0.5,
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

  const [state, setState] = useState<EditorState>(initialState);
  const [currentLabel, setCurrentLabel] = useState<LabelData | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load label data when labelId changes, or create new label when projectId is provided
  useEffect(() => {
    if (labelId) {
      loadLabel(labelId);
    } else if (projectId) {
      createNewLabel(projectId);
    }
  }, [labelId, projectId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && currentLabel && state.objects.length > 0) {
      const timer = setTimeout(() => {
        saveLabel();
      }, 5000); // Auto-save every 5 seconds

      return () => clearTimeout(timer);
    }
  }, [state.objects, autoSave, currentLabel]);

  const loadLabel = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/labels/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const { data: label } = await response.json();
        setCurrentLabel(label);
        
        // Load fabric data into editor state
        if (label.fabricData) {
          setState(prev => ({
            ...prev,
            dimensions: { width: label.width, height: label.height },
            objects: label.fabricData.objects || [],
          }));
        } else {
          setState(prev => ({
            ...prev,
            dimensions: { width: label.width, height: label.height },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading label:', error);
    }
  };

  const createNewLabel = async (projectId: string) => {
    try {
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
        }));

        // Navigate to the new label's URL
        window.history.replaceState(null, '', `/editor/${label.id}`);
      }
    } catch (error) {
      console.error('Error creating new label:', error);
    }
  };

  const saveLabel = async () => {
    if (!currentLabel) return;

    try {
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

      const response = await fetch(`/api/projects/labels/${currentLabel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: currentLabel.name,
          description: currentLabel.description,
          fabricData,
          width: state.dimensions.width,
          height: state.dimensions.height,
          thumbnail: thumbnail || undefined, // Only send thumbnail if we have one
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving label:', error);
    }
  };

  const updateLabelName = useCallback((name: string) => {
    if (currentLabel) {
      setCurrentLabel(prev => prev ? { ...prev, name } : null);
    }
  }, [currentLabel]);

  const updateLabelDescription = useCallback((description: string) => {
    if (currentLabel) {
      setCurrentLabel(prev => prev ? { ...prev, description } : null);
    }
  }, [currentLabel]);

  const updateDimensions = useCallback((dimensions: LabelDimensions) => {
    setState(prev => ({ ...prev, dimensions }));
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, zoom)) }));
  }, []);

  const updatePan = useCallback((panX: number, panY: number) => {
    setState(prev => ({ ...prev, panX, panY }));
  }, []);

  const addObject = useCallback((object: Omit<CanvasObject, 'id'>) => {
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
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      )
    }));
  }, []);

  const deleteObject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id),
      selectedObjectId: prev.selectedObjectId === id ? null : prev.selectedObjectId
    }));
  }, []);

  const selectObject = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedObjectId: id }));
  }, []);

  const updatePreferences = useCallback((preferences: EditorPreferences) => {
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
  }, []);

  const resetEditor = useCallback(() => {
    setState(initialState);
  }, []);

  const bringToFront = useCallback((id: string) => {
    setState(prev => {
      const objects = [...prev.objects];
      const index = objects.findIndex(obj => obj.id === id);
      if (index > -1 && index < objects.length - 1) {
        const [obj] = objects.splice(index, 1);
        objects.push(obj);
      }
      return { ...prev, objects };
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setState(prev => {
      const objects = [...prev.objects];
      const index = objects.findIndex(obj => obj.id === id);
      if (index > 0) {
        const [obj] = objects.splice(index, 1);
        objects.unshift(obj);
      }
      return { ...prev, objects };
    });
  }, []);

  const moveUp = useCallback((id: string) => {
    setState(prev => {
      const objects = [...prev.objects];
      const index = objects.findIndex(obj => obj.id === id);
      if (index > -1 && index < objects.length - 1) {
        [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
      }
      return { ...prev, objects };
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setState(prev => {
      const objects = [...prev.objects];
      const index = objects.findIndex(obj => obj.id === id);
      if (index > 0) {
        [objects[index], objects[index - 1]] = [objects[index - 1], objects[index]];
      }
      return { ...prev, objects };
    });
  }, []);

  const setCanvasRef = useCallback((canvas: Canvas | null) => {
    canvasRef.current = canvas;
  }, []);

  return {
    state,
    currentLabel,
    autoSave,
    setAutoSave,
    lastSaved,
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
  };
};
