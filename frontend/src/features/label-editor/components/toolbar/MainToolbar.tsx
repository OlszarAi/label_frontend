'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
  ArrowLeftIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ShareIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  SwatchIcon,
  BookmarkIcon,
  BoltIcon,
  BoltSlashIcon
} from '@heroicons/react/24/outline';

interface MainToolbarProps {
  // Navigation
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  
  // Zoom controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  
  // Panel toggles
  onToggleProperties: () => void;
  onToggleGallery: () => void;
  
  // Status
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isConnected: boolean;
  
  // Autosave
  autoSave: boolean;
  onToggleAutoSave: () => void;
  
  // Current label info
  currentLabel: {
    name: string;
    id: string;
  } | null;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onBack,
  onSave,
  onPreview,
  onShare,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleProperties,
  onToggleGallery,
  isSaving,
  hasUnsavedChanges,
  isConnected,
  autoSave,
  onToggleAutoSave,
  currentLabel,
}) => {
  const formatZoom = (zoomLevel: number) => {
    return `${Math.round(zoomLevel * 100)}%`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section - Navigation & Save */}
        <div className="flex items-center space-x-3">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                  Return to project
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          
          {/* Current Label Info */}
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <div className="flex items-center space-x-2">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {currentLabel?.name || 'Untitled Label'}
                </div>
                {/* Unsaved changes indicator - integrated into label info */}
                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md text-xs">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span>Unsaved</span>
                    {!autoSave && <span>• Manual</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Offline'}</span>
                {autoSave && <span>• Auto-save enabled</span>}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            onClick={onSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSaving}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${hasUnsavedChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }
              ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            <CloudArrowUpIcon className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </motion.button>

          {/* Autosave Toggle */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={onToggleAutoSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${autoSave 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {autoSave ? (
                    <BoltIcon className="w-4 h-4" />
                  ) : (
                    <BoltSlashIcon className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">
                    {autoSave ? 'Auto-save' : 'Manual'}
                  </span>
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                  {autoSave ? 'Auto-save enabled - changes saved automatically' : 'Auto-save disabled - save manually'}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Center section - Zoom controls */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={onZoomOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                  Zoom out
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          <motion.button
            onClick={onResetZoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors min-w-[60px]"
          >
            {formatZoom(zoom)}
          </motion.button>

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={onZoomIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                  Zoom in
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={onResetZoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                  Fit to screen
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Right section - Panel toggles & Actions */}
        <div className="flex items-center space-x-1">
          {/* Panel toggles */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={onToggleProperties}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <SwatchIcon className="w-4 h-4" />
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                    Toggle Properties
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={onToggleGallery}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                    Toggle Gallery
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={onPreview}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                    Preview
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={onShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50" sideOffset={5}>
                    Share
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}; 