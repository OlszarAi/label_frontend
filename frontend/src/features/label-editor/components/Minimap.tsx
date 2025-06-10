'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapIcon } from '@heroicons/react/24/outline';
import { LabelDimensions, CanvasObject } from '../types/editor.types';
import { mmToPx } from '../utils/dimensions';

interface MinimapProps {
  dimensions: LabelDimensions;
  objects: CanvasObject[];
  zoom: number;
  panX: number;
  panY: number;
  className?: string;
}

export const Minimap = ({ 
  dimensions, 
  objects, 
  zoom, // eslint-disable-line @typescript-eslint/no-unused-vars
  panX, // eslint-disable-line @typescript-eslint/no-unused-vars
  panY, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = '' 
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapScale = 0.1; // Scale factor for minimap

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate minimap dimensions
    const labelWidthPx = mmToPx(dimensions.width);
    const labelHeightPx = mmToPx(dimensions.height);
    const minimapWidth = labelWidthPx * minimapScale;
    const minimapHeight = labelHeightPx * minimapScale;

    // Set canvas size
    canvas.width = minimapWidth;
    canvas.height = minimapHeight;

    // Clear canvas
    ctx.clearRect(0, 0, minimapWidth, minimapHeight);

    // Draw label background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, minimapWidth, minimapHeight);

    // Draw label border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, minimapWidth, minimapHeight);

    // Draw objects
    objects.forEach(obj => {
      ctx.save();

      const x = (obj.x || 0) * minimapScale;
      const y = (obj.y || 0) * minimapScale;
      const width = (obj.width || 0) * minimapScale;
      const height = (obj.height || 0) * minimapScale;

      switch (obj.type) {
        case 'text':
          ctx.fillStyle = obj.fill || '#000000';
          ctx.font = `${Math.max(2, (obj.fontSize || 12) * minimapScale)}px ${obj.fontFamily || 'Arial'}`;
          ctx.fillText(obj.text || '', x, y + height);
          break;

        case 'rectangle':
          if (obj.fill && obj.fill !== 'transparent') {
            ctx.fillStyle = obj.fill;
            ctx.fillRect(x, y, width, height);
          }
          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = Math.max(0.5, (obj.strokeWidth || 1) * minimapScale);
            ctx.strokeRect(x, y, width, height);
          }
          break;

        case 'circle':
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const radius = Math.min(width, height) / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          
          if (obj.fill && obj.fill !== 'transparent') {
            ctx.fillStyle = obj.fill;
            ctx.fill();
          }
          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = Math.max(0.5, (obj.strokeWidth || 1) * minimapScale);
            ctx.stroke();
          }
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + width, y + height);
          ctx.strokeStyle = obj.stroke || '#000000';
          ctx.lineWidth = Math.max(0.5, (obj.strokeWidth || 1) * minimapScale);
          ctx.stroke();
          break;
      }

      ctx.restore();
    });

  }, [dimensions, objects, minimapScale]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gray-900 border border-gray-700 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapIcon className="w-4 h-4 text-blue-400" />
        <span className="text-white text-xs font-medium">Minimap</span>
      </div>
      
      <div className="bg-gray-800 rounded-md p-2">
        <canvas
          ref={canvasRef}
          className="border border-gray-600 rounded-sm bg-white"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Design area overview
      </div>
    </motion.div>
  );
};
