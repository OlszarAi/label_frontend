'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { DEFAULT_EDITOR_CONFIG } from '../constants/editor.constants';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
}) => {
  const { minZoom, maxZoom } = DEFAULT_EDITOR_CONFIG;
  
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex items-center gap-3 z-10 min-w-[280px]">
      {/* Zoom Slider */}
      <div className="flex items-center gap-2 flex-1">
        <Icons.ZoomOut size={16} className="text-gray-500" />
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step="0.1"
          value={zoom}
          onChange={handleSliderChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #e5e7eb ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <Icons.ZoomIn size={16} className="text-gray-500" />
      </div>

      {/* Zoom Reset */}
      <button
        onClick={handleZoomReset}
        className="p-1.5 rounded-md transition-colors duration-200 flex items-center justify-center text-gray-700 hover:bg-gray-100"
        title="Resetuj zoom (100%)"
      >
        <Icons.RotateCcw size={16} />
      </button>

      {/* Current Zoom Display */}
      <span className="text-sm text-gray-600 min-w-[45px] text-center font-medium">
        {zoomPercentage}%
      </span>
    </div>
  );
};
