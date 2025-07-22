'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Collapsible from '@radix-ui/react-collapsible';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  Squares2X2Icon,
  CubeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { CanvasObject, EditorPreferences } from '../types/editor.types';
import { CanvasProperties } from './CanvasProperties';

interface PropertiesPanelProps {
  dimensions: { width: number; height: number };
  onDimensionsChange: (dimensions: { width: number; height: number }) => void;
  selectedObject: CanvasObject | null;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  preferences: EditorPreferences;
  onPreferencesUpdate: (preferences: EditorPreferences) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
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
}) => {
  const [openSections, setOpenSections] = React.useState({
    canvas: true,
    object: true,
    settings: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleObjectUpdate = (field: string, value: string | number | boolean) => {
    if (selectedObject) {
      onObjectUpdate(selectedObject.id, { [field]: value });
    }
  };

  const handleGridUpdate = (field: string, value: string | number | boolean) => {
    onPreferencesUpdate({
      ...preferences,
      grid: {
        ...preferences.grid,
        [field]: value
      }
    });
  };

  const renderObjectProperties = () => {
    if (!selectedObject) {
      return (
        <div className="text-center text-gray-400 text-sm py-8">
          <CubeIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Select an object to edit properties
        </div>
      );
    }

    const commonProps = (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">X</label>
            <input
              type="number"
              value={selectedObject.x}
              onChange={(e) => handleObjectUpdate('x', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Y</label>
            <input
              type="number"
              value={selectedObject.y}
              onChange={(e) => handleObjectUpdate('y', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle' || selectedObject.type === 'qrcode') && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Width</label>
              <input
                type="number"
                value={selectedObject.width || 0}
                onChange={(e) => handleObjectUpdate('width', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Height</label>
              <input
                type="number"
                value={selectedObject.height || 0}
                onChange={(e) => handleObjectUpdate('height', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {(selectedObject.type === 'text' || selectedObject.type === 'uuid') && (
          <>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Text</label>
              <input
                type="text"
                value={selectedObject.text || ''}
                onChange={(e) => handleObjectUpdate('text', e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedObject.fontSize || 12}
                  onChange={(e) => handleObjectUpdate('fontSize', parseFloat(e.target.value) || 12)}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Font</label>
                <select
                  value={selectedObject.fontFamily || 'Arial'}
                  onChange={(e) => handleObjectUpdate('fontFamily', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times">Times</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-400 block mb-1">Fill Color</label>
          <input
            type="color"
            value={selectedObject.fill || '#000000'}
            onChange={(e) => handleObjectUpdate('fill', e.target.value)}
            className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
          />
        </div>

        {selectedObject.stroke !== undefined && (
          <>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Stroke Color</label>
              <input
                type="color"
                value={selectedObject.stroke || '#000000'}
                onChange={(e) => handleObjectUpdate('stroke', e.target.value)}
                className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Stroke Width</label>
              <input
                type="number"
                value={selectedObject.strokeWidth || 1}
                onChange={(e) => handleObjectUpdate('strokeWidth', parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}

        <div className="border-t border-gray-700 pt-3 space-y-2">
          <div className="text-xs text-gray-400 mb-2">Layer Order</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBringToFront}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              To Front
            </button>
            <button
              onClick={onSendToBack}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              To Back
            </button>
            <button
              onClick={onMoveUp}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              Move Up
            </button>
            <button
              onClick={onMoveDown}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              Move Down
            </button>
          </div>
        </div>
      </div>
    );

    return commonProps;
  };

  return (
    <motion.div 
      className="properties-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="panel-header">
        <h3 className="panel-title">Properties</h3>
      </div>

      <div className="panel-content">
        {/* Canvas Properties */}
        <Collapsible.Root open={openSections.canvas} onOpenChange={() => toggleSection('canvas')}>
          <Collapsible.Trigger className="w-full">
            <div className="collapsible-header">
              <div className="flex items-center gap-2">
                <Squares2X2Icon className="w-4 h-4" />
                <span>Canvas</span>
              </div>
              {openSections.canvas ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content className="collapsible-content">
            <CanvasProperties
              dimensions={dimensions}
              onDimensionsChange={onDimensionsChange}
              preferences={preferences}
              onPreferencesUpdate={onPreferencesUpdate}
            />
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Object Properties */}
        <Collapsible.Root open={openSections.object} onOpenChange={() => toggleSection('object')}>
          <Collapsible.Trigger className="w-full">
            <div className="collapsible-header">
              <div className="flex items-center gap-2">
                <CubeIcon className="w-4 h-4" />
                <span>Object</span>
              </div>
              {openSections.object ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content className="collapsible-content">
            {renderObjectProperties()}
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Settings */}
        <Collapsible.Root open={openSections.settings} onOpenChange={() => toggleSection('settings')}>
          <Collapsible.Trigger className="w-full">
            <div className="collapsible-header">
              <div className="flex items-center gap-2">
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
              </div>
              {openSections.settings ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content className="collapsible-content">
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.grid.showGrid}
                    onChange={(e) => handleGridUpdate('showGrid', e.target.checked)}
                    className="rounded border-gray-700"
                  />
                  Show Grid
                </label>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.grid.snapToGrid}
                    onChange={(e) => handleGridUpdate('snapToGrid', e.target.checked)}
                    className="rounded border-gray-700"
                  />
                  Snap to Grid
                </label>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Grid Size (mm)</label>
                <input
                  type="number"
                  value={preferences.grid.size}
                  onChange={(e) => handleGridUpdate('size', parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">UUID Length</label>
                <input
                  type="number"
                  value={preferences.uuid.uuidLength}
                  onChange={(e) => onPreferencesUpdate({
                    ...preferences,
                    uuid: {
                      ...preferences.uuid,
                      uuidLength: parseInt(e.target.value) || 8
                    }
                  })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </motion.div>
  );
};
