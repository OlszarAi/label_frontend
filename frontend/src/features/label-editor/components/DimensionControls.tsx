'use client';

import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { LabelDimensions } from '../types/editor.types';
import { formatMm } from '../utils/dimensions';

interface DimensionControlsProps {
  dimensions: LabelDimensions;
  onDimensionsChange: (dimensions: LabelDimensions) => void;
}

export const DimensionControls = ({ dimensions, onDimensionsChange }: DimensionControlsProps) => {
  const [tempWidth, setTempWidth] = useState(dimensions.width.toString());
  const [tempHeight, setTempHeight] = useState(dimensions.height.toString());

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

  // Update temp values when dimensions change externally
  React.useEffect(() => {
    setTempWidth(dimensions.width.toString());
    setTempHeight(dimensions.height.toString());
  }, [dimensions.width, dimensions.height]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
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
    </motion.div>
  );
};
