'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { useEditorState } from './hooks/useEditorState';
import { useProjectLabels } from './hooks/useProjectLabels';
import { CanvasEditor } from './components/CanvasEditor';
import { MainToolbar } from './components/toolbar/MainToolbar';
import { ToolboxPanel } from './components/panels/ToolboxPanel';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { GalleryPanel } from './components/panels/GalleryPanel';
import { generateUUID } from './utils/uuid';
import { snapCoordinatesToGrid } from './utils/grid';
import './styles/editor.css';

interface LabelEditorNewProps {
  labelId?: string;
  projectId?: string | null;
}

export const LabelEditorNew = ({ labelId, projectId }: LabelEditorNewProps) => {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState('select');
  const [effectiveProjectId, setEffectiveProjectId] = useState<string | null>(projectId || null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Panel visibility states
  const [panelVisibility, setPanelVisibility] = useState({
    properties: true,
    gallery: true,
  });

  const {
    labels,
    createLabelAndNavigate,
    refreshLabelThumbnail,
  } = useProjectLabels(effectiveProjectId);

  const {
    state,
    currentLabel,
    autoSave,
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
    switchToLabel, // Use the new safe switching function
  } = useEditorState(labelId, effectiveProjectId);

  // Enhanced save function that updates thumbnail in gallery
  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple concurrent saves
    
    setIsSaving(true);
    try {
      const result = await saveLabel();
      if (result && currentLabel) {
        // Refresh the thumbnail in the gallery after saving
        await refreshLabelThumbnail(currentLabel.id);
        toast.success('Label saved successfully');
      } else {
        toast.error('Failed to save label');
      }
      return result;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save label');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [saveLabel, currentLabel, refreshLabelThumbnail, isSaving]);

  // Connection monitoring
  const [isConnected] = useState(true);

  // Update effectiveProjectId when currentLabel becomes available
  useEffect(() => {
    if (currentLabel?.projectId && !effectiveProjectId) {
      setEffectiveProjectId(currentLabel.projectId);
    }
  }, [currentLabel?.projectId, effectiveProjectId]);

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

  // Tool handlers with grid snapping
  const handleAddText = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      10, 10, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'text',
      x: coords.x,
      y: coords.y,
      text: 'New Text',
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#000000',
    });
    setSelectedTool('select');
    toast.success('Text element added');
  }, [addObject, state.preferences.grid]);

  const handleAddRectangle = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      10, 10, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'rectangle',
      x: coords.x,
      y: coords.y,
      width: 20,
      height: 10,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
    });
    setSelectedTool('select');
    toast.success('Rectangle added');
  }, [addObject, state.preferences.grid]);

  const handleAddCircle = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      10, 10, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'circle',
      x: coords.x,
      y: coords.y,
      width: 20,
      height: 20,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
    });
    setSelectedTool('select');
    toast.success('Circle added');
  }, [addObject, state.preferences.grid]);

  const handleAddQRCode = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      10, 10, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    const newUUID = generateUUID(state.preferences.uuid.uuidLength);
    addObject({
      type: 'qrcode',
      x: coords.x,
      y: coords.y,
      width: 20,
      height: 20,
      qrErrorCorrectionLevel: 'M',
      fill: '#000000',
      stroke: '#ffffff',
      sharedUUID: newUUID,
    });
    setSelectedTool('select');
    toast.success('QR Code added');
  }, [addObject, state.preferences.uuid.uuidLength, state.preferences.grid]);

  const handleAddUUID = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      10, 10, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    const newUUID = generateUUID(state.preferences.uuid.uuidLength);
    addObject({
      type: 'uuid',
      x: coords.x,
      y: coords.y,
      text: newUUID,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#000000',
      sharedUUID: newUUID,
    });
    setSelectedTool('select');
    toast.success('UUID added');
  }, [addObject, state.preferences.uuid.uuidLength, state.preferences.grid]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && !autoSave) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  }, [router, hasUnsavedChanges, autoSave]);

  const handlePreview = useCallback(() => {
    toast.info('Preview functionality coming soon');
  }, []);

  const handleShare = useCallback(() => {
    toast.info('Share functionality coming soon');
  }, []);

  const handleResetView = useCallback(() => {
    updateZoom(1);
    toast.info('View reset to 100%');
  }, [updateZoom]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(5, state.zoom + 0.1);
    updateZoom(newZoom);
  }, [updateZoom, state.zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.1, state.zoom - 0.1);
    updateZoom(newZoom);
  }, [updateZoom, state.zoom]);

  // Updated label selection using the safe switching function
  const handleLabelSelect = useCallback(async (selectedLabelId: string) => {
    if (hasUnsavedChanges && !autoSave) {
      if (!confirm('You have unsaved changes. Continue anyway?')) {
        return;
      }
    }

    try {
      // Use the safe switching function from useEditorState
      await switchToLabel(selectedLabelId);
      toast.success('Label switched successfully');
    } catch (error) {
      console.error('Error switching label:', error);
      toast.error('Failed to switch label');
    }
  }, [hasUnsavedChanges, autoSave, switchToLabel]);

  const handleCreateLabel = useCallback(async () => {
    if (currentLabel?.projectId) {
      try {
        const newLabel = await createLabelAndNavigate();
        if (newLabel) {
          // The createLabelAndNavigate function handles navigation
          toast.success('New label created');
        }
      } catch (error) {
        console.error('Failed to create label:', error);
        toast.error('Failed to create label');
      }
    }
  }, [currentLabel?.projectId, createLabelAndNavigate]);

  // Keyboard shortcuts with react-hotkeys-hook
  useHotkeys('t', handleAddText, { preventDefault: true });
  useHotkeys('r', handleAddRectangle, { preventDefault: true });
  useHotkeys('c', handleAddCircle, { preventDefault: true });
  useHotkeys('q', handleAddQRCode, { preventDefault: true });
  useHotkeys('u', handleAddUUID, { preventDefault: true });
  useHotkeys('v', () => setSelectedTool('select'), { preventDefault: true });
  useHotkeys('escape', () => {
    selectObject(null);
    setSelectedTool('select');
  }, { preventDefault: true });
  useHotkeys('delete,backspace', () => {
    if (state.selectedObjectId) {
      deleteObject(state.selectedObjectId);
    }
  }, { preventDefault: true });
  useHotkeys('ctrl+0,cmd+0', handleResetView, { preventDefault: true });
  useHotkeys('ctrl+s,cmd+s', (e) => {
    e.preventDefault();
    handleSave();
  }, { preventDefault: true });

  return (
    <div className="label-editor-container min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>
      
      {/* Main Toolbar */}
      <MainToolbar
        onBack={handleBack}
        onSave={handleSave}
        onPreview={handlePreview}
        onShare={handleShare}
        zoom={state.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetView}
        onToggleProperties={() => togglePanel('properties')}
        onToggleGallery={() => togglePanel('gallery')}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isConnected={isConnected}
        currentLabel={currentLabel ? { name: currentLabel.name, id: currentLabel.id } : null}
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
          />
        </div>
      </div>

      {/* Quick Toolbar - Always visible */}
      <ToolboxPanel
        onAddText={handleAddText}
        onAddRectangle={handleAddRectangle}
        onAddCircle={handleAddCircle}
        onAddQRCode={handleAddQRCode}
        onAddUUID={handleAddUUID}
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
        isVisible={panelVisibility.properties}
        onClose={() => togglePanel('properties')}
      />

      <GalleryPanel
        currentLabel={currentLabel}
        labels={labels}
        onLabelSelect={handleLabelSelect}
        onCreateLabel={handleCreateLabel}
        isVisible={panelVisibility.gallery}
        onClose={() => togglePanel('gallery')}
      />
    </div>
  );
}; 