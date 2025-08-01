import { FabricImage } from 'fabric';
import { CanvasObject } from '../../types/editor.types';
import { mmToPx, pxToMm } from '../../utils/dimensions';

export interface CustomFabricObject extends FabricImage {
  customData?: { id: string };
  _isUpdating?: boolean;
}

export const createImageObject = async (
  obj: CanvasObject,
  onCreated: (fabricObj: CustomFabricObject) => void
): Promise<void> => {
  if (!obj.imageUrl) return;

  try {
    const img = await FabricImage.fromURL(obj.imageUrl, { crossOrigin: 'anonymous' });
    
    // Set initial position and disable aspect ratio preservation
    img.set({
      left: mmToPx(obj.x),
      top: mmToPx(obj.y),
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockUniScaling: false, // Allow free scaling in any direction
      lockScalingFlip: false, // Allow flipping
    });

    // If we have target dimensions, stretch the image to fill the entire box
    if (obj.width && obj.height) {
      const targetWidthPx = mmToPx(obj.width);
      const targetHeightPx = mmToPx(obj.height);
      
      // Calculate scale factors to stretch image to fill the entire box
      const originalWidth = img.width || 1;
      const originalHeight = img.height || 1;
      
      const scaleX = targetWidthPx / originalWidth;
      const scaleY = targetHeightPx / originalHeight;
      
      // Set the image to stretch and fill the entire bounding box
      img.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
    }

    (img as CustomFabricObject).customData = { id: obj.id };
    onCreated(img as CustomFabricObject);
  } catch (error) {
    console.error('Failed to load image:', error);
  }
};

export const updateImageObject = (
  fabricObj: CustomFabricObject, 
  obj: CanvasObject
): void => {
  // Update position
  fabricObj.set({
    left: mmToPx(obj.x),
    top: mmToPx(obj.y),
  });
  
  // If we have target dimensions, stretch the image to fill the entire box
  if (obj.width && obj.height) {
    const targetWidthPx = mmToPx(obj.width);
    const targetHeightPx = mmToPx(obj.height);
    
    // Calculate scale factors to stretch image to fill the entire box
    const originalWidth = fabricObj.width || 1;
    const originalHeight = fabricObj.height || 1;
    
    const scaleX = targetWidthPx / originalWidth;
    const scaleY = targetHeightPx / originalHeight;
    
    // Set the image to stretch and fill the entire bounding box
    fabricObj.set({
      scaleX: scaleX,
      scaleY: scaleY,
    });
  }
};

export const handleImageModified = (
  fabricObj: CustomFabricObject
): Partial<CanvasObject> => {
  // Calculate new dimensions from current scale and original image size
  const originalWidth = fabricObj.width || 0;
  const originalHeight = fabricObj.height || 0;
  
  const newWidthPx = originalWidth * (fabricObj.scaleX || 1);
  const newHeightPx = originalHeight * (fabricObj.scaleY || 1);
  
  const updates: Partial<CanvasObject> = {
    x: pxToMm(fabricObj.left || 0),
    y: pxToMm(fabricObj.top || 0),
    width: pxToMm(newWidthPx),
    height: pxToMm(newHeightPx),
  };
  
  // DON'T reset scaleX/scaleY - keep the stretched scaling!
  
  return updates;
}; 