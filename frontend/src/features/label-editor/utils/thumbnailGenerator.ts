import { Canvas, FabricObject } from 'fabric';

export const generateThumbnailFromFabric = async (
  fabricData: any,
  width: number = 200,
  height?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Calculate height maintaining aspect ratio
      const originalWidth = fabricData.width || 100;
      const originalHeight = fabricData.height || 50;
      const aspectRatio = originalHeight / originalWidth;
      const thumbnailHeight = height || width * aspectRatio;

      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = thumbnailHeight;

      // Create fabric canvas
      const fabricCanvas = new Canvas(tempCanvas);
      
      // Set background
      if (fabricData.background) {
        fabricCanvas.backgroundColor = fabricData.background;
      }

      // Load the fabric data
      fabricCanvas.loadFromJSON(fabricData, () => {
        // Scale the canvas to thumbnail size
        const scaleX = width / originalWidth;
        const scaleY = thumbnailHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY);

        // Scale all objects
        fabricCanvas.getObjects().forEach((obj: any) => {
          obj.scaleX = (obj.scaleX || 1) * scale;
          obj.scaleY = (obj.scaleY || 1) * scale;
          obj.left = (obj.left || 0) * scale;
          obj.top = (obj.top || 0) * scale;
        });

        // Render the canvas
        fabricCanvas.renderAll();

        // Convert to data URL
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 0.8,
          multiplier: 1
        });

        // Clean up
        fabricCanvas.dispose();
        
        resolve(dataURL);
      });

    } catch (error) {
      console.error('Error generating thumbnail:', error);
      reject(error);
    }
  });
};

export const generateThumbnailFromCanvas = async (canvas: Canvas, width: number = 200): Promise<string> => {
  try {
    // Validate canvas
    if (!canvas) {
      console.error('No canvas provided to generateThumbnailFromCanvas');
      return '';
    }

    // Get current canvas dimensions
    const originalWidth = canvas.width || 100;
    const originalHeight = canvas.height || 50;

    // Use the simpler approach - just scale the entire canvas
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: width / originalWidth, // This will scale the entire canvas
      left: 0,
      top: 0,
      width: originalWidth,
      height: originalHeight
    });

    return dataURL;

  } catch (error) {
    console.error('Error generating thumbnail from canvas:', error);
    return '';
  }
};
