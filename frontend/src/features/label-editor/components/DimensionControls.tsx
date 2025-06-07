'use client';

import React, { useState, ChangeEvent } from 'react';
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
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Rozmiar Etykiety</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Szerokość
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={tempWidth}
              onChange={handleWidthChange}
              min="1"
              max="1000"
              step="0.1"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">mm</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wysokość
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={tempHeight}
              onChange={handleHeightChange}
              min="1"
              max="1000"
              step="0.1"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">mm</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm text-gray-600">
            <div>Rozmiar: {formatMm(dimensions.width)} × {formatMm(dimensions.height)}</div>
            <div>Proporcje: {(dimensions.width / dimensions.height).toFixed(2)}:1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
