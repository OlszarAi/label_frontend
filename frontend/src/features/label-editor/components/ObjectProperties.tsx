'use client';

import React, { useState } from 'react';
import { CanvasObject } from '../types/editor.types';

interface ObjectPropertiesProps {
  selectedObject: CanvasObject;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

export const ObjectProperties = ({ 
  selectedObject, 
  onObjectUpdate, 
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown 
}: ObjectPropertiesProps) => {
  const [localValues, setLocalValues] = useState({
    x: selectedObject.x.toString(),
    y: selectedObject.y.toString(),
    width: selectedObject.width?.toString() || '',
    height: selectedObject.height?.toString() || '',
    text: selectedObject.text || '',
    fontSize: selectedObject.fontSize?.toString() || '12',
    fontFamily: selectedObject.fontFamily || 'Arial',
    fill: selectedObject.fill || '#000000',
    stroke: selectedObject.stroke || '#000000',
    strokeWidth: selectedObject.strokeWidth?.toString() || '1',
  });

  const updateValue = (key: keyof typeof localValues, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
    
    // Convert to appropriate type and update object
    const updates: Partial<CanvasObject> = {};
    
    switch (key) {
      case 'x':
      case 'y':
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          updates[key] = numValue;
        }
        break;
      case 'width':
      case 'height':
        const sizeValue = parseFloat(value);
        if (!isNaN(sizeValue) && sizeValue > 0) {
          updates[key] = sizeValue;
        }
        break;
      case 'fontSize':
        const fontValue = parseFloat(value);
        if (!isNaN(fontValue) && fontValue > 0) {
          updates.fontSize = fontValue;
        }
        break;
      case 'strokeWidth':
        const strokeValue = parseFloat(value);
        if (!isNaN(strokeValue) && strokeValue >= 0) {
          updates.strokeWidth = strokeValue;
        }
        break;
      case 'text':
      case 'fill':
      case 'stroke':
      case 'fontFamily':
        updates[key] = value;
        break;
    }
    
    if (Object.keys(updates).length > 0) {
      onObjectUpdate(selectedObject.id, updates);
    }
  };

  // Update local values when selectedObject changes
  React.useEffect(() => {
    setLocalValues({
      x: selectedObject.x.toString(),
      y: selectedObject.y.toString(),
      width: selectedObject.width?.toString() || '',
      height: selectedObject.height?.toString() || '',
      text: selectedObject.text || '',
      fontSize: selectedObject.fontSize?.toString() || '12',
      fontFamily: selectedObject.fontFamily || 'Arial',
      fill: selectedObject.fill || '#000000',
      stroke: selectedObject.stroke || '#000000',
      strokeWidth: selectedObject.strokeWidth?.toString() || '1',
    });
  }, [selectedObject]);

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Właściwości</h3>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Typ: {selectedObject.type}</span>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X (mm)</label>
            <input
              type="number"
              value={localValues.x}
              onChange={(e) => updateValue('x', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y (mm)</label>
            <input
              type="number"
              value={localValues.y}
              onChange={(e) => updateValue('y', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Size (for shapes) */}
        {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle' || selectedObject.type === 'line') && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Szerokość (mm)</label>
              <input
                type="number"
                value={localValues.width}
                onChange={(e) => updateValue('width', e.target.value)}
                step="0.1"
                min="0.1"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {selectedObject.type === 'rectangle' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wysokość (mm)</label>
                <input
                  type="number"
                  value={localValues.height}
                  onChange={(e) => updateValue('height', e.target.value)}
                  step="0.1"
                  min="0.1"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Text properties */}
        {selectedObject.type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tekst</label>
              <input
                type="text"
                value={localValues.text}
                onChange={(e) => updateValue('text', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rozmiar czcionki</label>
              <input
                type="number"
                value={localValues.fontSize}
                onChange={(e) => updateValue('fontSize', e.target.value)}
                min="1"
                max="200"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Czcionka</label>
              <select
                value={localValues.fontFamily}
                onChange={(e) => updateValue('fontFamily', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Arial Black">Arial Black</option>
              </select>
            </div>
          </>
        )}

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          {selectedObject.type === 'text' ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kolor tekstu</label>
              <input
                type="color"
                value={localValues.fill}
                onChange={(e) => updateValue('fill', e.target.value)}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wypełnienie</label>
                <input
                  type="color"
                  value={localValues.fill}
                  onChange={(e) => updateValue('fill', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Obramowanie</label>
                <input
                  type="color"
                  value={localValues.stroke}
                  onChange={(e) => updateValue('stroke', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        {/* Stroke width for shapes */}
        {selectedObject.type !== 'text' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grubość obramowania</label>
            <input
              type="number"
              value={localValues.strokeWidth}
              onChange={(e) => updateValue('strokeWidth', e.target.value)}
              min="0"
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Layer controls */}
        {(onBringToFront || onSendToBack || onMoveUp || onMoveDown) && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Warstwy</label>
            <div className="grid grid-cols-2 gap-1">
              {onBringToFront && (
                <button
                  onClick={() => onBringToFront(selectedObject.id)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  Na wierzch
                </button>
              )}
              {onSendToBack && (
                <button
                  onClick={() => onSendToBack(selectedObject.id)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  Na spód
                </button>
              )}
              {onMoveUp && (
                <button
                  onClick={() => onMoveUp(selectedObject.id)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  W górę
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={() => onMoveDown(selectedObject.id)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  W dół
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
