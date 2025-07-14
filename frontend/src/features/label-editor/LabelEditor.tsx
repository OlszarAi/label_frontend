'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { useEditorState } from './hooks/useEditorState';
import { useProjectLabels } from './hooks/useProjectLabels';
import { CanvasEditor } from './components/CanvasEditor';
import { ToolbarPanel } from './components/ToolbarPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LabelsPanel } from './components/LabelsPanel';
import { EditorStatusBar } from './components/EditorStatusBar';
import { EditorHeader } from './components/EditorHeader';
import { generateUUID } from './utils/uuid';
import { snapCoordinatesToGrid } from './utils/grid';
import './styles/editor.css';

interface LabelEditorProps {
  labelId?: string;
  projectId?: string | null;
}

export const LabelEditor = ({ labelId, projectId }: LabelEditorProps) => {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState('select');
  const [showLabelsPanel, setShowLabelsPanel] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const {
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
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    saveLabel,
    setCanvasRef,
  } = useEditorState(labelId, projectId);

  const { labels, createLabelAndNavigate } = useProjectLabels(currentLabel?.projectId);

  // Connection monitoring
  const [isConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedObject = state.selectedObjectId 
    ? state.objects.find(obj => obj.id === state.selectedObjectId) || null
    : null;

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

  // Layer management handlers
  const handleBringToFront = useCallback(() => {
    if (state.selectedObjectId) {
      bringToFront(state.selectedObjectId);
    }
  }, [state.selectedObjectId, bringToFront]);

  const handleSendToBack = useCallback(() => {
    if (state.selectedObjectId) {
      sendToBack(state.selectedObjectId);
    }
  }, [state.selectedObjectId, sendToBack]);

  const handleMoveUp = useCallback(() => {
    if (state.selectedObjectId) {
      moveUp(state.selectedObjectId);
    }
  }, [state.selectedObjectId, moveUp]);

  const handleMoveDown = useCallback(() => {
    if (state.selectedObjectId) {
      moveDown(state.selectedObjectId);
    }
  }, [state.selectedObjectId, moveDown]);
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && !autoSave) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  }, [router, hasUnsavedChanges, autoSave]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveLabel();
      setHasUnsavedChanges(false);
      toast.success('Label saved successfully');
    } catch {
      toast.error('Failed to save label');
    } finally {
      setIsSaving(false);
    }
  }, [saveLabel]);

  const handlePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
    toast.info(isPreviewMode ? 'Edit mode enabled' : 'Preview mode enabled');
  }, [isPreviewMode]);

  const handleShare = useCallback(() => {
    toast.info('Share functionality coming soon');
  }, []);

  const handleSettings = useCallback(() => {
    setShowLabelsPanel(!showLabelsPanel);
    toast.info(showLabelsPanel ? 'Labels panel hidden' : 'Labels panel shown');
  }, [showLabelsPanel]);

  const handleResetView = useCallback(() => {
    updateZoom(1);
    updatePan(0, 0);
    toast.info('View reset to 100%');
  }, [updateZoom, updatePan]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(5, state.zoom + 0.1);
    updateZoom(newZoom);
  }, [updateZoom, state.zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.1, state.zoom - 0.1);
    updateZoom(newZoom);
  }, [updateZoom, state.zoom]);

  const handleLabelSelect = useCallback((selectedLabelId: string) => {
    if (hasUnsavedChanges && !autoSave) {
      if (confirm('You have unsaved changes. Continue anyway?')) {
        router.push(`/editor/${selectedLabelId}`);
      }
    } else {
      router.push(`/editor/${selectedLabelId}`);
    }
  }, [router, hasUnsavedChanges, autoSave]);

  const handleCreateLabel = useCallback(async () => {
    if (currentLabel?.projectId) {
      try {
        await createLabelAndNavigate();
        toast.success('New label created');
      } catch {
        toast.error('Failed to create label');
      }
    }
  }, [currentLabel?.projectId, createLabelAndNavigate]);

  // Monitor changes for unsaved state
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [state.objects, state.dimensions, currentLabel?.name, currentLabel?.description]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [autoSave, hasUnsavedChanges, handleSave]);

  // Keyboard shortcuts with react-hotkeys-hook
  useHotkeys('t', handleAddText, { preventDefault: true });
  useHotkeys('r', handleAddRectangle, { preventDefault: true });
  useHotkeys('c', handleAddCircle, { preventDefault: true });
  useHotkeys('q', handleAddQRCode, { preventDefault: true });
  useHotkeys('u', handleAddUUID, { preventDefault: true });
  useHotkeys('v', () => setSelectedTool('select'), { preventDefault: true });
  useHotkeys('escape', () => selectObject(null), { preventDefault: true });
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
    <div className="label-editor-container">
      {/* Animated background */}
      <div className="editor-background">
        <div className="editor-background-grid"></div>
        <div className="editor-background-glow"></div>
      </div>
      
      {/* Header */}
      <EditorHeader
        currentLabel={currentLabel}
        onBack={handleBack}
        onSave={handleSave}
        onPreview={handlePreview}
        onShare={handleShare}
        onSettings={handleSettings}
        isSaving={isSaving}
      />

      {/* Main Content Area */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px - 32px)' }}>
        <PanelGroup direction="horizontal">
          {/* Toolbar Panel */}
          <Panel defaultSize={20} minSize={18} maxSize={25}>
            <ToolbarPanel
              onAddText={handleAddText}
              onAddRectangle={handleAddRectangle}
              onAddCircle={handleAddCircle}
              onAddQRCode={handleAddQRCode}
              onAddUUID={handleAddUUID}
              selectedTool={selectedTool}
              onToolSelect={setSelectedTool}
            />
          </Panel>

          <PanelResizeHandle className="w-2 panel-resize-handle panel-separator" />

          {/* Center Panel - Canvas */}
          <Panel defaultSize={showLabelsPanel ? 45 : 60} minSize={35}>
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
          </Panel>

          <PanelResizeHandle className="w-2 panel-resize-handle panel-separator" />

          {/* Properties Panel */}
          <Panel defaultSize={20} minSize={18} maxSize={25}>
            <PropertiesPanel
              dimensions={state.dimensions}
              onDimensionsChange={updateDimensions}
              selectedObject={selectedObject}
              onObjectUpdate={updateObject}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              preferences={state.preferences}
              onPreferencesUpdate={updatePreferences}
            />
          </Panel>

          {/* Labels Panel - Collapsible */}
          {showLabelsPanel && (
            <>
              <PanelResizeHandle className="w-2 panel-resize-handle panel-separator" />
              <Panel defaultSize={15} minSize={12} maxSize={20}>
                <LabelsPanel
                  currentLabel={currentLabel}
                  labels={labels}
                  onLabelSelect={handleLabelSelect}
                  onCreateLabel={handleCreateLabel}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <EditorStatusBar
        isConnected={isConnected}
        lastSaved={lastSaved}
        autoSave={autoSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        zoom={state.zoom}
        objectCount={state.objects.length}
        canvasSize={state.dimensions}
        onToggleAutoSave={() => setAutoSave(!autoSave)}
        onSave={handleSave}
        onToggleGrid={() => 
          updatePreferences({
            ...state.preferences,
            grid: { ...state.preferences.grid, showGrid: !state.preferences.grid.showGrid }
          })
        }
        showGrid={state.preferences.grid.showGrid}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetView}
      />
    </div>
  );
};
