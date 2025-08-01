'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useEditorState } from '../hooks/useEditorState';
import { useLabelManagement } from '../hooks/useLabelManagement';
import { useToolHandlers } from '../hooks/useToolHandlers';
import { useZoomControls } from '../hooks/useZoomControls';
import { useLabelActions } from '../hooks/useLabelActions';
import { CanvasEditor } from './CanvasEditor';
import { MainToolbar } from './toolbar/MainToolbar';
import { ToolboxPanel } from './panels/ToolboxPanel';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { GalleryPanel } from './panels/GalleryPanel';
import { UserAssetsPanel } from './assets/UserAssetsPanel';
import { KEYBOARD_SHORTCUTS, TOOL_TYPES } from '../constants';
import type { Label } from '../services/labelManagementService';
import '../styles/editor.css';

interface LabelEditorProps {
  labelId?: string;
  projectId?: string | null;
}

export const LabelEditor = ({ labelId, projectId }: LabelEditorProps) => {
  const [selectedTool, setSelectedTool] = useState<string>(TOOL_TYPES.SELECT);
  const [effectiveProjectId, setEffectiveProjectId] = useState<string | null>(projectId || null);
  
  // Panel visibility states
  const [panelVisibility, setPanelVisibility] = useState({
    properties: true,
    gallery: true,
    assets: false,
  });

  // Connection monitoring
  const [isConnected] = useState(true);

  // Use centralized label management instead of scattered hooks
  const labelManager = useLabelManagement({ 
    projectId: effectiveProjectId || undefined, 
    autoLoad: true,
    onLabelCreated: (newLabel: Label) => {
      // Refresh labels list to include the new label
      console.log('New label created in editor:', newLabel);
      // The labelManager will automatically update its labels list
    }
  });

  const {
    state,
    currentLabel,
    autoSave,
    setAutoSave,
    hasUnsavedChanges,
    updateDimensions,
    updateZoom,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    updatePreferences,
    saveLabel,
    setCanvasRef,
    switchToLabel,
    regenerateUUID,
  } = useEditorState(labelId, effectiveProjectId || undefined);

  // Custom hooks for cleaner code
  const toolHandlers = useToolHandlers({
    state,
    addObject,
    setSelectedTool
  });

  const zoomControls = useZoomControls({
    zoom: state.zoom,
    updateZoom
  });

  const labelActions = useLabelActions({
    saveLabel,
    currentLabel,
    refreshLabelThumbnail: labelManager.refreshLabel,
    refreshLabelThumbnailImmediate: labelManager.refreshLabel,
    switchToLabel,
    createLabelAndNavigate: labelManager.createLabelAndNavigate,
    hasUnsavedChanges,
    autoSave,
    onLabelCreated: (newLabel: Label) => {
      // New label created - it should already be in the list via labelManager callback
      console.log('New label created in editor actions:', newLabel);
    }
  });

  // Update effectiveProjectId when currentLabel becomes available
  useEffect(() => {
    if (currentLabel?.projectId && !effectiveProjectId) {
      setEffectiveProjectId(currentLabel.projectId);
    }
  }, [currentLabel?.projectId, effectiveProjectId]);

  const onToggleAssets = () => {
    togglePanel('assets');
  };

  const onAssetSelect = (asset: any) => {
    // Add the selected asset as an image object
    addObject({
      type: 'image',
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      imageUrl: asset.url,
      imageOriginalWidth: asset.width,
      imageOriginalHeight: asset.height,
    });
    // Close the assets panel after selection
    togglePanel('assets');
  };

  // Enhanced autosave effect that uses optimized save function
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && currentLabel && labelActions.handleAutoSave) {
      const autoSaveTimer = setTimeout(() => {
        labelActions.handleAutoSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  // Intentionally excluding state.objects, state.dimensions, state.preferences to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, hasUnsavedChanges, currentLabel]);

  const selectedObject = state.selectedObjectId 
    ? state.objects.find(obj => obj.id === state.selectedObjectId) || null
    : null;

  // Panel toggle handlers
  const togglePanel = useCallback((panelName: keyof typeof panelVisibility) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  }, []);

  // Keyboard shortcuts with react-hotkeys-hook using constants
  useHotkeys(KEYBOARD_SHORTCUTS.TEXT_TOOL, toolHandlers.handleAddText, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.RECTANGLE_TOOL, toolHandlers.handleAddRectangle, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.CIRCLE_TOOL, toolHandlers.handleAddCircle, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.QRCODE_TOOL, toolHandlers.handleAddQRCode, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.UUID_TOOL, toolHandlers.handleAddUUID, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.SELECT_TOOL, () => setSelectedTool(TOOL_TYPES.SELECT), { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.ESCAPE, () => {
    selectObject(null);
    setSelectedTool(TOOL_TYPES.SELECT);
  }, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.DELETE, () => {
    if (state.selectedObjectId) {
      deleteObject(state.selectedObjectId);
    }
  }, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.RESET_VIEW, zoomControls.handleResetView, { preventDefault: true });
  useHotkeys(KEYBOARD_SHORTCUTS.SAVE, (e) => {
    e.preventDefault();
    labelActions.handleSave();
  }, { preventDefault: true });

  return (
    <div className="label-editor-container min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Minimal background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Very subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.04)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.08)_1px,transparent_0)] bg-[size:40px_40px]" />
        
        {/* Single subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 dark:from-blue-900/5 dark:via-transparent dark:to-purple-900/5" />
      </div>
      
      {/* Main Toolbar */}
      <MainToolbar
        onBack={labelActions.handleBack}
        onSave={labelActions.handleSave}
        onPreview={labelActions.handlePreview}
        onShare={labelActions.handleShare}
        zoom={state.zoom}
        onZoomIn={zoomControls.handleZoomIn}
        onZoomOut={zoomControls.handleZoomOut}
        onResetZoom={zoomControls.handleResetView}
        onToggleProperties={() => togglePanel('properties')}
        onToggleGallery={() => togglePanel('gallery')}
        isSaving={labelActions.isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isConnected={isConnected}
        currentLabel={currentLabel ? { name: currentLabel.name, id: currentLabel.id } : null}
        autoSave={autoSave}
        onToggleAutoSave={() => setAutoSave(!autoSave)}
      />

      {/* Main Canvas Area */}
      <div className="pt-16 pb-24 h-screen">
        <div className="relative w-full h-full">
          <CanvasEditor
            dimensions={state.dimensions}
            zoom={state.zoom}
            panX={state.panX}
            panY={state.panY}
            objects={state.objects}
            selectedObjectId={state.selectedObjectId}
            preferences={state.preferences}
            onObjectUpdate={updateObject}
            onObjectSelect={selectObject}
            onCanvasReady={setCanvasRef}
            onWheelZoom={zoomControls.handleWheelZoom}
          />
        </div>
      </div>

      {/* Quick Toolbar - Always visible */}
      <ToolboxPanel
        onAddText={toolHandlers.handleAddText}
        onAddRectangle={toolHandlers.handleAddRectangle}
        onAddCircle={toolHandlers.handleAddCircle}
        onAddQRCode={toolHandlers.handleAddQRCode}
        onAddUUID={toolHandlers.handleAddUUID}
        onToggleAssets={onToggleAssets}
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        isVisible={true}
        onClose={() => {}} // Toolbar is always visible, so no close action
      />

      {/* Floating Panels */}
      <PropertiesPanel
        dimensions={state.dimensions}
        onDimensionsChange={updateDimensions}
        selectedObject={selectedObject}
        onObjectUpdate={updateObject}
        preferences={state.preferences}
        onPreferencesUpdate={updatePreferences}
        onRegenerateUUID={regenerateUUID}
        autoSave={autoSave}
        onAutoSaveToggle={() => setAutoSave(!autoSave)}
        isVisible={panelVisibility.properties}
        onClose={() => togglePanel('properties')}
      />

      <GalleryPanel
        currentLabel={currentLabel}
        labels={labelManager.labels}
        onLabelSelect={labelActions.handleLabelSelect}
        onCreateLabel={labelActions.handleCreateLabel}
        isVisible={panelVisibility.gallery}
        onClose={() => togglePanel('gallery')}
      />

      <UserAssetsPanel
        onAssetSelect={onAssetSelect}
        isVisible={panelVisibility.assets}
        onClose={() => togglePanel('assets')}
      />
    </div>
  );
}; 