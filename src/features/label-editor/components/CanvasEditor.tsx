'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, FabricObject, Text, IText, Line } from 'fabric';
import { LabelDimensions, CanvasObject, EditorPreferences, GridPreferences } from '../types/editor.types';
import { mmToPx, pxToMm } from '../utils/dimensions';
import { createRectangleObject, handleRectangleModified, CustomFabricObject as RectangleCustomFabricObject } from './canvas-objects/RectangleObject';
import { createCircleObject, handleCircleModified, CustomFabricObject as CircleCustomFabricObject } from './canvas-objects/CircleObject';
import { createImageObject, handleImageModified, CustomFabricObject as ImageCustomFabricObject } from './canvas-objects/ImageObject';
import { createQRCodeObject, handleQRCodeModified, CustomFabricObject as QRCodeCustomFabricObject } from './canvas-objects/QRCodeObject';

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
  onCanvasReady?: (canvas: Canvas) => void;
  onWheelZoom?: (event: WheelEvent) => void;
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

// Helper function to draw grid on canvas
const drawGrid = (canvas: Canvas, dimensions: LabelDimensions, gridPreferences: GridPreferences) => {
  if (!gridPreferences.showGrid) {
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

  const gridLines: Line[] = [];

  // Create vertical lines
  for (let x = 0; x <= widthPx; x += gridSizePx) {
    const line = new Line([x, 0, x, heightPx], {
      stroke: gridPreferences.color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      opacity: gridPreferences.opacity,
    });
    (line as unknown as GridLine).isGridLine = true;
    gridLines.push(line);
  }

  // Create horizontal lines
  for (let y = 0; y <= heightPx; y += gridSizePx) {
    const line = new Line([0, y, widthPx, y], {
      stroke: gridPreferences.color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      opacity: gridPreferences.opacity,
    });
    (line as unknown as GridLine).isGridLine = true;
    gridLines.push(line);
  }

  // Add all grid lines at once
  gridLines.forEach(line => {
    canvas.add(line);
  });

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
  onObjectSelect,
  onCanvasReady,
  onWheelZoom,
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });
  const previousObjectsRef = useRef<CanvasObject[]>([]);
  const previousDimensionsRef = useRef<LabelDimensions>({ width: 0, height: 0 });
  const previousZoomRef = useRef<number>(1);
  
  // Memoize objects to prevent unnecessary re-renders
  const memoizedObjects = useMemo(() => objects, [objects]);
  
  // Function to add object to canvas
  const addObjectToCanvas = useCallback((obj: CanvasObject, canvas: Canvas) => {
    // Remove any existing objects with the same ID first
    const existingObjects = canvas.getObjects().filter(o => 
      (o as CustomFabricObject).customData?.id === obj.id
    );
    existingObjects.forEach(oldObj => canvas.remove(oldObj));

    let fabricObj: CustomFabricObject;

    switch (obj.type) {
      case 'text':
        fabricObj = new IText(obj.text || 'Tekst', {
          left: mmToPx(obj.x),
          top: mmToPx(obj.y),
          fontSize: obj.fontSize || 12,
          fontFamily: obj.fontFamily || 'Arial',
          fontWeight: obj.fontWeight || 'normal',
          fontStyle: obj.fontStyle || 'normal',
          underline: obj.underline || false,
          linethrough: obj.linethrough || false,
          textAlign: obj.textAlign || 'left',
          lineHeight: obj.lineHeight || 1.2,
          charSpacing: obj.charSpacing || 0,
          fill: obj.fill || '#000000',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          editable: true,
        }) as CustomFabricObject;
        break;

      case 'rectangle':
        fabricObj = createRectangleObject(obj);
        break;

      case 'circle':
        fabricObj = createCircleObject(obj);
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
          fontWeight: obj.fontWeight || 'normal',
          fontStyle: obj.fontStyle || 'normal',
          underline: obj.underline || false,
          linethrough: obj.linethrough || false,
          textAlign: obj.textAlign || 'left',
          lineHeight: obj.lineHeight || 1.2,
          charSpacing: obj.charSpacing || 0,
          fill: obj.fill || '#000000',
          selectable: true,
          hasControls: true,
          hasBorders: true,
        }) as CustomFabricObject;
        break;

      case 'qrcode':
        createQRCodeObject(obj, preferences.uuid.qrPrefix, (fabricObj) => {
          const existingObjects = canvas.getObjects().filter(o => 
            (o as CustomFabricObject).customData?.id === obj.id
          );
          existingObjects.forEach(oldObj => canvas.remove(oldObj));
          
          canvas.add(fabricObj);
          canvas.renderAll();
          
          if (obj.id === selectedObjectId) {
            canvas.setActiveObject(fabricObj);
          }
          
          // Fast invisible refresh to fix resize issue
          requestAnimationFrame(() => {
            fabricObj.setCoords();
            canvas.requestRenderAll();
          });
        });
        return;

      case 'image':
        createImageObject(obj, (fabricObj) => {
          const existingObjects = canvas.getObjects().filter(o => 
            (o as CustomFabricObject).customData?.id === obj.id
          );
          existingObjects.forEach(oldObj => canvas.remove(oldObj));
          
          canvas.add(fabricObj);
          canvas.renderAll();
          
          if (obj.id === selectedObjectId) {
            canvas.setActiveObject(fabricObj);
          }
          
          // Fast invisible refresh to fix resize issue
          requestAnimationFrame(() => {
            fabricObj.setCoords();
            canvas.requestRenderAll();
          });
        });
        return;

      default:
        return;
    }

    fabricObj.customData = { id: obj.id };
    canvas.add(fabricObj);
    
    if (obj.id === selectedObjectId) {
      canvas.setActiveObject(fabricObj);
    }
  }, [selectedObjectId, preferences.uuid.qrPrefix]);

  // Handle object modifications
  const handleObjectModified = useCallback((obj: CustomFabricObject): Partial<CanvasObject> => {
    // Prevent event loops
    if (obj._isUpdating || obj._isReplacingQR) return {};
    obj._isUpdating = true;

    const updates: Partial<CanvasObject> = {
      x: pxToMm(obj.left || 0),
      y: pxToMm(obj.top || 0),
    };

    // Get the object type from our canvas objects state
    const canvasObjData = obj.customData && obj.customData.id ? memoizedObjects.find(o => o.id === obj.customData!.id) : null;
    
    if (obj.type === 'text' || obj.type === 'i-text') {
      // Handle text objects
      const textObj = obj as IText;
      if (textObj.fontSize && (textObj.scaleX !== 1 || textObj.scaleY !== 1)) {
        const scale = Math.max(textObj.scaleX || 1, textObj.scaleY || 1);
        const newFontSize = Math.max(1, Math.round((textObj.fontSize || 12) * scale));
        
        updates.fontSize = newFontSize;
        textObj.set({ 
          scaleX: 1, 
          scaleY: 1,
          fontSize: newFontSize
        });
        obj.canvas?.renderAll();
      }
      if (textObj.text) {
        updates.text = textObj.text;
      }
    } else if (canvasObjData?.type === 'uuid') {
      // Handle UUID objects
      const textObj = obj as Text;
      if (textObj.fontSize && (textObj.scaleX !== 1 || textObj.scaleY !== 1)) {
        const scale = Math.max(textObj.scaleX || 1, textObj.scaleY || 1);
        const newFontSize = Math.max(1, Math.round((textObj.fontSize || 12) * scale));
        
        updates.fontSize = newFontSize;
        textObj.set({ 
          scaleX: 1, 
          scaleY: 1,
          fontSize: newFontSize
        });
        obj.canvas?.renderAll();
      }
    } else if (canvasObjData?.type === 'qrcode') {
      // Handle QR codes using separate module
      const qrUpdates = handleQRCodeModified(obj as QRCodeCustomFabricObject);
      Object.assign(updates, qrUpdates);
    } else if (canvasObjData?.type === 'rectangle') {
      // Handle rectangles using separate module
      const rectUpdates = handleRectangleModified(obj as RectangleCustomFabricObject, canvasObjData);
      Object.assign(updates, rectUpdates);
    } else if (canvasObjData?.type === 'circle') {
      // Handle circles using separate module
      const circleUpdates = handleCircleModified(obj as CircleCustomFabricObject);
      Object.assign(updates, circleUpdates);
    } else if (canvasObjData?.type === 'image') {
      // Handle images using separate module
      const imageUpdates = handleImageModified(obj as ImageCustomFabricObject);
      Object.assign(updates, imageUpdates);
    } else if (canvasObjData?.type === 'line') {
      // Handle lines - same logic as rectangle
      const newWidth = obj.width ? obj.width * (obj.scaleX || 1) : 0;
      const newHeight = obj.height ? obj.height * (obj.scaleY || 1) : 0;
      
      if (newWidth > 0) updates.width = pxToMm(newWidth);
      if (newHeight > 0) updates.height = pxToMm(newHeight);
      
      obj.set({ scaleX: 1, scaleY: 1 });
      if (obj.width && newWidth > 0) obj.set({ width: newWidth });
      if (obj.height && newHeight > 0) obj.set({ height: newHeight });
    }

    // Clear the updating flag after a brief delay
    setTimeout(() => {
      obj._isUpdating = false;
    }, 50);

    return updates;
  }, [memoizedObjects]);

  // Update container size when it changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Initialize canvas and event listeners
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: mmToPx(dimensions.width) * zoom,
      height: mmToPx(dimensions.height) * zoom,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Draw grid
    drawGrid(canvas, dimensions, preferences.grid);

    // Set up canvas event handlers
    canvas.on('object:modified', (e: FabricEvent) => {
      const obj = e.target as CustomFabricObject;
      if (obj && obj.customData?.id) {
        const updates = handleObjectModified(obj);
        onObjectUpdate(obj.customData.id, updates);
      }
    });

    canvas.on('selection:created', (e: FabricEvent) => {
      const selected = e.selected as CustomFabricObject[];
      if (selected && selected.length > 0) {
        const firstSelected = selected[0];
        if (firstSelected.customData?.id) {
          onObjectSelect(firstSelected.customData.id);
        }
      }
    });

    canvas.on('selection:updated', (e: FabricEvent) => {
      const selected = e.selected as CustomFabricObject[];
      if (selected && selected.length > 0) {
        const firstSelected = selected[0];
        if (firstSelected.customData?.id) {
          onObjectSelect(firstSelected.customData.id);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      onObjectSelect(null);
    });

    // Add objects to canvas
    memoizedObjects.forEach((obj) => {
      addObjectToCanvas(obj, canvas);
    });

    // Notify parent that canvas is ready
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Set up object movement constraints
    canvas.on('object:moving', (e: FabricEvent) => {
      const obj = e.target as CustomFabricObject;
      if (!obj) return;

      let left = obj.left || 0;
      let top = obj.top || 0;

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
    });

    return () => {
      canvas.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions.width, dimensions.height, zoom, preferences.grid, onCanvasReady, addObjectToCanvas, memoizedObjects]);

  // Add wheel event listener separately to prevent multiple listeners
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Only handle wheel events if we're over the canvas area
      const containerElement = containerRef.current;
      if (!containerElement) return;
      
      const rect = containerElement.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      
      // Check if the event is within the canvas container
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        // Prevent default only when we're actually handling the zoom
        event.preventDefault();
        event.stopPropagation();
        
        if (onWheelZoom) {
          onWheelZoom(event);
        }
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      // Use passive: false to allow preventDefault, but handle it carefully
      containerElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [onWheelZoom]);

  // Update canvas size and sync objects
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    // Check if objects have actually changed
    const objectsChanged = memoizedObjects.length !== previousObjectsRef.current.length ||
      memoizedObjects.some((obj, index) => obj.id !== previousObjectsRef.current[index]?.id);
    previousObjectsRef.current = memoizedObjects;
    
    // Check if dimensions or zoom have changed
    const dimensionsChanged = dimensions.width !== previousDimensionsRef.current.width ||
      dimensions.height !== previousDimensionsRef.current.height;
    previousDimensionsRef.current = dimensions;
    
    const zoomChanged = zoom !== previousZoomRef.current;
    previousZoomRef.current = zoom;
    
    // Update canvas size
    const widthPx = mmToPx(dimensions.width) * zoom;
    const heightPx = mmToPx(dimensions.height) * zoom;

    canvas.setDimensions({
      width: widthPx,
      height: heightPx
    });

    canvas.setZoom(zoom);

    // Only clear and redraw if objects changed or dimensions/zoom changed
    if (objectsChanged || dimensionsChanged || zoomChanged) {
      // Clear all objects first to prevent ghost objects
      canvas.clear();
      
      // Draw grid after canvas size update
      drawGrid(canvas, dimensions, preferences.grid);

      // Add all objects fresh
      memoizedObjects.forEach((obj) => {
        addObjectToCanvas(obj, canvas);
      });

      // Handle selection after all objects are added
      if (selectedObjectId) {
        const targetObj = canvas.getObjects().find(
          o => (o as CustomFabricObject).customData?.id === selectedObjectId
        );
        if (targetObj) {
          canvas.setActiveObject(targetObj);
        }
      }

      canvas.renderAll();
    } else {
      // Just update grid and selection if objects didn't change
      drawGrid(canvas, dimensions, preferences.grid);
      
      if (selectedObjectId) {
        const targetObj = canvas.getObjects().find(
          o => (o as CustomFabricObject).customData?.id === selectedObjectId
        );
        if (targetObj) {
          canvas.setActiveObject(targetObj);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions.width, dimensions.height, zoom, memoizedObjects, selectedObjectId, preferences.grid.showGrid, preferences.grid.size, preferences.uuid.qrPrefix]);

  // Separate effect for grid updates
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    drawGrid(canvas, dimensions, preferences.grid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions.width, dimensions.height, preferences.grid.showGrid, preferences.grid.size, preferences.grid.color, preferences.grid.opacity, preferences.grid]);

  // Calculate ruler marks based on canvas size with better scaling for small labels
  const widthPx = mmToPx(dimensions.width) * zoom;
  const heightPx = mmToPx(dimensions.height) * zoom;
  
  // Simplified ruler step calculation - align with grid when possible
  let rulerStep;
  const gridSize = preferences.grid.size; // Grid size in mm
  
  // Try to align ruler with grid first
  if (zoom >= 0.5) {
    // At higher zoom levels, use grid size or its subdivisions
    if (gridSize <= 2) {
      rulerStep = gridSize; // Use grid size directly for small grids
    } else if (gridSize <= 5) {
      rulerStep = gridSize; // 5mm grid -> 5mm ruler steps
    } else {
      rulerStep = gridSize / 2; // For larger grids, use half steps
    }
  } else {
    // At lower zoom levels, use larger steps
    if (gridSize <= 5) {
      rulerStep = gridSize * 2; // Double the grid size
    } else {
      rulerStep = gridSize; // Use grid size
    }
  }
  
  // Ensure reasonable step sizes
  rulerStep = Math.max(0.5, Math.min(50, rulerStep));
  
  const rulerStepPx = mmToPx(rulerStep) * zoom;
  
  // Use preferences for ruler visibility instead of hardcoded logic
  const showRulers = preferences.ruler.showRulers && widthPx > 30 && heightPx > 30;
  const rulerSize = showRulers ? Math.max(16, Math.min(64, preferences.ruler.size)) : 0;
  
  // For very small labels, use minimalist mode
  const isMinimalistMode = widthPx < 100 || heightPx < 100;

  // Calculate automatic centering offset for the canvas
  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  
  // Account for container padding (2rem = 32px on each side)
  const containerPadding = 32; // 2rem = 32px
  const availableWidth = containerWidth - (containerPadding * 2);
  const availableHeight = containerHeight - (containerPadding * 2);
  
  // Auto-center the canvas in the available viewport space
  // We want the visual center of the canvas (not including rulers) to be centered
  const visualCenterOffsetX = showRulers ? rulerSize / 2 : 0;
  const visualCenterOffsetY = showRulers ? rulerSize / 2 : 0;
  
  const autoCenterX = Math.max(0, (availableWidth - widthPx) / 2 - visualCenterOffsetX);
  const autoCenterY = Math.max(0, (availableHeight - heightPx) / 2 - visualCenterOffsetY);
  
  // Combine auto-centering with manual pan adjustments
  const finalPanX = autoCenterX + panX;
  const finalPanY = autoCenterY + panY;

  const canvasStyle = {
    transform: `translate(${finalPanX}px, ${finalPanY}px)`,
    transformOrigin: '0 0',
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 p-8 canvas-container overflow-hidden relative"
    >
      {/* Main canvas area with rulers */}
      <div className="relative">
        {/* Top ruler - only show if canvas is large enough */}
        {showRulers && (
          <div 
            className="absolute top-0 flex items-end backdrop-blur-sm border border-gray-500/30 shadow-lg"
            style={{ 
              left: `${rulerSize}px`,
              width: `${widthPx}px`,
              height: `${rulerSize}px`,
              transform: `translate(${finalPanX}px, ${finalPanY - rulerSize}px)`,
              backgroundColor: preferences.ruler.backgroundColor,
              opacity: preferences.ruler.opacity,
              borderRadius: '0 0 0 2px',
            }}
          >
            {Array.from({ length: Math.ceil(dimensions.width / rulerStep) + 1 }, (_, i) => {
              const mmPosition = i * rulerStep;
              if (mmPosition > dimensions.width) return null;
              
              const shouldShowMajorMark = i % Math.max(1, Math.round(10 / rulerStep)) === 0;
              const shouldShowMinorMark = i % Math.max(1, Math.round(5 / rulerStep)) === 0;
              const shouldShowLabel = shouldShowMajorMark && rulerStepPx > 20;
              
              // Calculate actual pixel position on the ruler - relative to ruler container
              const pixelPosition = mmToPx(mmPosition) * zoom;
              
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center justify-end"
                  style={{ 
                    left: `${pixelPosition}px`,
                    width: '1px',
                    height: '100%'
                  }}
                >
                  <div 
                    className="bg-current"
                    style={{ 
                      width: '1px',
                      height: shouldShowMajorMark ? `${rulerSize * 0.4}px` : shouldShowMinorMark ? `${rulerSize * 0.25}px` : `${rulerSize * 0.15}px`,
                      color: preferences.ruler.color,
                    }}
                  />
                  {shouldShowLabel && (
                    <span 
                      className="absolute bottom-1 text-xs font-mono font-medium select-none whitespace-nowrap"
                      style={{ 
                        color: preferences.ruler.color,
                        fontSize: `${Math.max(9, Math.min(11, rulerSize * 0.4))}px`,
                        transform: 'translateX(-50%)',
                        left: '0px',
                      }}
                    >
                      {mmPosition % 1 === 0 ? mmPosition.toString() : mmPosition.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
            <div 
              className="absolute right-1 bottom-1 text-xs font-mono font-medium select-none"
              style={{ 
                color: preferences.ruler.color,
                fontSize: `${Math.max(8, Math.min(10, rulerSize * 0.35))}px`,
                opacity: 0.7,
              }}
            >
              mm
            </div>
          </div>
        )}

        {/* Left ruler - only show if canvas is large enough */}
        {showRulers && (
          <div 
            className="absolute top-0 left-0 flex flex-col justify-start backdrop-blur-sm border border-gray-500/30 shadow-lg"
            style={{ 
              width: `${rulerSize}px`,
              height: `${heightPx}px`,
              transform: `translate(${finalPanX - rulerSize}px, ${finalPanY}px)`,
              backgroundColor: preferences.ruler.backgroundColor,
              opacity: preferences.ruler.opacity,
              borderRadius: '0 0 2px 0',
            }}
          >
            {Array.from({ length: Math.ceil(dimensions.height / rulerStep) + 1 }, (_, i) => {
              const mmPosition = i * rulerStep;
              if (mmPosition > dimensions.height) return null;
              
              const shouldShowMajorMark = i % Math.max(1, Math.round(10 / rulerStep)) === 0;
              const shouldShowMinorMark = i % Math.max(1, Math.round(5 / rulerStep)) === 0;
              const shouldShowLabel = shouldShowMajorMark && rulerStepPx > 20;
              
              // Calculate actual pixel position on the ruler
              const pixelPosition = mmToPx(mmPosition) * zoom;
              
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-end"
                  style={{ 
                    top: `${pixelPosition}px`,
                    width: '100%',
                    height: '1px'
                  }}
                >
                  <div 
                    className="bg-current"
                    style={{ 
                      height: '1px',
                      width: shouldShowMajorMark ? `${rulerSize * 0.4}px` : shouldShowMinorMark ? `${rulerSize * 0.25}px` : `${rulerSize * 0.15}px`,
                      color: preferences.ruler.color,
                    }}
                  />
                  {shouldShowLabel && (
                    <span 
                      className="absolute right-1 text-xs font-mono font-medium select-none whitespace-nowrap"
                      style={{ 
                        color: preferences.ruler.color,
                        fontSize: `${Math.max(9, Math.min(11, rulerSize * 0.4))}px`,
                        transform: 'rotate(-90deg) translateX(50%)',
                        transformOrigin: 'center center',
                        top: '0px',
                      }}
                    >
                      {mmPosition % 1 === 0 ? mmPosition.toString() : mmPosition.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
            <div 
              className="absolute bottom-1 right-1 text-xs font-mono font-medium select-none"
              style={{ 
                color: preferences.ruler.color,
                fontSize: `${Math.max(8, Math.min(10, rulerSize * 0.35))}px`,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center center',
                opacity: 0.7,
              }}
            >
              mm
            </div>
          </div>
        )}

        {/* Corner piece - only show if rulers are visible */}
        {showRulers && (
          <div 
            className="absolute top-0 left-0 backdrop-blur-sm border border-gray-500/30 shadow-lg flex items-center justify-center"
            style={{ 
              width: `${rulerSize}px`,
              height: `${rulerSize}px`,
              transform: `translate(${finalPanX - rulerSize}px, ${finalPanY - rulerSize}px)`,
              backgroundColor: preferences.ruler.backgroundColor,
              opacity: preferences.ruler.opacity,
              borderRadius: '2px 0 0 0',
            }}
          >
            <div 
              className="rounded-full"
              style={{
                width: `${Math.max(2, rulerSize * 0.15)}px`,
                height: `${Math.max(2, rulerSize * 0.15)}px`,
                backgroundColor: preferences.ruler.color,
                opacity: 0.6,
              }}
            />
          </div>
        )}
        
        {/* Canvas with elegant frame */}
        <div 
          className={`relative bg-white shadow-2xl ${isMinimalistMode ? 'ring-2 ring-blue-500/30' : ''}`}
          style={{
            transform: `translate(${finalPanX}px, ${finalPanY}px)`,
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            border: isMinimalistMode ? '2px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: Math.min(8, Math.max(2, zoom * 4)) + 'px',
            minWidth: '40px',
            minHeight: '40px'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              ...canvasStyle,
              transform: 'none', // Reset transform since parent handles it
              border: 'none',
              borderRadius: Math.min(8, Math.max(2, zoom * 4)) + 'px'
            }}
            className="block"
          />
          
          {/* Minimalist mode indicator for very small labels */}
          {isMinimalistMode && (
            <div 
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-mono whitespace-nowrap"
              style={{
                transform: `translate(${finalPanX + widthPx/2 - 50}px, ${finalPanY - 32}px)`
              }}
            >
              {dimensions.width} × {dimensions.height} mm
            </div>
          )}
        </div>
        
        {/* Canvas info overlay - moved to bottom right, hidden in minimalist mode */}
        {!isMinimalistMode && (
          <div 
            className="absolute bottom-0 right-0 text-xs text-gray-300 bg-gray-900/80 px-3 py-1.5 rounded-tl-lg border-l border-t border-gray-600/50 backdrop-blur-sm font-mono"
            style={{ 
              transform: `translate(${finalPanX + widthPx}px, ${finalPanY + heightPx}px)`
            }}
          >
            <div className="flex items-center gap-2">
              <span>{dimensions.width} × {dimensions.height} mm</span>
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
