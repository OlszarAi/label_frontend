'use client';

import { useState, useCallback } from 'react';
import { EditorState, LabelDimensions, CanvasObject, EditorPreferences } from '../types/editor.types';
import { generateUUID } from '../utils/uuid';

const initialPreferences: EditorPreferences = {
  uuid: {
    uuidLength: 8,
    qrPrefix: 'https://example.com/',
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

export const useEditorState = () => {
  const [state, setState] = useState<EditorState>(initialState);

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

  return {
    state,
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
  };
};
