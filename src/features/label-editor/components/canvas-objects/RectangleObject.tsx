import { Rect } from 'fabric';
import { CanvasObject } from '../../types/editor.types';
import { mmToPx } from '../../utils/dimensions';

export interface CustomFabricObject extends Rect {
  customData?: { id: string };
  _isUpdating?: boolean;
}

export const createRectangleObject = (obj: CanvasObject): CustomFabricObject => {
  return new Rect({
    left: mmToPx(obj.x),
    top: mmToPx(obj.y),
    width: mmToPx(obj.width || 20),
    height: mmToPx(obj.height || 10),
    fill: obj.fill || 'transparent',
    stroke: obj.stroke || '#000000',
    strokeWidth: obj.strokeWidth || 1,
    selectable: true,
    hasControls: true,
    hasBorders: true,
  }) as CustomFabricObject;
};

export const updateRectangleObject = (
  fabricObj: CustomFabricObject, 
  obj: CanvasObject
): void => {
  fabricObj.set({
    left: mmToPx(obj.x),
    top: mmToPx(obj.y),
    width: mmToPx(obj.width || 20),
    height: mmToPx(obj.height || 10),
    fill: obj.fill || 'transparent',
    stroke: obj.stroke || '#000000',
    strokeWidth: obj.strokeWidth || 1,
  });
};

export const handleRectangleModified = (
  fabricObj: CustomFabricObject,
  obj: CanvasObject
): Partial<CanvasObject> => {
  // Handle width/height scaling normally - EXACTLY like working rectangle
  const newWidth = fabricObj.width ? fabricObj.width * (fabricObj.scaleX || 1) : 0;
  const newHeight = fabricObj.height ? fabricObj.height * (fabricObj.scaleY || 1) : 0;
  
  const updates: Partial<CanvasObject> = {
    x: obj.x,
    y: obj.y,
  };
  
  if (newWidth > 0) updates.width = obj.width;
  if (newHeight > 0) updates.height = obj.height;
  
  // Reset scale to prevent compound scaling - EXACTLY like working rectangle
  fabricObj.set({ scaleX: 1, scaleY: 1 });
  if (fabricObj.width && newWidth > 0) fabricObj.set({ width: newWidth });
  if (fabricObj.height && newHeight > 0) fabricObj.set({ height: newHeight });
  
  return updates;
}; 