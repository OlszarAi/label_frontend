'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { CanvasEditor } from './components/CanvasEditor';
import { DimensionControls } from './components/DimensionControls';
import { ZoomControls } from './components/ZoomControls';
import { Toolbar } from './components/Toolbar';
import { ObjectProperties } from './components/ObjectProperties';
import { HelpPanel } from './components/HelpPanel';
import { copyObject, pasteObject, hasClipboard } from './utils/clipboard';
import './styles/editor.css';

export const LabelEditor = () => {
  const [clipboardState, setClipboardState] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

  const handleAddText = () => {
    addObject({
      type: 'text',
      x: 10,
      y: 10,
      text: 'Nowy tekst',
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#000000',
    });
  };

  const handleAddRectangle = () => {
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
  };

  const handleAddCircle = () => {
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
  };

  const handleAddLine = () => {
    addObject({
      type: 'line',
      x: 10,
      y: 10,
      width: 20,
      height: 0,
      stroke: '#000000',
      strokeWidth: 1,
    });
  };

  const handleDeleteSelected = () => {
    if (state.selectedObjectId) {
      deleteObject(state.selectedObjectId);
    }
  };

  const handleCopySelected = useCallback(() => {
    if (state.selectedObjectId) {
      const selectedObject = state.objects.find(obj => obj.id === state.selectedObjectId);
      if (selectedObject) {
        copyObject(selectedObject);
        setClipboardState(true);
      }
    }
  }, [state.selectedObjectId, state.objects]);

  const handlePaste = useCallback(() => {
    if (hasClipboard()) {
      const pastedObject = pasteObject();
      if (pastedObject) {
        const newId = addObject(pastedObject);
        selectObject(newId);
      }
    }
  }, [addObject, selectObject]);

  const handleResetView = () => {
    updateZoom(1);
    updatePan(0, 0);
  };

  const handleShowHelp = () => {
    setShowHelp(true);
  };

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
      } else if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            handleCopySelected();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'd':
            e.preventDefault();
            if (state.selectedObjectId) {
              handleCopySelected();
              handlePaste();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedObjectId, state.objects, deleteObject, handleCopySelected, handlePaste]);

  const selectedObject = state.objects.find(obj => obj.id === state.selectedObjectId) || null;

  return (
    <div className="h-screen flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 p-4 space-y-4 overflow-y-auto">
        <Toolbar
          onAddText={handleAddText}
          onAddRectangle={handleAddRectangle}
          onAddCircle={handleAddCircle}
          onAddLine={handleAddLine}
          onDeleteSelected={handleDeleteSelected}
          onCopySelected={handleCopySelected}
          onPaste={handlePaste}
          selectedObject={selectedObject}
          hasClipboard={clipboardState}
        />
      </div>

      {/* Main Canvas Area */}
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

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-50 p-4 space-y-4 overflow-y-auto">
        <DimensionControls
          dimensions={state.dimensions}
          onDimensionsChange={updateDimensions}
        />
        
        <ZoomControls
          zoom={state.zoom}
          onZoomChange={updateZoom}
          onResetView={handleResetView}
          onShowHelp={handleShowHelp}
        />

        {/* Object Properties */}
        {selectedObject && (
          <ObjectProperties
            selectedObject={selectedObject}
            onObjectUpdate={updateObject}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
          />
        )}
      </div>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};
