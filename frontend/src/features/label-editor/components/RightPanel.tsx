'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon, 
  CubeIcon, 
  ViewColumnsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { LabelDimensions, CanvasObject, EditorPreferences } from '../types/editor.types';
import { DimensionControls } from './DimensionControls';
import { ObjectProperties } from './ObjectProperties';
import { Preferences } from './Preferences';

interface RightPanelProps {
  dimensions: LabelDimensions;
  onDimensionsChange: (dimensions: LabelDimensions) => void;
  selectedObject: CanvasObject | null;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  preferences: EditorPreferences;
  onPreferencesUpdate: (preferences: EditorPreferences) => void;
}

export const RightPanel = ({
  dimensions,
  onDimensionsChange,
  selectedObject,
  onObjectUpdate,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  preferences,
  onPreferencesUpdate
}: RightPanelProps) => {
  const [expandedSections, setExpandedSections] = useState({
    canvas: true,
    objects: true,
    preferences: false
  });

  const toggleSection = (section: 'canvas' | 'objects' | 'preferences') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section, 
    expanded 
  }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    section: 'canvas' | 'objects' | 'preferences';
    expanded: boolean;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full p-3 bg-gray-800 hover:bg-gray-700 border-b border-gray-700 
               text-white text-sm font-medium transition-all duration-200 
               flex items-center gap-3 justify-between group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        {title}
      </div>
      {expanded ? (
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="h-full bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <CogIcon className="w-4 h-4" />
          Properties
        </h2>
      </div>

      {/* Canvas Section */}
      <div className="border-b border-gray-800">
        <SectionHeader 
          title="Canvas" 
          icon={ViewColumnsIcon} 
          section="canvas" 
          expanded={expandedSections.canvas}
        />
        <AnimatePresence>
          {expandedSections.canvas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-850">
                <DimensionControls
                  dimensions={dimensions}
                  onDimensionsChange={onDimensionsChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Objects Section */}
      <div className="flex-1 flex flex-col">
        <SectionHeader 
          title="Objects" 
          icon={CubeIcon} 
          section="objects" 
          expanded={expandedSections.objects}
        />
        <AnimatePresence>
          {expandedSections.objects && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto">
                {selectedObject ? (
                  <div className="p-4 bg-gray-850">
                    <ObjectProperties
                      selectedObject={selectedObject}
                      onObjectUpdate={onObjectUpdate}
                      onBringToFront={onBringToFront}
                      onSendToBack={onSendToBack}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <CubeIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    Select an object to edit its properties
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preferences Section */}
      <div className="border-t border-gray-800">
        <SectionHeader 
          title="Preferences" 
          icon={AdjustmentsHorizontalIcon} 
          section="preferences" 
          expanded={expandedSections.preferences}
        />
        <AnimatePresence>
          {expandedSections.preferences && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-850">
                <Preferences
                  preferences={preferences}
                  onPreferencesUpdate={onPreferencesUpdate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
