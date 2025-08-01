import { FabricImage } from 'fabric';
import { CanvasObject } from '../../types/editor.types';
import { mmToPx, pxToMm } from '../../utils/dimensions';
import QRCode from 'qrcode';

export interface CustomFabricObject extends FabricImage {
  customData?: { id: string };
  _isUpdating?: boolean;
  _isReplacingQR?: boolean;
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
      selectable: true,
      hasControls: true,
      hasBorders: true,
      // Remove lockUniScaling to allow free resizing
    });
    (img as CustomFabricObject).customData = { id: obj.id };
    (img as CustomFabricObject)._lastQRData = qrData;
    onCreated(img as CustomFabricObject);
  }
};

export const updateQRCodeObject = async (
  fabricObj: CustomFabricObject,
  obj: CanvasObject,
  qrPrefix: string,
  onUpdated: (fabricObj: CustomFabricObject) => void
): Promise<void> => {
  // Don't update if object is being modified or is active
  if (fabricObj._isUpdating || fabricObj.canvas?.getActiveObject() === fabricObj) return;
  
  const currentQRData = `${qrPrefix}${obj.sharedUUID || ''}`;
  const targetSizePx = mmToPx(obj.width || 20);
  
  const currentDisplaySize = Math.max(
    (fabricObj.width || 0) * Math.abs(fabricObj.scaleX || 1),
    (fabricObj.height || 0) * Math.abs(fabricObj.scaleY || 1)
  );
  
  const needsRegeneration = (
    Math.abs(currentDisplaySize - targetSizePx) > 1 ||
    fabricObj._lastQRData !== currentQRData
  );
  
  if (needsRegeneration && !fabricObj._isReplacingQR) {
    fabricObj._isReplacingQR = true;
    
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
        selectable: true,
        hasControls: true,
        hasBorders: true,
        // Remove lockUniScaling to allow free resizing
      });
      (newImg as CustomFabricObject).customData = { id: obj.id };
      (newImg as CustomFabricObject)._lastQRData = currentQRData;
      onUpdated(newImg as CustomFabricObject);
    } else {
      fabricObj._isReplacingQR = false;
    }
  } else {
    // Update position and scale based on saved dimensions
    fabricObj.set({
      left: mmToPx(obj.x),
      top: mmToPx(obj.y),
    });
    
    // Calculate and set scaleX/scaleY based on saved width/height
    if (obj.width && obj.height && fabricObj.width && fabricObj.height) {
      const targetWidthPx = mmToPx(obj.width);
      const targetHeightPx = mmToPx(obj.height);
      
      const scaleX = targetWidthPx / fabricObj.width;
      const scaleY = targetHeightPx / fabricObj.height;
      
      fabricObj.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
    }
  }
};

export const handleQRCodeModified = (
  fabricObj: CustomFabricObject
): Partial<CanvasObject> => {
  // Mark object as updating to prevent updateQRCodeObject from interfering
  fabricObj._isUpdating = true;
  
  // Calculate new dimensions from current scale and original QR size
  const originalSize = fabricObj.width || 0;
  const newSizePx = originalSize * (fabricObj.scaleX || 1);
  
  const updates: Partial<CanvasObject> = {
    x: pxToMm(fabricObj.left || 0),
    y: pxToMm(fabricObj.top || 0),
    width: pxToMm(newSizePx),
    height: pxToMm(newSizePx), // Keep it square
  };
  
  // Let Fabric.js handle scaling naturally - don't reset scale
  // This should work like other objects that resize properly
  
  // Clear updating flag after a brief delay
  setTimeout(() => {
    fabricObj._isUpdating = false;
  }, 200);
  
  return updates;
}; 