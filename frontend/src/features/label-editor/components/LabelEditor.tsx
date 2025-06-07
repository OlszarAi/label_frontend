'use client';

import React from 'react';
import { useLabelEditor } from '../hooks/useLabelEditor';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { ZoomControls } from './ZoomControls';
import { DEFAULT_EDITOR_CONFIG } from '../constants/editor.constants';

export const LabelEditor: React.FC = () => {
  const {
    editorState,
    initializeCanvas,
    setZoom,
    selectTool,
    addText,
    addRectangle,
    addCircle,
    deleteSelected,
    clearCanvas,
  } = useLabelEditor();

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Label Editor</h1>
        <p className="text-sm text-gray-600 mt-1">
          Edytor etykiet z obsługą zoom i podstawowych narzędzi
        </p>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <EditorCanvas
          onCanvasReady={initializeCanvas}
          zoom={editorState.zoom}
          width={DEFAULT_EDITOR_CONFIG.canvasSize.width}
          height={DEFAULT_EDITOR_CONFIG.canvasSize.height}
        />

        {/* Zoom Controls */}
        <ZoomControls
          zoom={editorState.zoom}
          onZoomChange={setZoom}
        />

        {/* Toolbar */}
        <EditorToolbar
          selectedTool={editorState.selectedTool}
          onToolSelect={selectTool}
          onAddText={addText}
          onAddRectangle={addRectangle}
          onAddCircle={addCircle}
          onDelete={deleteSelected}
          onClear={clearCanvas}
          hasActiveObject={!!editorState.activeObject}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(editorState.zoom * 100)}%</span>
          <span>Narzędzie: {editorState.selectedTool}</span>
          {editorState.activeObject && (
            <span>Zaznaczono: {editorState.activeObject.type}</span>
          )}
        </div>
        <div>
          Gotowy do edycji
        </div>
      </div>
    </div>
  );
};
