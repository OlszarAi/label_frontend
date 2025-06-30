'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon, 
  CubeIcon, 
  ViewColumnsIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { LabelDimensions, CanvasObject, EditorPreferences } from '../types/editor.types';
import { CanvasProperties } from './CanvasProperties';
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
    objects: false,
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
      className="w-full p-3 bg-gray-800/70 hover:bg-gray-700/70 border-b border-gray-700/50 
               text-white text-sm font-medium transition-all duration-200 
               flex items-center gap-3 justify-between group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        <span className="font-semibold">{title}</span>
      </div>
      <motion.div
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </motion.div>
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full panel-glass border-l border-gray-800/50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <CogIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Właściwości</h2>
            <p className="text-xs text-gray-400">Dostosuj ustawienia</p>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Canvas Section */}
        <div className="border-b border-gray-800/50">
          <SectionHeader 
            title="Płótno" 
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
                <div className="p-4 bg-gray-850/70">
                  <CanvasProperties
                    dimensions={dimensions}
                    onDimensionsChange={onDimensionsChange}
                    preferences={preferences}
                    onPreferencesUpdate={onPreferencesUpdate}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Objects Section */}
        <div className="border-b border-gray-800/50">
          <SectionHeader 
            title={selectedObject ? `Obiekt: ${selectedObject.type}` : "Obiekt"} 
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
                className="overflow-hidden"
              >
                <div className="bg-gray-850/70">
                  {selectedObject ? (
                    <div className="p-4">
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
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CubeIcon className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="mb-2">Brak zaznaczenia</p>
                      <p className="text-xs text-gray-500">Wybierz obiekt na płótnie, aby edytować jego właściwości</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preferences Section */}
        <div>
          <SectionHeader 
            title="Preferencje" 
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
                <div className="p-4 bg-gray-850/70">
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
    </motion.div>
  );
};
