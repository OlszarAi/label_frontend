'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, FabricObject, Text, IText, Rect, Circle, Line, FabricImage } from 'fabric';
import QRCode from 'qrcode';
import { LabelDimensions, CanvasObject, EditorPreferences, GridPreferences } from '../types/editor.types';
import { mmToPx, pxToMm } from '../utils/dimensions';
import { snapToGrid } from '../utils/grid';

interface CanvasEditorProps {
  dimensions: LabelDimensions;
  zoom: number;
  panX: number;
  panY: number;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  preferences: EditorPreferences;
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onObjectSelect: (id: string | null) => void;
}

// Extend FabricObject to include our custom data
interface CustomFabricObject extends FabricObject {
  customData?: { id: string };
  _isUpdating?: boolean;
  _isReplacingQR?: boolean;
}

// Grid line interface
interface GridLine extends FabricObject {
  isGridLine: boolean;
}

// Fabric.js event interfaces
interface FabricEvent {
  target?: FabricObject;
  selected?: FabricObject[];
}

// QR Image interface
interface QRImage extends FabricImage {
  _lastQRData?: string;
}

// Helper function to create QR code data URL
const createQRCodeDataURL = async (data: string, size: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M', foreground = '#000000', background = '#ffffff'): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: size,
      errorCorrectionLevel,
      color: {
        dark: foreground,
        light: background,
      },
      margin: 1,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

// Helper function to draw grid on canvas
const drawGrid = (canvas: Canvas, dimensions: LabelDimensions, gridPreferences: GridPreferences, zoom: number) => {
  if (!gridPreferences.enabled) {
    // Remove existing grid lines
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if ((obj as GridLine).isGridLine) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
    return;
  }

  // Remove existing grid lines first
  const objects = canvas.getObjects();
  objects.forEach(obj => {
    if ((obj as GridLine).isGridLine) {
      canvas.remove(obj);
    }
  });

  const widthPx = mmToPx(dimensions.width);
  const heightPx = mmToPx(dimensions.height);
  const gridSizePx = mmToPx(gridPreferences.size);

  // Create vertical lines
  for (let x = 0; x <= widthPx; x += gridSizePx) {
    const line = new Line([x, 0, x, heightPx], {
      stroke: gridPreferences.color,
      strokeWidth: 1 / zoom, // Adjust stroke width based on zoom
      selectable: false,
      evented: false,
      opacity: gridPreferences.opacity,
    });
    (line as unknown as GridLine).isGridLine = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  // Create horizontal lines
  for (let y = 0; y <= heightPx; y += gridSizePx) {
    const line = new Line([0, y, widthPx, y], {
      stroke: gridPreferences.color,
      strokeWidth: 1 / zoom, // Adjust stroke width based on zoom
      selectable: false,
      evented: false,
      opacity: gridPreferences.opacity,
    });
    (line as unknown as GridLine).isGridLine = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  canvas.renderAll();
};

export const CanvasEditor = ({
  dimensions,
  zoom,
  panX,
  panY,
  objects,
  selectedObjectId,
  preferences,
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

    // Configure canvas to enable proportional scaling from corners
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (!obj) return;
      
      // Check if we're scaling from a corner control
      if (obj.__corner) {
        const corner = obj.__corner;
        // Corner controls: tl, tr, bl, br (top-left, top-right, bottom-left, bottom-right)
        if (['tl', 'tr', 'bl', 'br'].includes(corner)) {
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;
          const scale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
          obj.set({
            scaleX: scaleX < 0 ? -scale : scale,
            scaleY: scaleY < 0 ? -scale : scale
          });
          obj.setCoords();
          canvas.renderAll();
        }
      }
    });

    fabricCanvasRef.current = canvas;

    // Set up event listeners
    // Handle text changes for editable text objects
    canvas.on('text:changed', (e: FabricEvent) => {
      const obj = e.target as CustomFabricObject;
      if (obj && obj.customData && (obj.type === 'text' || obj.type === 'i-text')) {
        const textObj = obj as IText;
        if (textObj.text) {
          onObjectUpdate(obj.customData.id, { text: textObj.text });
        }
      }
    });

    canvas.on('object:modified', (e: FabricEvent) => {
      const obj = e.target as CustomFabricObject;
      if (obj && obj.customData) {
        // Prevent event loops by checking if we're already updating or replacing QR
        if (obj._isUpdating || obj._isReplacingQR) return;
        obj._isUpdating = true;

        const updates: Partial<CanvasObject> = {
          x: pxToMm(obj.left || 0),
          y: pxToMm(obj.top || 0),
        };

        // Handle text objects differently for scaling
        if (obj.type === 'text' || obj.type === 'i-text') {
          const textObj = obj as IText;
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
          // Get the object type from our canvas objects state
          const canvasObjData = obj.customData && obj.customData.id ? objects.find(o => o.id === obj.customData!.id) : null;
          
          if (canvasObjData?.type === 'uuid') {
            // Handle UUID objects similarly to text but without text content updates
            const textObj = obj as Text;
            if (textObj.fontSize && (textObj.scaleX || textObj.scaleY)) {
              const originalFontSize = textObj.fontSize;
              const scaleX = textObj.scaleX || 1;
              const scaleY = textObj.scaleY || 1;
              const newFontSize = originalFontSize * Math.max(scaleX, scaleY);
              const finalFontSize = Math.max(1, Math.round(newFontSize));
              
              updates.fontSize = finalFontSize;
              textObj.set({ 
                scaleX: 1, 
                scaleY: 1,
                fontSize: finalFontSize
              });
              canvas.renderAll();
            }
            // Don't update text content for UUID objects - it should remain as sharedUUID
          } else if (canvasObjData?.type === 'qrcode') {
            // For QR codes, maintain square proportions
            const scale = Math.max(obj.scaleX || 1, obj.scaleY || 1);
            const newSize = obj.width ? obj.width * scale : 0;
            
            if (newSize > 0) {
              updates.width = pxToMm(newSize);
              updates.height = pxToMm(newSize); // Keep it square
            }
            
            // Reset scale and apply uniform size
            obj.set({ 
              scaleX: 1, 
              scaleY: 1,
              width: newSize > 0 ? newSize : obj.width,
              height: newSize > 0 ? newSize : obj.height
            });
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
        }

        onObjectUpdate(obj.customData.id, updates);
        
        // Clear the updating flag after a brief delay
        setTimeout(() => {
          obj._isUpdating = false;
        }, 50);
      }
    });

    canvas.on('selection:created', (e: FabricEvent) => {
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

    canvas.on('selection:updated', (e: FabricEvent) => {
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

    // Additional safety for positioning and snap to grid
    canvas.on('object:moving', (e) => {
      const obj = e.target as CustomFabricObject;
      if (obj) {
        let left = obj.left || 0;
        let top = obj.top || 0;

        // Apply snap to grid if enabled
        if (preferences.grid.snapToGrid && preferences.grid.enabled) {
          const leftMm = pxToMm(left);
          const topMm = pxToMm(top);
          const snappedLeftMm = snapToGrid(leftMm, preferences.grid.size, true);
          const snappedTopMm = snapToGrid(topMm, preferences.grid.size, true);
          left = mmToPx(snappedLeftMm);
          top = mmToPx(snappedTopMm);
        }

        // Ensure object stays within reasonable bounds
        const minX = -100;
        const minY = -100;
        const maxX = mmToPx(dimensions.width) + 100;
        const maxY = mmToPx(dimensions.height) + 100;

        if (left < minX) left = minX;
        if (top < minY) top = minY;
        if (left > maxX) left = maxX;
        if (top > maxY) top = maxY;

        obj.set({ left, top });
      }
    });

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onObjectUpdate, onObjectSelect, dimensions.width, dimensions.height, preferences.grid]);

  // Update canvas size and sync objects
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    // First update canvas size
    const widthPx = mmToPx(dimensions.width) * zoom;
    const heightPx = mmToPx(dimensions.height) * zoom;

    canvas.setDimensions({
      width: widthPx,
      height: heightPx
    });

    canvas.setZoom(zoom);

    // Draw grid after canvas size update
    drawGrid(canvas, dimensions, preferences.grid, zoom);

    // Then sync objects
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

        if (obj.type === 'text' && (existingFabricObj.type === 'text' || existingFabricObj.type === 'i-text')) {
          const textObj = existingFabricObj as IText;
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
        } else if (obj.type === 'uuid' && existingFabricObj.type === 'text') {
          const textObj = existingFabricObj as Text;
          textObj.set({
            text: obj.text || obj.sharedUUID || 'UUID',
            fontSize: obj.fontSize || 12,
            fontFamily: obj.fontFamily || 'Arial',
            fill: obj.fill || '#000000',
          });
        } else if (obj.type === 'qrcode' && existingFabricObj.type === 'image') {
          // For QR codes, only regenerate if data or size actually changed
          const currentQRData = `${preferences.uuid.qrPrefix}${obj.sharedUUID || ''}`;
          const imageObj = existingFabricObj as FabricImage;
          const currentSize = mmToPx(obj.width || 20);
           const needsRegeneration = (
            imageObj.width !== currentSize ||
            imageObj.height !== currentSize ||
            (imageObj as QRImage)._lastQRData !== currentQRData
          );
          
          if (needsRegeneration && !existingFabricObj._isReplacingQR) {
            existingFabricObj._isReplacingQR = true;
            
            createQRCodeDataURL(
              currentQRData,
              currentSize,
              obj.qrErrorCorrectionLevel || 'M',
              obj.fill || '#000000',
              obj.stroke || '#ffffff'
            ).then((dataURL) => {
              if (dataURL && existingFabricObj._isReplacingQR) {
                FabricImage.fromURL(dataURL).then((newImg) => {
                  newImg.set({
                    left: mmToPx(obj.x),
                    top: mmToPx(obj.y),
                    scaleX: 1,
                    scaleY: 1,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockUniScaling: true,
                  });
                  (newImg as CustomFabricObject).customData = { id: obj.id };
                  (newImg as QRImage)._lastQRData = currentQRData;
                  
                  // Safely remove all objects with this ID to prevent duplicates
                  const objectsToRemove = canvas.getObjects().filter(o => 
                    (o as CustomFabricObject).customData?.id === obj.id
                  );
                  objectsToRemove.forEach(oldObj => canvas.remove(oldObj));
                  
                  canvas.add(newImg);
                  canvas.renderAll();
                  
                  if (obj.id === selectedObjectId) {
                    canvas.setActiveObject(newImg);
                  }
                }).catch(() => {
                  if (existingFabricObj) existingFabricObj._isReplacingQR = false;
                });
              } else {
                if (existingFabricObj) existingFabricObj._isReplacingQR = false;
              }
            }).catch(() => {
              if (existingFabricObj) existingFabricObj._isReplacingQR = false;
            });
          } else if (!needsRegeneration) {
            // Just update position if no regeneration needed
            existingFabricObj.set({
              left: mmToPx(obj.x),
              top: mmToPx(obj.y),
            });
          }
        }
        
        existingFabricObj.setCoords();
      } else {
        // Create new object
        let fabricObj: CustomFabricObject;

        switch (obj.type) {
          case 'text':
            fabricObj = new IText(obj.text || 'Tekst', {
              left: mmToPx(obj.x),
              top: mmToPx(obj.y),
              fontSize: obj.fontSize || 12,
              fontFamily: obj.fontFamily || 'Arial',
              fill: obj.fill || '#000000',
              selectable: true,
              hasControls: true,
              hasBorders: true,
              editable: true,
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

          case 'uuid':
            const uuidText = obj.sharedUUID || obj.text || 'UUID';
            fabricObj = new Text(uuidText, {
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

          case 'qrcode':
            const qrData = `${preferences.uuid.qrPrefix}${obj.sharedUUID || ''}`;
            const qrSize = mmToPx(obj.width || 20);
            
            createQRCodeDataURL(
              qrData,
              qrSize,
              obj.qrErrorCorrectionLevel || 'M',
              obj.fill || '#000000',
              obj.stroke || '#ffffff'
            ).then((dataURL) => {
              if (dataURL) {
                FabricImage.fromURL(dataURL).then((img) => {
                  img.set({
                    left: mmToPx(obj.x),
                    top: mmToPx(obj.y),
                    scaleX: 1,
                    scaleY: 1,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockUniScaling: true,
                  });
                  (img as CustomFabricObject).customData = { id: obj.id };
                  (img as QRImage)._lastQRData = qrData;
                  
                  // Remove any existing objects with the same ID to prevent duplicates
                  const existingObjects = canvas.getObjects().filter(o => 
                    (o as CustomFabricObject).customData?.id === obj.id
                  );
                  existingObjects.forEach(oldObj => canvas.remove(oldObj));
                  
                  canvas.add(img);
                  canvas.renderAll();
                  
                  if (obj.id === selectedObjectId) {
                    canvas.setActiveObject(img);
                  }
                });
              }
            });
            return; // Exit early for async QR code creation

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

    // Draw grid after all objects are synced
    drawGrid(canvas, dimensions, preferences.grid, zoom);

    canvas.renderAll();
  }, [dimensions, zoom, objects, selectedObjectId, preferences.grid, preferences.uuid.qrPrefix]);

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
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-purple-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-green-500/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main canvas area */}
      <div className="relative bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          style={canvasStyle}
          className="rounded-lg shadow-lg"
        />
        
        {/* Enhanced coordinate system indicator */}
        <div 
          className="absolute text-xs text-gray-300 pointer-events-none bg-gray-800/80 px-3 py-1.5 rounded-lg shadow-lg border border-blue-500/20 backdrop-blur-sm"
          style={{ 
            left: `${panX - 40}px`, 
            top: `${panY - 40}px`,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="font-mono">0,0</span>
          </div>
        </div>
        
        {/* Canvas info overlay */}
        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-900/70 px-2 py-1 rounded border border-gray-600/50 backdrop-blur-sm">
          {dimensions.width} × {dimensions.height} mm
        </div>
      </div>
    </div>
  );
};
