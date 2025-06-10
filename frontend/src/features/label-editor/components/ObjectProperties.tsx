'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChevronUpIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-xs text-gray-400 mb-4">
        Object Type: <span className="text-white font-medium">{selectedObject.type}</span>
      </div>

      <div className="space-y-4">
        {/* Position */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-300">Position</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">X (mm)</label>
              <input
                type="number"
                value={localValues.x}
                onChange={(e) => updateValue('x', e.target.value)}
                step="0.1"
                className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                         text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 input-dark"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Y (mm)</label>
              <input
                type="number"
                value={localValues.y}
                onChange={(e) => updateValue('y', e.target.value)}
                step="0.1"
                className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                         text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Size (for shapes) */}
        {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle' || selectedObject.type === 'line') && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-300">Size</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={localValues.width}
                  onChange={(e) => updateValue('width', e.target.value)}
                  step="0.1"
                  min="0.1"
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                           text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 transition-colors"
                />
              </div>
              {selectedObject.type === 'rectangle' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={localValues.height}
                    onChange={(e) => updateValue('height', e.target.value)}
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                             text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text properties */}
        {selectedObject.type === 'text' && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-300">Text</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Content</label>
              <input
                type="text"
                value={localValues.text}
                onChange={(e) => updateValue('text', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                         text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                <input
                  type="number"
                  value={localValues.fontSize}
                  onChange={(e) => updateValue('fontSize', e.target.value)}
                  min="1"
                  max="200"
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                           text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Font</label>
                <select
                  value={localValues.fontFamily}
                  onChange={(e) => updateValue('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                           text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 transition-colors"
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
            </div>
          </div>
        )}

        {/* Colors */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-300">Colors</h4>
          <div className="grid grid-cols-2 gap-3">
            {selectedObject.type === 'text' ? (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={localValues.fill}
                  onChange={(e) => updateValue('fill', e.target.value)}
                  className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md cursor-pointer"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill</label>
                  <input
                    type="color"
                    value={localValues.fill}
                    onChange={(e) => updateValue('fill', e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stroke</label>
                  <input
                    type="color"
                    value={localValues.stroke}
                    onChange={(e) => updateValue('stroke', e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stroke width for shapes */}
        {selectedObject.type !== 'text' && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-300">Stroke</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={localValues.strokeWidth}
                onChange={(e) => updateValue('strokeWidth', e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                         text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Layer controls */}
        {(onBringToFront || onSendToBack || onMoveUp || onMoveDown) && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-300">Layers</h4>
            <div className="grid grid-cols-2 gap-2">
              {onBringToFront && (
                <motion.button
                  onClick={() => onBringToFront(selectedObject.id)}
                  className="px-3 py-2 text-xs btn-secondary text-white rounded-md 
                           flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowUpIcon className="w-3 h-3" />
                  Front
                </motion.button>
              )}
              {onSendToBack && (
                <motion.button
                  onClick={() => onSendToBack(selectedObject.id)}
                  className="px-3 py-2 text-xs btn-secondary text-white rounded-md 
                           flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowDownIcon className="w-3 h-3" />
                  Back
                </motion.button>
              )}
              {onMoveUp && (
                <motion.button
                  onClick={() => onMoveUp(selectedObject.id)}
                  className="px-3 py-2 text-xs btn-secondary text-white rounded-md 
                           flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronUpIcon className="w-3 h-3" />
                  Up
                </motion.button>
              )}
              {onMoveDown && (
                <motion.button
                  onClick={() => onMoveDown(selectedObject.id)}
                  className="px-3 py-2 text-xs btn-secondary text-white rounded-md 
                           flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronDownIcon className="w-3 h-3" />
                  Down
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
