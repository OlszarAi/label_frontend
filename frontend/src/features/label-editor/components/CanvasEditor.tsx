'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, FabricObject, Text, Rect, Circle, Line } from 'fabric';
import { LabelDimensions, CanvasObject } from '../types/editor.types';
import { mmToPx, pxToMm } from '../utils/dimensions';

interface CanvasEditorProps {
  dimensions: LabelDimensions;
  zoom: number;
  panX: number;
  panY: number;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onObjectSelect: (id: string | null) => void;
}

// Extend FabricObject to include our custom data
interface CustomFabricObject extends FabricObject {
  customData?: { id: string };
  _isUpdating?: boolean;
}

export const CanvasEditor = ({
  dimensions,
  zoom,
  panX,
  panY,
  objects,
  selectedObjectId,
  onObjectUpdate,
  onObjectSelect
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      allowTouchScrolling: false,
      enableRetinaScaling: true,
      uniformScaling: false,
      centeredScaling: false,
      centeredRotation: false,
      skipTargetFind: false,
    });

    fabricCanvasRef.current = canvas;

    // Set up event listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('object:modified', (e: any) => {
      const obj = e.target as CustomFabricObject;
      if (obj && obj.customData) {
        // Prevent event loops by checking if we're already updating
        if (obj._isUpdating) return;
        obj._isUpdating = true;

        const updates: Partial<CanvasObject> = {
          x: pxToMm(obj.left || 0),
          y: pxToMm(obj.top || 0),
        };

        // Handle text objects differently for scaling
        if (obj.type === 'text') {
          const textObj = obj as Text;
          // For text objects, scale affects fontSize instead of width/height
          if (textObj.fontSize && (textObj.scaleX || textObj.scaleY)) {
            const originalFontSize = textObj.fontSize;
            const scaleX = textObj.scaleX || 1;
            const scaleY = textObj.scaleY || 1;
            const newFontSize = originalFontSize * Math.max(scaleX, scaleY);
            const finalFontSize = Math.max(1, Math.round(newFontSize)); // Ensure minimum font size of 1
            
            updates.fontSize = finalFontSize;
            // Reset scale to 1 after applying to fontSize
            textObj.set({ 
              scaleX: 1, 
              scaleY: 1,
              fontSize: finalFontSize
            });
            canvas.renderAll();
          }
          // Update text content if it was edited
          if (textObj.text) {
            updates.text = textObj.text;
          }
        } else {
          // For other objects, handle width/height scaling normally
          const newWidth = obj.width ? obj.width * (obj.scaleX || 1) : 0;
          const newHeight = obj.height ? obj.height * (obj.scaleY || 1) : 0;
          
          if (newWidth > 0) updates.width = pxToMm(newWidth);
          if (newHeight > 0) updates.height = pxToMm(newHeight);
          
          // Reset scale to prevent compound scaling
          obj.set({ scaleX: 1, scaleY: 1 });
          if (obj.width && newWidth > 0) obj.set({ width: newWidth });
          if (obj.height && newHeight > 0) obj.set({ height: newHeight });
        }

        onObjectUpdate(obj.customData.id, updates);
        
        // Clear the updating flag after a brief delay
        setTimeout(() => {
          obj._isUpdating = false;
        }, 50);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('selection:created', (e: any) => {
      // Only handle single object selection
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0] as CustomFabricObject;
        if (obj && obj.customData) {
          onObjectSelect(obj.customData.id);
        }
      } else if (e.selected && e.selected.length > 1) {
        // Disable multi-selection by clearing it
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('selection:updated', (e: any) => {
      // Only handle single object selection
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0] as CustomFabricObject;
        if (obj && obj.customData) {
          onObjectSelect(obj.customData.id);
        }
      } else if (e.selected && e.selected.length > 1) {
        // Disable multi-selection by clearing it
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });

    canvas.on('selection:cleared', () => {
      onObjectSelect(null);
    });

    // Additional safety for positioning
    canvas.on('object:moving', (e) => {
      const obj = e.target as CustomFabricObject;
      if (obj) {
        // Ensure object stays within reasonable bounds
        const minX = -100;
        const minY = -100;
        const maxX = mmToPx(dimensions.width) + 100;
        const maxY = mmToPx(dimensions.height) + 100;

        if (obj.left! < minX) obj.set({ left: minX });
        if (obj.top! < minY) obj.set({ top: minY });
        if (obj.left! > maxX) obj.set({ left: maxX });
        if (obj.top! > maxY) obj.set({ top: maxY });
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [onObjectUpdate, onObjectSelect, dimensions.width, dimensions.height]);

  // Update canvas size based on dimensions and zoom
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const widthPx = mmToPx(dimensions.width) * zoom;
    const heightPx = mmToPx(dimensions.height) * zoom;

    canvas.setDimensions({
      width: widthPx,
      height: heightPx
    });

    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [dimensions, zoom]);

  // Sync fabric objects with state
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const currentObjects = canvas.getObjects() as CustomFabricObject[];
    
    // Create a map of existing objects by their custom data ID
    const existingObjectsMap = new Map<string, CustomFabricObject>();
    currentObjects.forEach(obj => {
      if (obj.customData?.id) {
        existingObjectsMap.set(obj.customData.id, obj);
      }
    });

    // Remove objects that no longer exist in state
    const stateObjectIds = new Set(objects.map(obj => obj.id));
    currentObjects.forEach(obj => {
      if (obj.customData?.id && !stateObjectIds.has(obj.customData.id)) {
        canvas.remove(obj);
      }
    });

    // Add or update objects
    objects.forEach((obj) => {
      const existingFabricObj = existingObjectsMap.get(obj.id);
      
      if (existingFabricObj) {
        // Update existing object without recreating it
        // Skip update if object is currently being modified to prevent loops
        if (existingFabricObj._isUpdating) return;
        
        // Update properties
        existingFabricObj.set({
          left: mmToPx(obj.x),
          top: mmToPx(obj.y),
        });

        if (obj.type === 'text' && existingFabricObj.type === 'text') {
          const textObj = existingFabricObj as Text;
          textObj.set({
            text: obj.text || 'Tekst',
            fontSize: obj.fontSize || 12,
            fontFamily: obj.fontFamily || 'Arial',
            fill: obj.fill || '#000000',
          });
        } else if (obj.type === 'rectangle' && existingFabricObj.type === 'rect') {
          existingFabricObj.set({
            width: mmToPx(obj.width || 20),
            height: mmToPx(obj.height || 10),
            fill: obj.fill || 'transparent',
            stroke: obj.stroke || '#000000',
            strokeWidth: obj.strokeWidth || 1,
          });
        } else if (obj.type === 'circle' && existingFabricObj.type === 'circle') {
          existingFabricObj.set({
            radius: mmToPx((obj.width || 20) / 2),
            fill: obj.fill || 'transparent',
            stroke: obj.stroke || '#000000',
            strokeWidth: obj.strokeWidth || 1,
          });
        } else if (obj.type === 'line' && existingFabricObj.type === 'line') {
          existingFabricObj.set({
            x2: mmToPx(obj.x + (obj.width || 20)),
            y2: mmToPx(obj.y),
            stroke: obj.stroke || '#000000',
            strokeWidth: obj.strokeWidth || 1,
          });
        }
        
        existingFabricObj.setCoords();
      } else {
        // Create new object
        let fabricObj: CustomFabricObject;

        switch (obj.type) {
          case 'text':
            fabricObj = new Text(obj.text || 'Tekst', {
              left: mmToPx(obj.x),
              top: mmToPx(obj.y),
              fontSize: obj.fontSize || 12,
              fontFamily: obj.fontFamily || 'Arial',
              fill: obj.fill || '#000000',
              selectable: true,
              hasControls: true,
              hasBorders: true,
            }) as CustomFabricObject;
            break;

          case 'rectangle':
            fabricObj = new Rect({
              left: mmToPx(obj.x),
              top: mmToPx(obj.y),
              width: mmToPx(obj.width || 20),
              height: mmToPx(obj.height || 10),
              fill: obj.fill || 'transparent',
              stroke: obj.stroke || '#000000',
              strokeWidth: obj.strokeWidth || 1,
            }) as CustomFabricObject;
            break;

          case 'circle':
            fabricObj = new Circle({
              left: mmToPx(obj.x),
              top: mmToPx(obj.y),
              radius: mmToPx((obj.width || 20) / 2),
              fill: obj.fill || 'transparent',
              stroke: obj.stroke || '#000000',
              strokeWidth: obj.strokeWidth || 1,
            }) as CustomFabricObject;
            break;

          case 'line':
            fabricObj = new Line([
              mmToPx(obj.x),
              mmToPx(obj.y),
              mmToPx(obj.x + (obj.width || 20)),
              mmToPx(obj.y)
            ], {
              stroke: obj.stroke || '#000000',
              strokeWidth: obj.strokeWidth || 1,
            }) as CustomFabricObject;
            break;

          default:
            return;
        }

        fabricObj.customData = { id: obj.id };
        canvas.add(fabricObj);
      }

      // Handle selection
      if (obj.id === selectedObjectId) {
        const targetObj = existingObjectsMap.get(obj.id) || canvas.getObjects().find(
          o => (o as CustomFabricObject).customData?.id === obj.id
        );
        if (targetObj) {
          canvas.setActiveObject(targetObj);
        }
      }
    });

    canvas.renderAll();
  }, [objects, selectedObjectId]);

  const canvasStyle = {
    transform: `translate(${panX}px, ${panY}px)`,
    transformOrigin: '0 0',
    border: '2px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex items-center justify-center p-8 canvas-container overflow-hidden relative"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={canvasStyle}
        />
        
        {/* Coordinate system indicator */}
        <div 
          className="absolute text-xs text-gray-600 pointer-events-none bg-white px-2 py-1 rounded shadow-sm"
          style={{ 
            left: `${panX - 30}px`, 
            top: `${panY - 30}px` 
          }}
        >
          0,0
        </div>
      </div>
    </div>
  );
};
