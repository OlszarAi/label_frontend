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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-20 panel-glass border-b border-gray-800/50 flex items-center justify-between px-8"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* Left side - Label Information */}
      <div className="flex items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <InformationCircleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Label Editor</h1>
            <p className="text-xs text-gray-400">Twórz profesjonalne etykiety</p>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Rozmiar:</span>
            <span className="font-medium text-white px-2 py-1 bg-blue-500/20 rounded-md border border-blue-500/30">
              {dimensions.width} × {dimensions.height} mm
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Obiekty:</span>
            <span className="font-medium text-white px-2 py-1 bg-purple-500/20 rounded-md border border-purple-500/30">
              {objectCount}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Powiększenie:</span>
            <span className="font-medium text-white px-2 py-1 bg-green-500/20 rounded-md border border-green-500/30">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Zoom Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Skróty:</span>
          <div className="flex gap-1">
            {[
              { key: 'T', desc: 'Tekst' },
              { key: 'R', desc: 'Prostokąt' },
              { key: 'C', desc: 'Koło' },
              { key: 'Q', desc: 'QR' },
              { key: 'Del', desc: 'Usuń' }
            ].map(({ key, desc }) => (
              <span key={key} className="tooltip" data-tooltip={desc}>
                <kbd className="px-1.5 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded text-xs">
                  {key}
                </kbd>
              </span>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-600/50"></div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleZoomOut}
            className="p-2 rounded-lg btn-secondary hover:bg-gray-700/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={zoom <= 0.1}
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-8 text-center">10%</span>
            <div className="relative w-32">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={zoom}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-700/50 rounded-lg cursor-pointer slider"
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 bg-gray-800/80 px-2 py-1 rounded border border-gray-600/50">
                {Math.round(zoom * 100)}%
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10 text-center">500%</span>
          </div>

          <motion.button
            onClick={handleZoomIn}
            className="p-2 rounded-lg btn-secondary hover:bg-gray-700/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={zoom >= 5}
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={onResetView}
            className="p-2 rounded-lg btn-secondary hover:bg-blue-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zresetuj widok (Ctrl+0)"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
