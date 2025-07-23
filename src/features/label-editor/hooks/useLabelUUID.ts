/**
 * Label UUID Management System
 * 
 * This hook manages a single UUID per label that is shared between all QR codes and UUID objects.
 * It ensures consistency across the entire label and handles UUID length changes properly.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { generateUUID, validateUUIDLength } from '../utils/uuid';
import { CanvasObject } from '../types/editor.types';

interface LabelUUIDState {
  // The master UUID for this label
  labelUUID: string;
  // Current UUID length setting
  uuidLength: number;
  // Whether UUID needs regeneration due to length change
  needsRegeneration: boolean;
}

export interface LabelUUIDManager {
  // Current label UUID
  labelUUID: string;
  // Get UUID for display/use
  getDisplayUUID: () => string;
  // Get UUID for QR codes (with prefix)
  getQRCodeData: (prefix: string) => string;
  // Regenerate UUID (when length changes or manual regeneration)
  regenerateUUID: (newLength?: number) => string;
  // Set specific UUID (for loading existing labels)
  setUUID: (uuid: string) => void;
  // Update UUID length and regenerate if needed
  updateUUIDLength: (newLength: number) => string;
  // Update all objects with new UUID
  updateObjectsWithUUID: (objects: CanvasObject[], newUUID: string) => CanvasObject[];
  // Check if objects need UUID update
  needsUUIDUpdate: (objects: CanvasObject[]) => boolean;
}

interface UseLabelUUIDOptions {
  initialLength?: number;
  autoRegenerate?: boolean;
}

export const useLabelUUID = (options: UseLabelUUIDOptions = {}): LabelUUIDManager => {
  const { initialLength = 8, autoRegenerate = true } = options;
  
  // State
  const [state, setState] = useState<LabelUUIDState>(() => ({
    labelUUID: generateUUID(validateUUIDLength(initialLength)),
    uuidLength: validateUUIDLength(initialLength),
    needsRegeneration: false,
  }));

  // Ref to prevent infinite loops
  const isUpdatingRef = useRef(false);

  // Get display UUID (truncated to current length)
  const getDisplayUUID = useCallback((): string => {
    if (state.labelUUID.length === state.uuidLength) {
      return state.labelUUID;
    }
    
    // Truncate or pad as needed
    if (state.labelUUID.length > state.uuidLength) {
      return state.labelUUID.substring(0, state.uuidLength);
    } else {
      // Pad with new random characters
      let uuid = state.labelUUID;
      while (uuid.length < state.uuidLength) {
        uuid += Math.floor(Math.random() * 16).toString(16);
      }
      return uuid;
    }
  }, [state.labelUUID, state.uuidLength]);

  // Get QR code data with prefix
  const getQRCodeData = useCallback((prefix: string): string => {
    return `${prefix}${getDisplayUUID()}`;
  }, [getDisplayUUID]);

  // Regenerate UUID
  const regenerateUUID = useCallback((newLength?: number): string => {
    if (isUpdatingRef.current) return state.labelUUID;
    
    isUpdatingRef.current = true;
    
    const length = newLength !== undefined ? validateUUIDLength(newLength) : state.uuidLength;
    const newUUID = generateUUID(length);
    
    setState(prev => ({
      ...prev,
      labelUUID: newUUID,
      uuidLength: length,
      needsRegeneration: false,
    }));
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
    
    return newUUID;
  }, [state.labelUUID, state.uuidLength]);

  // Set specific UUID (for loading existing labels)
  const setUUID = useCallback((uuid: string): void => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    setState(prev => ({
      ...prev,
      labelUUID: uuid,
      uuidLength: uuid.length,
      needsRegeneration: false,
    }));
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, []);

  // Update UUID length
  const updateUUIDLength = useCallback((newLength: number): string => {
    if (isUpdatingRef.current) return state.labelUUID;
    
    const validatedLength = validateUUIDLength(newLength);
    
    if (validatedLength === state.uuidLength) {
      return getDisplayUUID();
    }

    // Always regenerate when length changes to ensure consistency
    if (autoRegenerate) {
      return regenerateUUID(validatedLength);
    } else {
      setState(prev => ({
        ...prev,
        uuidLength: validatedLength,
        needsRegeneration: validatedLength !== prev.labelUUID.length,
      }));
      return getDisplayUUID();
    }
  }, [state.uuidLength, state.labelUUID, regenerateUUID, getDisplayUUID, autoRegenerate]);

  // Update objects with current UUID
  const updateObjectsWithUUID = useCallback((objects: CanvasObject[], newUUID?: string): CanvasObject[] => {
    const currentUUID = newUUID || getDisplayUUID();
    
    return objects.map(obj => {
      if (obj.type === 'qrcode' || obj.type === 'uuid') {
        return {
          ...obj,
          sharedUUID: currentUUID,
          // For UUID objects, also update the display text
          ...(obj.type === 'uuid' ? { text: currentUUID } : {}),
        };
      }
      return obj;
    });
  }, [getDisplayUUID]);

  // Check if any objects need UUID update
  const needsUUIDUpdate = useCallback((objects: CanvasObject[]): boolean => {
    const currentUUID = getDisplayUUID();
    
    return objects.some(obj => {
      if (obj.type === 'qrcode' || obj.type === 'uuid') {
        return obj.sharedUUID !== currentUUID || 
               (obj.type === 'uuid' && obj.text !== currentUUID);
      }
      return false;
    });
  }, [getDisplayUUID]);

  // Auto-update when length changes (if enabled)
  useEffect(() => {
    if (state.needsRegeneration && autoRegenerate && !isUpdatingRef.current) {
      regenerateUUID();
    }
  }, [state.needsRegeneration, autoRegenerate, regenerateUUID]);

  return {
    labelUUID: getDisplayUUID(),
    getDisplayUUID,
    getQRCodeData,
    regenerateUUID,
    setUUID,
    updateUUIDLength,
    updateObjectsWithUUID,
    needsUUIDUpdate,
  };
};

// Helper function to ensure all objects on a label use the same UUID
export const ensureLabelUUIDConsistency = (
  objects: CanvasObject[], 
  targetUUID: string
): CanvasObject[] => {
  return objects.map(obj => {
    if (obj.type === 'qrcode' || obj.type === 'uuid') {
      return {
        ...obj,
        sharedUUID: targetUUID,
        ...(obj.type === 'uuid' ? { text: targetUUID } : {}),
      };
    }
    return obj;
  });
};

// Helper to get UUID from existing objects (for migration/consistency)
export const extractLabelUUID = (objects: CanvasObject[]): string | null => {
  for (const obj of objects) {
    if ((obj.type === 'qrcode' || obj.type === 'uuid') && obj.sharedUUID) {
      return obj.sharedUUID;
    }
  }
  return null;
};
