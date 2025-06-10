'use client';

import React, { useCallback, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useEditorState } from './hooks/useEditorState';
import { CanvasEditor } from './components/CanvasEditor';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { TopPanel } from './components/TopPanel';
import { generateUUID } from './utils/uuid';
import { snapCoordinatesToGrid } from './utils/grid';
import './styles/editor.css';

export const LabelEditor = () => {
  const {
    state,
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
  } = useEditorState();

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
  }, [addObject, state.preferences.uuid.uuidLength, state.preferences.grid]);

  const handleResetView = useCallback(() => {
    updateZoom(1);
    updatePan(0, 0);
  }, [updateZoom, updatePan]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedObjectId) {
          deleteObject(state.selectedObjectId);
        }
      } else if (!e.ctrlKey && !e.metaKey) {
        // Quick object creation shortcuts
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault();
            handleAddText();
            break;
          case 'r':
            e.preventDefault();
            handleAddRectangle();
            break;
          case 'c':
            e.preventDefault();
            handleAddCircle();
            break;
          case 'q':
            e.preventDefault();
            handleAddQRCode();
            break;
          case 'u':
            e.preventDefault();
            handleAddUUID();
            break;
          case 'escape':
            e.preventDefault();
            selectObject(null);
            break;
        }
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd shortcuts
        switch (e.key.toLowerCase()) {
          case '0':
            e.preventDefault();
            handleResetView();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedObjectId, deleteObject, selectObject, handleAddText, handleAddRectangle, handleAddCircle, handleAddQRCode, handleAddUUID, handleResetView]);

  const selectedObject = state.objects.find(obj => obj.id === state.selectedObjectId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Panel */}
      <TopPanel
        zoom={state.zoom}
        onZoomChange={updateZoom}
        onResetView={handleResetView}
        dimensions={state.dimensions}
        objectCount={state.objects.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <PanelGroup direction="horizontal">
          {/* Left Panel */}
          <Panel defaultSize={15} minSize={10} maxSize={25}>
            <LeftPanel
              onAddText={handleAddText}
              onAddRectangle={handleAddRectangle}
              onAddCircle={handleAddCircle}
              onAddQRCode={handleAddQRCode}
              onAddUUID={handleAddUUID}
            />
          </Panel>

          <PanelResizeHandle className="w-2 panel-resize-handle panel-separator" />

          {/* Center Panel - Canvas */}
          <Panel defaultSize={70} minSize={50}>
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
            />
          </Panel>

          <PanelResizeHandle className="w-2 panel-resize-handle panel-separator" />

          {/* Right Panel */}
          <Panel defaultSize={15} minSize={10} maxSize={25}>
            <RightPanel
              dimensions={state.dimensions}
              onDimensionsChange={updateDimensions}
              selectedObject={selectedObject}
              onObjectUpdate={updateObject}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              preferences={state.preferences}
              onPreferencesUpdate={updatePreferences}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
