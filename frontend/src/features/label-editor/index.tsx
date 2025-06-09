'use client';

import React from 'react';
import { useEditorState } from './hooks/useEditorState';
import { CanvasEditor } from './components/CanvasEditor';
import { DimensionControls } from './components/DimensionControls';
import { ZoomControls } from './components/ZoomControls';
import { Toolbar } from './components/Toolbar';

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

  const handleResetView = () => {
    updateZoom(1);
    updatePan(0, 0);
  };

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
          selectedObject={selectedObject}
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
        />

        {/* Object Properties */}
        {selectedObject && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Właściwości</h3>
            <div className="space-y-2 text-sm">
              <div>Typ: {selectedObject.type}</div>
              <div>X: {selectedObject.x.toFixed(1)}mm</div>
              <div>Y: {selectedObject.y.toFixed(1)}mm</div>
              {selectedObject.width && (
                <div>Szerokość: {selectedObject.width.toFixed(1)}mm</div>
              )}
              {selectedObject.height && (
                <div>Wysokość: {selectedObject.height.toFixed(1)}mm</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
