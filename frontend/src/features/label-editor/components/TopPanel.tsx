'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LabelDimensions } from '../types/editor.types';

interface TopPanelProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetView: () => void;
  dimensions: LabelDimensions;
  objectCount: number;
}

export const TopPanel = ({
  zoom,
  onZoomChange,
  onResetView,
  dimensions,
  objectCount
}: TopPanelProps) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoom + 0.1));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom - 0.1));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onZoomChange(value);
  };

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      {/* Label Information */}
      <div className="flex items-center gap-6 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="w-4 h-4 text-blue-400" />
          <span className="font-medium">Label Editor</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Size:</span>
            <span className="font-medium text-white">
              {dimensions.width} × {dimensions.height} mm
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Objects:</span>
            <span className="font-medium text-white">{objectCount}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Zoom:</span>
            <span className="font-medium text-white">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Shortcuts:</span>
            <span className="text-xs text-gray-400">T - Text, R - Rectangle, C - Circle, Del - Delete</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-4">
        {/* Zoom Out Button */}
        <motion.button
          onClick={handleZoomOut}
          className="p-2 rounded-lg btn-secondary text-gray-300 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={zoom <= 0.1}
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4" />
        </motion.button>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-8">10%</span>
          <div className="relative w-32">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-xs text-gray-500 w-10">500%</span>
        </div>

        {/* Zoom In Button */}
        <motion.button
          onClick={handleZoomIn}
          className="p-2 rounded-lg btn-secondary text-gray-300 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={zoom >= 5}
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
        </motion.button>

        {/* Reset View Button */}
        <motion.button
          onClick={onResetView}
          className="px-4 py-2 rounded-lg btn-primary text-white text-xs font-medium 
                   flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
          Reset View
        </motion.button>
      </div>
    </div>
  );
};
