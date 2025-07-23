'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Collapsible from '@radix-ui/react-collapsible';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  Squares2X2Icon,
  SwatchIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { FloatingPanel } from '../common/FloatingPanel';
import { LabelDimensions, CanvasObject, EditorPreferences } from '../../types/editor.types';
import { CanvasProperties } from '../CanvasProperties';

// Custom hook to manage input values during editing
const useEditableValue = (externalValue: number, onCommit: (value: number) => void) => {
  const [inputValue, setInputValue] = useState(Number(externalValue).toFixed(2));
  const [isEditing, setIsEditing] = useState(false);

  // Update input value when external value changes and we're not editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(Number(externalValue).toFixed(2));
    }
  }, [externalValue, isEditing]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(Number(externalValue).toFixed(2));
  }, [externalValue]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      onCommit(numValue);
    }
  }, [inputValue, onCommit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLInputElement).blur();
    }
  }, []);

  return {
    value: inputValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
  };
};

interface PropertiesPanelProps {
  dimensions: LabelDimensions;
  onDimensionsChange: (dimensions: LabelDimensions) => void;
  selectedObject?: CanvasObject | null;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  preferences: EditorPreferences;
  onPreferencesUpdate: (preferences: EditorPreferences) => void;
  onRegenerateUUID?: () => string;
  autoSave?: boolean;
  onAutoSaveToggle?: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export const PropertiesPanel = ({
  dimensions,
  onDimensionsChange,
  selectedObject,
  onObjectUpdate,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  preferences,
  onPreferencesUpdate,
  onRegenerateUUID,
  isVisible,
  onClose,
}: PropertiesPanelProps) => {
  const [openSections, setOpenSections] = useState({
    canvas: true,
    selection: true,
    settings: false,
  });

  // Input hooks for object editing
  const objectXInput = useEditableValue(selectedObject?.x || 0, (value) => 
    selectedObject && onObjectUpdate(selectedObject.id, { x: value })
  );
  const objectYInput = useEditableValue(selectedObject?.y || 0, (value) => 
    selectedObject && onObjectUpdate(selectedObject.id, { y: value })
  );
  const objectWidthInput = useEditableValue(selectedObject?.width || 0, (value) => 
    selectedObject && onObjectUpdate(selectedObject.id, { width: value })
  );
  const objectHeightInput = useEditableValue(selectedObject?.height || 0, (value) => 
    selectedObject && onObjectUpdate(selectedObject.id, { height: value })
  );
  const fontSizeInput = useEditableValue(selectedObject?.fontSize || 12, (value) => 
    selectedObject && onObjectUpdate(selectedObject.id, { fontSize: value })
  );

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleObjectUpdate = useCallback((updates: Partial<CanvasObject>) => {
    if (selectedObject) {
      onObjectUpdate(selectedObject.id, updates);
    }
  }, [selectedObject, onObjectUpdate]);

  const updateUUIDPreferences = useCallback((uuidUpdates: Partial<typeof preferences.uuid>) => {
    onPreferencesUpdate({
      ...preferences,
      uuid: { ...preferences.uuid, ...uuidUpdates }
    });
  }, [preferences, onPreferencesUpdate]);

  const generateQRPreview = () => {
    const sampleUUID = 'abc123ef';
    return `${preferences.uuid.qrPrefix}${sampleUUID}`;
  };

  if (!isVisible) return null;

  return (
    <FloatingPanel
      id="properties-panel"
      title="Properties"
      defaultPosition={{ x: 920, y: 120 }}
      defaultSize={{ width: 340, height: 650 }}
      minSize={{ width: 320, height: 500 }}
      maxSize={{ width: 500, height: 900 }}
      onClose={onClose}
      className="backdrop-blur-lg bg-white/95 dark:bg-gray-800/95"
    >
      <div className="space-y-4">
        {/* Canvas Properties */}
        <Collapsible.Root open={openSections.canvas} onOpenChange={() => toggleSection('canvas')}>
          <Collapsible.Trigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-2">
              <Squares2X2Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Canvas</span>
            </div>
            {openSections.canvas ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </Collapsible.Trigger>
          
          <AnimatePresence>
            {openSections.canvas && (
              <Collapsible.Content asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3">
                    <CanvasProperties
                      dimensions={dimensions}
                      onDimensionsChange={onDimensionsChange}
                      preferences={preferences}
                      onPreferencesUpdate={onPreferencesUpdate}
                    />
                  </div>
                </motion.div>
              </Collapsible.Content>
            )}
          </AnimatePresence>
        </Collapsible.Root>

        {/* Object Selection Properties */}
        <Collapsible.Root open={openSections.selection} onOpenChange={() => toggleSection('selection')}>
          <Collapsible.Trigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-2">
              <SwatchIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {selectedObject ? `${selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}` : 'Selection'}
              </span>
            </div>
            {openSections.selection ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </Collapsible.Trigger>
          
          <AnimatePresence>
            {openSections.selection && (
              <Collapsible.Content asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-4">
                    {selectedObject ? (
                      <>
                        {/* Position and Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Position & Size (mm)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">X</label>
                              <input
                                type="number"
                                {...objectXInput}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Y</label>
                              <input
                                type="number"
                                {...objectYInput}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                step="0.01"
                              />
                            </div>
                            {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle' || selectedObject.type === 'qrcode') && (
                              <>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                                  <input
                                    type="number"
                                    {...objectWidthInput}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                                  <input
                                    type="number"
                                    {...objectHeightInput}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    step="0.01"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Text Properties */}
                        {(selectedObject.type === 'text' || selectedObject.type === 'uuid') && (
                          <div className="space-y-3">
                            {selectedObject.type === 'text' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Text</label>
                                <textarea
                                  value={selectedObject.text || ''}
                                  onChange={(e) => handleObjectUpdate({ text: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                                  rows={2}
                                />
                              </div>
                            )}
                            
                            {selectedObject.type === 'uuid' && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                                  <span className="font-medium">UUID:</span>
                                  <code className="font-mono text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                                    {selectedObject.text || 'N/A'}
                                  </code>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  UUID text is automatically generated and cannot be edited manually.
                                </p>
                              </div>
                            )}

                            {/* Text Formatting */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Size</label>
                                <input
                                  type="number"
                                  {...fontSizeInput}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  min="6"
                                  max="72"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Family</label>
                                <select
                                  value={selectedObject.fontFamily || 'Arial'}
                                  onChange={(e) => handleObjectUpdate({ fontFamily: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                  <option value="Arial">Arial</option>
                                  <option value="Helvetica">Helvetica</option>
                                  <option value="Times New Roman">Times New Roman</option>
                                  <option value="Courier New">Courier New</option>
                                  <option value="Georgia">Georgia</option>
                                  <option value="Verdana">Verdana</option>
                                </select>
                              </div>
                            </div>

                            {/* Text Style Controls */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Text Style</label>
                              <div className="grid grid-cols-4 gap-2">
                                <button
                                  onClick={() => handleObjectUpdate({ 
                                    fontWeight: selectedObject.fontWeight === 'bold' ? 'normal' : 'bold' 
                                  })}
                                  className={`p-2 text-sm font-bold border rounded transition-colors ${
                                    selectedObject.fontWeight === 'bold'
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  title="Bold"
                                >
                                  B
                                </button>
                                <button
                                  onClick={() => handleObjectUpdate({ 
                                    fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic' 
                                  })}
                                  className={`p-2 text-sm italic border rounded transition-colors ${
                                    selectedObject.fontStyle === 'italic'
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  title="Italic"
                                >
                                  I
                                </button>
                                <button
                                  onClick={() => handleObjectUpdate({ 
                                    underline: !selectedObject.underline 
                                  })}
                                  className={`p-2 text-sm underline border rounded transition-colors ${
                                    selectedObject.underline
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  title="Underline"
                                >
                                  U
                                </button>
                                <button
                                  onClick={() => handleObjectUpdate({ 
                                    linethrough: !selectedObject.linethrough 
                                  })}
                                  className={`p-2 text-sm line-through border rounded transition-colors ${
                                    selectedObject.linethrough
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  title="Strikethrough"
                                >
                                  S
                                </button>
                              </div>
                            </div>

                            {/* Text Alignment */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Text Alignment</label>
                              <div className="grid grid-cols-3 gap-2">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => handleObjectUpdate({ textAlign: align })}
                                    className={`p-2 text-sm border rounded transition-colors flex items-center justify-center ${
                                      selectedObject.textAlign === align
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    title={`Align ${align}`}
                                  >
                                    {align === 'left' && '⫷'}
                                    {align === 'center' && '≡'}
                                    {align === 'right' && '⫸'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Line Height */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Line Height</label>
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  {selectedObject.lineHeight || 1.2}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={selectedObject.lineHeight || 1.2}
                                onChange={(e) => handleObjectUpdate({ lineHeight: Number(e.target.value) })}
                                className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-500 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>

                            {/* Letter Spacing */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Letter Spacing</label>
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  {selectedObject.charSpacing || 0}px
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-50"
                                max="50"
                                step="1"
                                value={selectedObject.charSpacing || 0}
                                onChange={(e) => handleObjectUpdate({ charSpacing: Number(e.target.value) })}
                                className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-500 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          </div>
                        )}

                        {/* Colors - Compact Version */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</label>
                        
                          {/* Fill Color */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Fill</span>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-6 h-6 rounded-md border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 cursor-pointer transition-transform hover:scale-110"
                                    style={{ backgroundColor: selectedObject.fill || '#000000' }}
                                    onClick={(e) => {
                                      const colorPicker = e.currentTarget.nextElementSibling as HTMLInputElement;
                                      if (colorPicker) colorPicker.click();
                                    }}
                                  />
                                  <input
                                    type="color"
                                    value={selectedObject.fill || '#000000'}
                                    onChange={(e) => handleObjectUpdate({ fill: e.target.value })}
                                    className="sr-only"
                                  />
                                  <input
                                    type="text"
                                    value={selectedObject.fill || '#000000'}
                                    onChange={(e) => handleObjectUpdate({ fill: e.target.value })}
                                    className="w-20 px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>
                        
                              {/* Compact Color Palette - Only most used colors */}
                              <div className="grid grid-cols-8 gap-1">
                                {[
                                  '#000000', '#FFFFFF', '#DC2626', '#EA580C', 
                                  '#D97706', '#16A34A', '#2563EB', '#7C3AED'
                                ].map((color) => (
                                  <button
                                    key={color}
                                    className={`w-5 h-5 rounded border-2 transition-all duration-200 hover:scale-110 ${
                                      selectedObject.fill === color 
                                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleObjectUpdate({ fill: color })}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                        
                            {/* Stroke Color (for shapes) */}
                            {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle') && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Stroke</span>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-6 h-6 rounded-md border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 cursor-pointer transition-transform hover:scale-110"
                                      style={{ backgroundColor: selectedObject.stroke || '#000000' }}
                                      onClick={(e) => {
                                        const colorPicker = e.currentTarget.nextElementSibling as HTMLInputElement;
                                        if (colorPicker) colorPicker.click();
                                      }}
                                    />
                                    <input
                                      type="color"
                                      value={selectedObject.stroke || '#000000'}
                                      onChange={(e) => handleObjectUpdate({ stroke: e.target.value })}
                                      className="sr-only"
                                    />
                                    <input
                                      type="text"
                                      value={selectedObject.stroke || '#000000'}
                                      onChange={(e) => handleObjectUpdate({ stroke: e.target.value })}
                                      className="w-20 px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                        
                                {/* Stroke Width Slider */}
                                <div className="mt-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Width</span>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                      {selectedObject.strokeWidth || 1}px
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={selectedObject.strokeWidth || 1}
                                    onChange={(e) => handleObjectUpdate({ strokeWidth: Number(e.target.value) })}
                                    className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-500 rounded-lg appearance-none cursor-pointer slider"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* QR Code specific settings */}
                        {selectedObject.type === 'qrcode' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">QR Code Settings</label>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Error Correction</label>
                              <select
                                value={selectedObject.qrErrorCorrectionLevel || 'M'}
                                onChange={(e) => handleObjectUpdate({ qrErrorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Layer Controls */}
                        {(onBringToFront || onSendToBack || onMoveUp || onMoveDown) && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Layer Order</label>
                            <div className="grid grid-cols-2 gap-2">
                              {onBringToFront && (
                                <button
                                  onClick={onBringToFront}
                                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                                >
                                  Bring to Front
                                </button>
                              )}
                              {onSendToBack && (
                                <button
                                  onClick={onSendToBack}
                                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                                >
                                  Send to Back
                                </button>
                              )}
                              {onMoveUp && (
                                <button
                                  onClick={onMoveUp}
                                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                                >
                                  Move Up
                                </button>
                              )}
                              {onMoveDown && (
                                <button
                                  onClick={onMoveDown}
                                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                                >
                                  Move Down
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <SwatchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">Select an object to edit its properties</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Collapsible.Content>
            )}
          </AnimatePresence>
        </Collapsible.Root>

        {/* Settings */}
        <Collapsible.Root open={openSections.settings} onOpenChange={() => toggleSection('settings')}>
          <Collapsible.Trigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-2">
              <CogIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</span>
            </div>
            {openSections.settings ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </Collapsible.Trigger>
          
          <AnimatePresence>
            {openSections.settings && (
              <Collapsible.Content asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-4">
                    {/* UUID Settings */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">UUID Configuration</label>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          UUID Length: {preferences.uuid.uuidLength} characters
                        </label>
                        <input
                          type="range"
                          min="4"
                          max="32"
                          value={preferences.uuid.uuidLength}
                          onChange={(e) => updateUUIDPreferences({ uuidLength: Number(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>4</span>
                          <span>32</span>
                        </div>
                      </div>
                      
                      {/* UUID Regeneration */}
                      {onRegenerateUUID && (
                        <div className="pt-3">
                          <button
                            onClick={() => {
                              onRegenerateUUID();
                            }}
                            className="w-full px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium"
                          >
                            🔄 Regenerate UUID
                          </button>
                          <div className="text-xs text-gray-500 mt-1">
                            Generate a new UUID for all QR codes and UUID objects on this label
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QR Code Settings */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">QR Code Configuration</label>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">QR Code Prefix URL</label>
                          <input
                            type="text"
                            value={preferences.uuid.qrPrefix}
                            onChange={(e) => updateUUIDPreferences({ qrPrefix: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="https://example.com/"
                          />
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                          <div className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                            {generateQRPreview()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Collapsible.Content>
            )}
          </AnimatePresence>
        </Collapsible.Root>
      </div>
    </FloatingPanel>
  );
}; 