'use client';

import React, { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon, Squares2X2Icon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { LabelDimensions, EditorPreferences } from '../types/editor.types';
import { formatMm } from '../utils/dimensions';

interface CanvasPropertiesProps {
  dimensions: LabelDimensions;
  onDimensionsChange: (dimensions: LabelDimensions) => void;
  preferences: EditorPreferences;
  onPreferencesUpdate: (preferences: EditorPreferences) => void;
}

export const CanvasProperties = ({ 
  dimensions, 
  onDimensionsChange, 
  preferences, 
  onPreferencesUpdate 
}: CanvasPropertiesProps) => {
  const [tempWidth, setTempWidth] = useState(dimensions.width.toString());
  const [tempHeight, setTempHeight] = useState(dimensions.height.toString());
  const [showGridOptions, setShowGridOptions] = useState(false);
  const [showRulerOptions, setShowRulerOptions] = useState(false);
  
  const [localGridValues, setLocalGridValues] = useState({
    gridSize: preferences.grid.size.toString(),
    gridColor: preferences.grid.color,
    gridOpacity: preferences.grid.opacity.toString(),
  });

  const [localRulerValues, setLocalRulerValues] = useState({
    rulerColor: preferences.ruler?.color || '#ffffff',
    rulerBackgroundColor: preferences.ruler?.backgroundColor || 'rgba(0, 0, 0, 0.9)',
    rulerOpacity: preferences.ruler?.opacity?.toString() || '0.9',
    rulerSize: preferences.ruler?.size?.toString() || '24',
  });

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempWidth(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      onDimensionsChange({ ...dimensions, width: numValue });
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempHeight(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      onDimensionsChange({ ...dimensions, height: numValue });
    }
  };

  const updateGridValue = (key: keyof typeof localGridValues, value: string) => {
    setLocalGridValues(prev => ({ ...prev, [key]: value }));
    
    const newPreferences = { ...preferences };
    
    switch (key) {
      case 'gridSize':
        const size = parseFloat(value);
        if (!isNaN(size) && size > 0) {
          newPreferences.grid.size = Math.max(0.5, Math.min(50, size));
        }
        break;
      case 'gridColor':
        newPreferences.grid.color = value;
        break;
      case 'gridOpacity':
        const opacity = parseFloat(value);
        if (!isNaN(opacity)) {
          newPreferences.grid.opacity = Math.max(0, Math.min(1, opacity));
        }
        break;
    }
    
    onPreferencesUpdate(newPreferences);
  };

  const updateGridBooleanValue = (key: 'showGrid' | 'snapToGrid', value: boolean) => {
    const newPreferences = { ...preferences };
    
    switch (key) {
      case 'showGrid':
        newPreferences.grid.showGrid = value;
        break;
      case 'snapToGrid':
        newPreferences.grid.snapToGrid = value;
        break;
    }
    
    onPreferencesUpdate(newPreferences);
  };

  const updateRulerValue = (key: keyof typeof localRulerValues, value: string) => {
    setLocalRulerValues(prev => ({ ...prev, [key]: value }));
    
    const newPreferences = { ...preferences };
    
    if (!newPreferences.ruler) {
      newPreferences.ruler = {
        showRulers: false,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        opacity: 0.9,
        size: 24,
      };
    }
    
    switch (key) {
      case 'rulerColor':
        newPreferences.ruler.color = value;
        break;
      case 'rulerBackgroundColor':
        newPreferences.ruler.backgroundColor = value;
        break;
      case 'rulerOpacity':
        const opacity = parseFloat(value);
        if (!isNaN(opacity)) {
          newPreferences.ruler.opacity = Math.max(0, Math.min(1, opacity));
        }
        break;
      case 'rulerSize':
        const size = parseFloat(value);
        if (!isNaN(size) && size > 0) {
          newPreferences.ruler.size = Math.max(16, Math.min(64, size));
        }
        break;
    }
    
    onPreferencesUpdate(newPreferences);
  };

  const updateRulerBooleanValue = (key: 'showRulers', value: boolean) => {
    const newPreferences = { ...preferences };
    if (!newPreferences.ruler) {
      newPreferences.ruler = {
        showRulers: false,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        opacity: 0.9,
        size: 24,
      };
    }
    newPreferences.ruler.showRulers = value;
    onPreferencesUpdate(newPreferences);
  };

  // Update temp values when dimensions change externally
  React.useEffect(() => {
    setTempWidth(dimensions.width.toString());
    setTempHeight(dimensions.height.toString());
  }, [dimensions.width, dimensions.height]);

  // Update local grid values when preferences change externally
  React.useEffect(() => {
    setLocalGridValues({
      gridSize: preferences.grid.size.toString(),
      gridColor: preferences.grid.color,
      gridOpacity: preferences.grid.opacity.toString(),
    });
  }, [preferences.grid]);

  // Update local ruler values when preferences change externally
  React.useEffect(() => {
    setLocalRulerValues({
      rulerColor: preferences.ruler?.color || '#ffffff',
      rulerBackgroundColor: preferences.ruler?.backgroundColor || 'rgba(0, 0, 0, 0.9)',
      rulerOpacity: preferences.ruler?.opacity?.toString() || '0.9',
      rulerSize: preferences.ruler?.size?.toString() || '24',
    });
  }, [preferences.ruler]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Dimension Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Width
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={tempWidth}
              onChange={handleWidthChange}
              min="1"
              max="1000"
              step="0.1"
              className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                       text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500 input-dark"
            />
            <span className="text-xs text-gray-400">mm</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Height
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={tempHeight}
              onChange={handleHeightChange}
              min="1"
              max="1000"
              step="0.1"
              className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                       text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500 input-dark"
            />
            <span className="text-xs text-gray-400">mm</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="text-white">{formatMm(dimensions.width)} × {formatMm(dimensions.height)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ratio:</span>
              <span className="text-white">{(dimensions.width / dimensions.height).toFixed(2)}:1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Options */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={() => setShowGridOptions(!showGridOptions)}
          className="w-full flex items-center justify-between text-xs text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Squares2X2Icon className="w-4 h-4" />
            <span className="font-medium">Grid Options</span>
          </div>
          {showGridOptions ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {showGridOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-4">
                {/* Grid Enable/Disable */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    Show Grid
                  </label>
                  <button
                    type="button"
                    onClick={() => updateGridBooleanValue('showGrid', !preferences.grid.showGrid)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                      preferences.grid.showGrid ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.grid.showGrid ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Snap to Grid */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    Snap to Grid
                  </label>
                  <button
                    type="button"
                    onClick={() => updateGridBooleanValue('snapToGrid', !preferences.grid.snapToGrid)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                      preferences.grid.snapToGrid ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.grid.snapToGrid ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Grid Size */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Grid Size
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={localGridValues.gridSize}
                      onChange={(e) => updateGridValue('gridSize', e.target.value)}
                      min="0.5"
                      max="50"
                      step="0.5"
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                               text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 input-dark"
                    />
                    <span className="text-xs text-gray-400">mm</span>
                  </div>
                </div>

                {/* Grid Color */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Grid Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localGridValues.gridColor}
                      onChange={(e) => updateGridValue('gridColor', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600 bg-gray-800"
                    />
                    <input
                      type="text"
                      value={localGridValues.gridColor}
                      onChange={(e) => updateGridValue('gridColor', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                               text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 input-dark"
                    />
                  </div>
                </div>

                {/* Grid Opacity */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Grid Opacity
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      value={localGridValues.gridOpacity}
                      onChange={(e) => updateGridValue('gridOpacity', e.target.value)}
                      min="0"
                      max="1"
                      step="0.1"
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8">
                      {Math.round(parseFloat(localGridValues.gridOpacity) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ruler Options */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={() => setShowRulerOptions(!showRulerOptions)}
          className="w-full flex items-center justify-between text-xs text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="w-4 h-4" />
            <span className="font-medium">Ruler Options</span>
          </div>
          {showRulerOptions ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {showRulerOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-4">
                {/* Ruler Enable/Disable */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    Show Rulers
                  </label>
                  <button
                    type="button"
                    onClick={() => updateRulerBooleanValue('showRulers', !preferences.ruler?.showRulers)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                      preferences.ruler?.showRulers ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.ruler?.showRulers ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Ruler Size */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Ruler Size
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={localRulerValues.rulerSize}
                      onChange={(e) => updateRulerValue('rulerSize', e.target.value)}
                      min="16"
                      max="64"
                      step="2"
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                               text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 input-dark"
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                {/* Ruler Text Color */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localRulerValues.rulerColor}
                      onChange={(e) => updateRulerValue('rulerColor', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600 bg-gray-800"
                    />
                    <input
                      type="text"
                      value={localRulerValues.rulerColor}
                      onChange={(e) => updateRulerValue('rulerColor', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                               text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 input-dark"
                    />
                  </div>
                </div>

                {/* Ruler Background Color */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localRulerValues.rulerBackgroundColor}
                      onChange={(e) => updateRulerValue('rulerBackgroundColor', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600 bg-gray-800"
                    />
                    <input
                      type="text"
                      value={localRulerValues.rulerBackgroundColor}
                      onChange={(e) => updateRulerValue('rulerBackgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                               text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 input-dark"
                    />
                  </div>
                </div>

                {/* Ruler Opacity */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Ruler Opacity
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      value={localRulerValues.rulerOpacity}
                      onChange={(e) => updateRulerValue('rulerOpacity', e.target.value)}
                      min="0"
                      max="1"
                      step="0.1"
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8">
                      {Math.round(parseFloat(localRulerValues.rulerOpacity) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
