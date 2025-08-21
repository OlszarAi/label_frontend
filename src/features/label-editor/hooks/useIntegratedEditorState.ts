/**
 * New integrated editor state hook that works with centralized label management
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { EditorState, LabelDimensions, CanvasObject, EditorPreferences } from '../types/editor.types';
import { generateUUID } from '../utils/uuid';
import { generateThumbnailFromCanvas } from '../utils/thumbnailGenerator';
import { SaveManager } from '../../../utils/SaveManager';
import { useLabelManagement } from './useLabelManagement';
import { useLabelUUID, extractLabelUUID, ensureLabelUUIDConsistency } from './useLabelUUID';

interface LabelData {
  id: string;
  name: string;
  description?: string;
  fabricData?: unknown;
  width: number;
  height: number;
  projectId: string;
  version?: number;
}

const initialPreferences: EditorPreferences = {
  uuid: {
    uuidLength: 8,
    qrPrefix: 'https://example.com/',
  },
  grid: {
    size: 5,
    snapToGrid: false,
    showGrid: false,
    color: '#e0e0e0',
    opacity: 0.5,
  },
  ruler: {
    showRulers: false,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    opacity: 0.9,
    size: 24,
  },
};

const initialState: EditorState = {
  dimensions: { width: 100, height: 50 },
  zoom: 1,
  panX: 0,
  panY: 0,
  objects: [],
  selectedObjectId: null,
  preferences: initialPreferences,
};

export const useIntegratedEditorState = (labelId?: string, projectId?: string) => {
  // State
  const [state, setState] = useState<EditorState>(initialState);
  const [currentLabel, setCurrentLabel] = useState<LabelData | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for managing timers and state
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveAbortControllerRef = useRef<AbortController | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const isSwitchingLabelsRef = useRef(false);
  const loadingLabelRef = useRef<string | null>(null); // Track which label is being loaded

  // Use centralized label management
  const labelManager = useLabelManagement({ 
    projectId: projectId || undefined,
    autoLoad: false // We'll load manually based on labelId
  });

  // Use label UUID management system
  const labelUUIDManager = useLabelUUID({
    initialLength: state.preferences.uuid.uuidLength,
    autoRegenerate: true,
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (saveAbortControllerRef.current) {
      saveAbortControllerRef.current.abort();
      saveAbortControllerRef.current = null;
    }
    // Clear editor state when switching labels
    setState(prev => ({
      ...prev,
      objects: [],
      selectedObjectId: null,
    }));
  }, []);

  // Load label data into editor state
  const loadLabelIntoEditor = useCallback((label: LabelData) => {
    try {
      setCurrentLabel(label);
      
      // Clear previous state completely before loading new label
      setState(prev => ({
        ...prev,
        objects: [], // Clear all objects first
        selectedObjectId: null, // Clear selection
        dimensions: { width: label.width, height: label.height },
      }));
      
      // Parse fabric data if it exists
      const fabricData = label.fabricData as unknown;
      if (fabricData && typeof fabricData === 'object' && fabricData !== null) {
        const data = fabricData as { objects?: CanvasObject[]; preferences?: EditorPreferences };
        const objects = data.objects || [];
        const preferences = data.preferences || initialPreferences;
        
        // Extract existing UUID from objects if available
        const existingUUID = extractLabelUUID(objects);
        let processedObjects = objects;
        
        console.log('🔍 UUID extraction debug:', {
          objects: objects,
          objectsWithUUID: objects.filter(obj => obj.type === 'uuid' || obj.type === 'qrcode'),
          extractedUUID: existingUUID,
          hasQRorUUID: objects.some((obj: CanvasObject) => obj.type === 'qrcode' || obj.type === 'uuid')
        });
        
        if (existingUUID) {
          console.log(`✅ Found existing UUID: ${existingUUID}, setting in manager`);
          // Use existing UUID and ensure consistency - set the UUID in manager first
          labelUUIDManager.setUUID(existingUUID);
          processedObjects = ensureLabelUUIDConsistency(objects, existingUUID);
        } else if (objects.some((obj: CanvasObject) => obj.type === 'qrcode' || obj.type === 'uuid')) {
          console.log(`⚠️ Found QR/UUID objects but no extractable UUID, using manager UUID: ${labelUUIDManager.labelUUID}`);
          // If we have QR/UUID objects but no UUID, assign the current one
          processedObjects = labelUUIDManager.updateObjectsWithUUID(objects, labelUUIDManager.labelUUID);
        }
        
        setState(prev => ({
          ...prev,
          dimensions: { width: label.width, height: label.height },
          objects: processedObjects,
          selectedObjectId: null,
          preferences: {
            ...initialPreferences,
            ...preferences,
            uuid: {
              ...initialPreferences.uuid,
              ...preferences.uuid,
              // Ustaw labelUUID z etykiety!
              labelUUID: existingUUID || generateUUID(8),
              // Nie nadpisuj uuidLength jeśli jest już ustawiony w preferences!
              uuidLength: preferences.uuid?.uuidLength || existingUUID?.length || initialPreferences.uuid.uuidLength,
            }
          },
        }));
        
        console.log('📊 Loaded label preferences:', {
          qrPrefix: preferences.uuid?.qrPrefix,
          uuidLength: preferences.uuid?.uuidLength,
          existingUUID: existingUUID,
          finalQrPrefix: preferences.uuid?.qrPrefix || initialPreferences.uuid.qrPrefix
        });

        // Update UUID manager length to match preferences
        if (preferences.uuid?.uuidLength) {
          labelUUIDManager.updateUUIDLength(preferences.uuid.uuidLength);
        }
      } else {
        setState(prev => ({
          ...prev,
          dimensions: { width: label.width, height: label.height },
          objects: [],
          selectedObjectId: null,
        }));
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error loading label into editor:', error);
    }
  // labelUUIDManager is intentionally omitted to prevent re-creation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load or create label based on route parameters
  useEffect(() => {
    let isMounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const initializeLabel = async () => {
      // Prevent loading the same label multiple times
      if (loadingLabelRef.current === labelId) {
        return;
      }
      
      // Clear any existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce the API call to prevent rapid requests
      debounceTimer = setTimeout(async () => {
        if (!isMounted) return;
        
        try {
          if (labelId) {
            // Prevent duplicate loading
            if (loadingLabelRef.current === labelId) {
              return;
            }
            loadingLabelRef.current = labelId;
            
            // Load existing label
            const label = await labelManager.loadLabel(labelId);
            if (label && isMounted) {
              loadLabelIntoEditor(label);
            }
          } else if (projectId) {
            // Create new label
            const newLabel = await labelManager.createLabelAndNavigate();
            if (newLabel && isMounted) {
              loadLabelIntoEditor(newLabel);
            }
          }
        } catch (error) {
          console.error('Error initializing label:', error);
        } finally {
          loadingLabelRef.current = null;
        }
      }, 100); // 100ms debounce
    };

    initializeLabel();
    
    return () => {
      isMounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      loadingLabelRef.current = null;
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelId, projectId]);

  // Save label function with SaveManager to prevent race conditions
  const saveLabel = useCallback(async (isManualSave: boolean = false): Promise<boolean> => {
    if (!currentLabel || isSwitchingLabelsRef.current) return false;

    const saveKey = `label-${currentLabel.id}`;
    const saveManager = SaveManager.getInstance();

    const performSave = async (): Promise<boolean> => {
      try {
        // Cancel any existing save request
        if (saveAbortControllerRef.current) {
          saveAbortControllerRef.current.abort();
        }
        
        saveAbortControllerRef.current = new AbortController();

        // Generate thumbnail if canvas is available
        let thumbnail = '';
        if (canvasRef.current) {
          try {
            thumbnail = await generateThumbnailFromCanvas(canvasRef.current, 200);
          } catch (thumbnailError) {
            console.warn('Failed to generate thumbnail:', thumbnailError);
          }
        }

        // Prepare update data
        const updateData = {
          name: currentLabel.name,
          description: currentLabel.description,
          fabricData: {
            version: '6.0.0',
            objects: state.objects,
            preferences: state.preferences,
          },
          width: state.dimensions.width,
          height: state.dimensions.height,
          thumbnail: thumbnail || undefined,
          version: currentLabel.version,
        };

        // Use label manager to update
        const updatedLabel = await labelManager.updateLabel(currentLabel.id, updateData);
        
        if (updatedLabel) {
          setCurrentLabel(prev => prev ? { ...prev, version: updatedLabel.version } : null);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          return true;
        }

        return false;
      } catch (error) {
        console.error('Save error:', error);
        return false;
      }
    };

    // Use SaveManager to handle save based on type
    if (isManualSave) {
      return await saveManager.immediateSave(saveKey, performSave);
    } else {
      // Auto-save with debouncing
      const result = await saveManager.debouncedSave(saveKey, performSave, 2000);
      return result !== null ? result : false;
    }
  // labelManager is intentionally omitted from deps to prevent re-creation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLabel, state]);

  // Switch to different label
  const switchToLabel = useCallback(async (newLabelId: string) => {
    if (isSwitchingLabelsRef.current) return;

    try {
      isSwitchingLabelsRef.current = true;
      cleanup();

      const label = await labelManager.loadLabel(newLabelId);
      if (label) {
        loadLabelIntoEditor(label);
        // Update URL
        window.history.replaceState(null, '', `/editor/${label.id}`);
      }
    } catch (error) {
      console.error('Error switching label:', error);
    } finally {
      setTimeout(() => {
        isSwitchingLabelsRef.current = false;
      }, 100);
    }
  // labelManager and loadLabelIntoEditor are intentionally omitted to prevent re-creation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanup]);

  // State update functions
  const updateDimensions = useCallback((dimensions: LabelDimensions) => {
    setState(prev => ({ ...prev, dimensions }));
    setHasUnsavedChanges(true);
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const addObject = useCallback((object: Omit<CanvasObject, 'id'>) => {
    const newObject = { ...object, id: generateUUID() };
    
    // If it's a QR code or UUID object, ensure it uses the label's UUID
    if (newObject.type === 'qrcode' || newObject.type === 'uuid') {
      // Użyj UUID etykiety z preferences lub znajdź w obiektach
      let labelUUID = state.preferences.uuid.labelUUID;
      
      if (!labelUUID) {
        // Fallback: znajdź UUID w istniejących obiektach
        const foundUUID = extractLabelUUID(state.objects);
        if (foundUUID) {
          labelUUID = foundUUID;
        }
      }
      
      if (!labelUUID) {
        // Fallback: generuj nowy UUID dla etykiety
        labelUUID = generateUUID(8);
        console.log(`🆕 Generated new label UUID for object: ${labelUUID}`);
      }
      
      console.log(`🆕 Adding new ${newObject.type} object with label UUID: ${labelUUID}`);
      
      newObject.sharedUUID = labelUUID;
      if (newObject.type === 'uuid') {
        newObject.text = labelUUID;
      }
    }
    
    setState(prev => ({ ...prev, objects: [...prev.objects, newObject] }));
    setHasUnsavedChanges(true);
  }, [state.objects, state.preferences]);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const deleteObject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id),
      selectedObjectId: prev.selectedObjectId === id ? null : prev.selectedObjectId
    }));
    setHasUnsavedChanges(true);
  }, []);

  const selectObject = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedObjectId: id }));
  }, []);

  const updatePreferences = useCallback((preferences: EditorPreferences) => {
    // Use current state value instead of dependency
    setState(prev => {
      const oldLength = prev.preferences.uuid.uuidLength;
      const newLength = preferences.uuid.uuidLength;
      
      const updatedState = { ...prev, preferences };
      
      // If UUID length changed, update UUID manager and all objects
      if (oldLength !== newLength) {
        const newUUID = labelUUIDManager.updateUUIDLength(newLength);
        const updatedObjects = labelUUIDManager.updateObjectsWithUUID(prev.objects, newUUID);
        return { ...updatedState, objects: updatedObjects };
      }
      
      return updatedState;
    });
    setHasUnsavedChanges(true);
  // Removed dependencies to prevent re-creation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCanvasRef = useCallback((canvas: Canvas | null) => {
    canvasRef.current = canvas;
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && currentLabel) {
      const autoSaveTimer = setTimeout(() => {
        saveLabel(false); // false = auto-save
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  // saveLabel is intentionally omitted to prevent re-creation loops  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, hasUnsavedChanges, currentLabel]);

  return {
    // State
    state,
    currentLabel,
    autoSave,
    setAutoSave,
    hasUnsavedChanges,
    lastSaved,
    
    // Actions
    updateDimensions,
    updateZoom,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    updatePreferences,
    saveLabel,
    switchToLabel,
    setCanvasRef,
    
    // Label management integration
    labelManager,
    
    // UUID management
    labelUUIDManager,
    regenerateUUID: () => {
      const newUUID = labelUUIDManager.regenerateUUID();
      const updatedObjects = labelUUIDManager.updateObjectsWithUUID(state.objects, newUUID);
      setState(prev => ({ ...prev, objects: updatedObjects }));
      setHasUnsavedChanges(true);
      return newUUID;
    },
  };
};
