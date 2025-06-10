'use client';

import React, { useCallback, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useEditorState } from './hooks/useEditorState';
import { CanvasEditor } from './components/CanvasEditor';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { TopPanel } from './components/TopPanel';
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
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
  } = useEditorState();

  const handleAddText = useCallback(() => {
    addObject({
      type: 'text',
      x: 10,
      y: 10,
      text: 'New Text',
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#000000',
    });
  }, [addObject]);

  const handleAddRectangle = useCallback(() => {
    addObject({
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 20,
      height: 10,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
    });
  }, [addObject]);

  const handleAddCircle = useCallback(() => {
    addObject({
      type: 'circle',
      x: 10,
      y: 10,
      width: 20,
      height: 20,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
    });
  }, [addObject]);

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
  }, [state.selectedObjectId, deleteObject, selectObject, handleAddText, handleAddRectangle, handleAddCircle, handleResetView]);

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
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
