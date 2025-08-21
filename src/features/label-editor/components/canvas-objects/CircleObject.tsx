import { Circle } from 'fabric';
import { CanvasObject } from '../../types/editor.types';
import { mmToPx, pxToMm } from '../../utils/dimensions';

export interface CustomFabricObject extends Circle {
  customData?: { id: string };
  _isUpdating?: boolean;
}

export const createCircleObject = (obj: CanvasObject): CustomFabricObject => {
  const circle = new Circle({
    left: mmToPx(obj.x),
    top: mmToPx(obj.y),
    radius: mmToPx(obj.width || 20) / 2, // Use width as diameter
    fill: obj.fill || '#000000',
    stroke: obj.stroke || '#000000',
    strokeWidth: obj.strokeWidth || 1,
    angle: obj.angle || 0, // Set rotation angle
    selectable: true,
    hasControls: true,
    hasBorders: true,
  });

  return circle as CustomFabricObject;
};

export const updateCircleObject = (
  fabricObj: CustomFabricObject,
  obj: CanvasObject
): void => {
  fabricObj.set({
    left: mmToPx(obj.x),
    top: mmToPx(obj.y),
    radius: mmToPx(obj.width || 20) / 2,
    fill: obj.fill || '#000000',
    stroke: obj.stroke || '#000000',
    strokeWidth: obj.strokeWidth || 1,
    angle: obj.angle || 0, // Set rotation angle
  });
};

export const handleCircleModified = (
  fabricObj: CustomFabricObject
): Partial<CanvasObject> => {
  const newRadius = fabricObj.radius ? fabricObj.radius * (fabricObj.scaleX || 1) : 0;
  const newDiameter = newRadius * 2;
  
  const updates: Partial<CanvasObject> = {
    x: pxToMm(fabricObj.left || 0),
    y: pxToMm(fabricObj.top || 0),
    width: pxToMm(newDiameter),
    height: pxToMm(newDiameter), // Keep it circular
    angle: fabricObj.angle || 0, // Save rotation angle
  };
  
  // Reset scale to prevent compound scaling
  fabricObj.set({ scaleX: 1, scaleY: 1 });
  if (fabricObj.radius && newRadius > 0) fabricObj.set({ radius: newRadius });
  
  return updates;
}; 