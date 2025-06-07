'use client';

import { ZoomIn, ZoomOut, RotateCcw, HelpCircle } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetView: () => void;
  onShowHelp?: () => void;
}

export const ZoomControls = ({ zoom, onZoomChange, onResetView, onShowHelp }: ZoomControlsProps) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.2, 0.1));
  };

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onZoomChange(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Widok</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Oddal"
          >
            <ZoomOut size={16} />
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={handleZoomSlider}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <button
            onClick={handleZoomIn}
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Przybliż"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <button
          onClick={onResetView}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RotateCcw size={16} />
          <span className="text-sm">Reset widoku</span>
        </button>

        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Pomoc</span>
          </button>
        )}
      </div>
    </div>
  );
};
