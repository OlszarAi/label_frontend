'use client';

import React, { useRef, useEffect } from 'react';

interface EditorCanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  zoom: number;
  width?: number;
  height?: number;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  onCanvasReady,
  zoom,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-auto">
      <div 
        ref={containerRef}
        className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
        />
      </div>
    </div>
  );
};
