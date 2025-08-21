'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { 
  CanvasEditor, 
  useEditorState, 
  useToolHandlers,
  // DEFAULT_DIMENSIONS, 
  // DEFAULT_GRID,
  // TOOL_TYPES,
  CanvasObject,
  // LabelDimensions,
  // EditorPreferences
  PropertiesPanel,
  UserAssetsPanel,
  ToolboxPanel
} from '@/features/label-editor';
import { Canvas } from 'fabric';
import { BulkLabelDesign, TemplateData } from '../types/bulk-label.types';

interface BulkLabelEditorProps {
  onDesignComplete: (design: BulkLabelDesign) => void;
  onCancel: () => void;
  initialTemplate?: TemplateData | null;
}

export const BulkLabelEditor: React.FC<BulkLabelEditorProps> = ({
  onDesignComplete,
  onCancel,
  initialTemplate
}) => {
  // dimensions są teraz zarządzane przez useEditorState
  // zoom, panX, panY są teraz zarządzane przez useEditorState
  const [designName, setDesignName] = useState(
    initialTemplate ? `${initialTemplate.name} - masowo` : 'Nowa etykieta masowa'
  );
  
  // Panel states
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);
  const [showToolbox, setShowToolbox] = useState(true);
  const [selectedTool, setSelectedTool] = useState('select');
  
  const canvasRef = useRef<Canvas | null>(null);
  
  const {
    state,
    addObject,
    updateObject,
    selectObject,
    updatePreferences,
    updateZoom,
    updateDimensions,
    labelUUIDManager,
  } = useEditorState();

  const { objects, selectedObjectId, preferences, zoom, panX, panY, dimensions } = state;

  // Tool handlers from label-editor
  const toolHandlers = useToolHandlers({
    state,
    addObject,
    setSelectedTool,
  });

  const handleObjectUpdate = useCallback((id: string, updates: Partial<CanvasObject>) => {
    updateObject(id, updates);
  }, [updateObject]);

  const handleObjectSelect = useCallback((id: string | null) => {
    selectObject(id);
  }, [selectObject]);

  // Load initial template data (only once when template changes)
  // IMPORTANT: Don't include addObject or updateDimensions in deps to prevent
  // template reloading when user adds objects, which would reset dimensions
  useEffect(() => {
    if (initialTemplate) {
      // Set dimensions
      if (initialTemplate.width && initialTemplate.height) {
        updateDimensions({ width: initialTemplate.width, height: initialTemplate.height });
      }
      
      // Load objects
      if (initialTemplate.fabricData?.objects && Array.isArray(initialTemplate.fabricData.objects)) {
        const templateObjects = initialTemplate.fabricData.objects as CanvasObject[];
        templateObjects.forEach(obj => {
          if (obj && typeof obj === 'object') {
            addObject(obj);
          }
        });
      }
    }
  }, [initialTemplate]); // Removed addObject and updateDimensions to prevent re-execution on every object addition

  const handleCanvasReady = useCallback((canvas: Canvas) => {
    canvasRef.current = canvas;
  }, []);

  const handleWheelZoom = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    updateZoom(newZoom);
  }, [zoom, updateZoom]);

  // Tool handlers take care of adding objects now

  const generateThumbnail = useCallback(async (): Promise<string | undefined> => {
    if (!canvasRef.current) return undefined;
    
    try {
      // Create thumbnail from canvas
      const dataURL = canvasRef.current.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5 // Smaller thumbnail
      });
      return dataURL;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return undefined;
    }
  }, []);

  const handleCompleteDesign = async () => {
    const thumbnail = await generateThumbnail();
    
    const design: BulkLabelDesign = {
      name: designName,
      width: dimensions.width,
      height: dimensions.height,
      fabricData: {
        version: '6.0.0',
        objects: objects,
        background: '#ffffff'
      },
      thumbnail
    };

    onDesignComplete(design);
  };

  const canComplete = objects && objects.length > 0 && designName.trim().length > 0;

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <ToolboxPanel
        onAddText={toolHandlers.handleAddText}
        onAddRectangle={toolHandlers.handleAddRectangle}
        onAddCircle={toolHandlers.handleAddCircle}
        onAddQRCode={toolHandlers.handleAddQRCode}
        onAddUUID={toolHandlers.handleAddUUID}
        onAddImage={toolHandlers.handleAddImage}
        onToggleAssets={() => setShowAssetsPanel(!showAssetsPanel)}
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        isVisible={showToolbox}
        onClose={() => setShowToolbox(false)}
      />

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Design Name Input with Toolbar Toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Nazwa wzoru etykiety..."
            className="flex-1 px-3 py-2 text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            onClick={() => setShowToolbox(!showToolbox)}
            className="ml-4 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showToolbox ? 'Ukryj narzędzia' : 'Pokaż narzędzia'}
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <CanvasEditor
            dimensions={dimensions}
            zoom={zoom}
            panX={panX}
            panY={panY}
            objects={objects}
            selectedObjectId={selectedObjectId}
            preferences={preferences}
            onObjectUpdate={handleObjectUpdate}
            onObjectSelect={handleObjectSelect}
            onCanvasReady={handleCanvasReady}
            onWheelZoom={handleWheelZoom}
          />
        </div>
      </div>

      {/* Properties Panel */}
      {showPropertiesPanel && (
        <PropertiesPanel
          isVisible={showPropertiesPanel}
          onClose={() => setShowPropertiesPanel(false)}
          selectedObject={selectedObjectId ? objects.find(obj => obj.id === selectedObjectId) : null}
          onObjectUpdate={handleObjectUpdate}
          dimensions={dimensions}
          onDimensionsChange={updateDimensions}
          preferences={preferences}
          onPreferencesUpdate={updatePreferences}
          onRegenerateUUID={() => labelUUIDManager.regenerateUUID()}
        />
      )}

      {/* User Assets Panel */}
      {showAssetsPanel && (
        <UserAssetsPanel
          isVisible={showAssetsPanel}
          onClose={() => setShowAssetsPanel(false)}
          onAssetSelect={toolHandlers.handleAddImage}
          onImportClick={() => {}}
        />
      )}

      {/* Show Properties Button when panel is hidden */}
      {!showPropertiesPanel && (
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
          <button
            onClick={() => setShowPropertiesPanel(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Pokaż właściwości
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-6 right-6 flex space-x-3">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Anuluj
        </button>
        <button
          onClick={handleCompleteDesign}
          disabled={!canComplete}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            canComplete
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Zatwierdź wzór
        </button>
      </div>
    </div>
  );
};
