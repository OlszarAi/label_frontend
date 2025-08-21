import { FabricImage } from 'fabric';
import { CanvasObject } from '../../types/editor.types';
import { mmToPx, pxToMm } from '../../utils/dimensions';
import QRCode from 'qrcode';

export interface CustomFabricObject extends FabricImage {
  customData?: { id: string };
  _isUpdating?: boolean;
  _isReplacingQR?: boolean;
  _lastQRData?: string;
  _wasManuallyResized?: boolean;
  _lastSavedScale?: { scaleX: number; scaleY: number };
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

export const createQRCodeObject = async (
  obj: CanvasObject,
  qrPrefix: string,
  onCreated: (fabricObj: CustomFabricObject) => void
): Promise<void> => {
  const qrData = `${qrPrefix}${obj.sharedUUID || ''}`;
  const qrSize = mmToPx(obj.width || 20);
  
  const dataURL = await createQRCodeDataURL(
    qrData,
    qrSize,
    obj.qrErrorCorrectionLevel || 'M',
    obj.fill || '#000000',
    obj.stroke || '#ffffff'
  );
  
  if (dataURL) {
    const img = await FabricImage.fromURL(dataURL, { crossOrigin: 'anonymous' });
    img.set({
      left: mmToPx(obj.x),
      top: mmToPx(obj.y),
      scaleX: 1,
      scaleY: 1,
      angle: obj.angle || 0, // Set rotation angle
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockUniScaling: false,
      lockScalingFlip: false,
    });
    (img as CustomFabricObject).customData = { id: obj.id };
    (img as CustomFabricObject)._lastQRData = qrData;
    (img as CustomFabricObject)._wasManuallyResized = false;
    (img as CustomFabricObject)._lastSavedScale = { scaleX: 1, scaleY: 1 };
    onCreated(img as CustomFabricObject);
  }
};

export const updateQRCodeObject = async (
  fabricObj: CustomFabricObject,
  obj: CanvasObject,
  qrPrefix: string,
  onUpdated: (fabricObj: CustomFabricObject) => void,
  forceUpdate: boolean = false
): Promise<void> => {
  // Don't update if object is being modified, is active, or is already being replaced (unless forced)
  if (!forceUpdate && (fabricObj._isUpdating || fabricObj._isReplacingQR || fabricObj.canvas?.getActiveObject() === fabricObj)) return;
  
  const currentQRData = `${qrPrefix}${obj.sharedUUID || ''}`;
  const targetSizePx = mmToPx(obj.width || 20);
  
  const currentDisplaySize = Math.max(
    (fabricObj.width || 0) * Math.abs(fabricObj.scaleX || 1),
    (fabricObj.height || 0) * Math.abs(fabricObj.scaleY || 1)
  );
  
  const needsRegeneration = (
    Math.abs(currentDisplaySize - targetSizePx) > 5 || // Increased threshold to reduce sensitivity
    fabricObj._lastQRData !== currentQRData
  );
  
  if (needsRegeneration) {
    fabricObj._isReplacingQR = true;
    
    try {
      const dataURL = await createQRCodeDataURL(
        currentQRData,
        targetSizePx,
        obj.qrErrorCorrectionLevel || 'M',
        obj.fill || '#000000',
        obj.stroke || '#ffffff'
      );
      
      if (dataURL && fabricObj._isReplacingQR) {
        const newImg = await FabricImage.fromURL(dataURL, { crossOrigin: 'anonymous' });
        newImg.set({
          left: mmToPx(obj.x),
          top: mmToPx(obj.y),
          scaleX: 1,
          scaleY: 1,
          angle: obj.angle || 0, // Preserve rotation angle
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
          lockScalingFlip: false,
        });
        (newImg as CustomFabricObject).customData = { id: obj.id };
        (newImg as CustomFabricObject)._lastQRData = currentQRData;
        (newImg as CustomFabricObject)._wasManuallyResized = fabricObj._wasManuallyResized || false;
        (newImg as CustomFabricObject)._lastSavedScale = fabricObj._lastSavedScale || { scaleX: 1, scaleY: 1 };
        
        // Preserve angle from original object
        if (fabricObj.angle) {
          newImg.set({ angle: fabricObj.angle });
        }
        
        // Add a small delay to prevent rapid fire updates
        setTimeout(() => {
          onUpdated(newImg as CustomFabricObject);
        }, 50);
      }
    } catch (error) {
      console.error('Failed to update QR code:', error);
    } finally {
      // Clear the flag after a delay to prevent immediate retriggering
      setTimeout(() => {
        fabricObj._isReplacingQR = false;
      }, 200);
    }
  } else {
    // Update position
    fabricObj.set({
      left: mmToPx(obj.x),
      top: mmToPx(obj.y),
      angle: obj.angle || 0, // Set rotation angle
    });
    
    // Only update scale if object wasn't manually resized, or if we have saved scale values
    if (!fabricObj._wasManuallyResized && obj.width && obj.height && fabricObj.width && fabricObj.height) {
      const targetWidthPx = mmToPx(obj.width);
      const targetHeightPx = mmToPx(obj.height);
      
      const scaleX = targetWidthPx / fabricObj.width;
      const scaleY = targetHeightPx / fabricObj.height;
      
      fabricObj.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
      
      // Save the scale for future reference
      fabricObj._lastSavedScale = { scaleX, scaleY };
    } else if (fabricObj._wasManuallyResized && fabricObj._lastSavedScale) {
      // If manually resized, preserve the user's scale
      fabricObj.set({
        scaleX: fabricObj._lastSavedScale.scaleX,
        scaleY: fabricObj._lastSavedScale.scaleY,
      });
    }
  }
};

export const handleQRCodeModified = (
  fabricObj: CustomFabricObject
): Partial<CanvasObject> => {
  // Mark object as updating to prevent updateQRCodeObject from interfering
  fabricObj._isUpdating = true;
  
  // Mark as manually resized to preserve user's changes
  fabricObj._wasManuallyResized = true;
  
  // Save current scale
  fabricObj._lastSavedScale = {
    scaleX: fabricObj.scaleX || 1,
    scaleY: fabricObj.scaleY || 1,
  };
  
  // Calculate new dimensions from current scale and original QR size
  const originalSize = fabricObj.width || 0;
  const newSizePx = originalSize * (fabricObj.scaleX || 1);
  
  const updates: Partial<CanvasObject> = {
    x: pxToMm(fabricObj.left || 0),
    y: pxToMm(fabricObj.top || 0),
    width: pxToMm(newSizePx),
    height: pxToMm(newSizePx), // Keep it square
    angle: fabricObj.angle || 0, // Save rotation angle
  };
  
  // Clear updating flag after a brief delay
  setTimeout(() => {
    fabricObj._isUpdating = false;
  }, 200);
  
  return updates;
}; 