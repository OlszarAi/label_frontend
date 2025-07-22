import { Canvas } from 'fabric';

export const generateThumbnailFromFabric = async (
  fabricData: Record<string, unknown>,
  width: number = 300,
  height?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Calculate height maintaining aspect ratio
      const originalWidth = (fabricData.width as number) || 100;
      const originalHeight = (fabricData.height as number) || 50;
      const aspectRatio = originalHeight / originalWidth;
      
      // Smart thumbnail sizing - ensure good quality while maintaining aspect ratio
      let thumbnailWidth = width;
      let thumbnailHeight = height || width * aspectRatio;
      
      // Ensure minimum quality - don't go below 200px on the largest dimension
      const maxDimension = Math.max(thumbnailWidth, thumbnailHeight);
      if (maxDimension < 200) {
        const scale = 200 / maxDimension;
        thumbnailWidth *= scale;
        thumbnailHeight *= scale;
      }
      
      // Ensure maximum size to prevent memory issues
      const MAX_SIZE = 800;
      if (maxDimension > MAX_SIZE) {
        const scale = MAX_SIZE / maxDimension;
        thumbnailWidth *= scale;
        thumbnailHeight *= scale;
      }

      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = thumbnailWidth;
      tempCanvas.height = thumbnailHeight;

      // Create fabric canvas
      const fabricCanvas = new Canvas(tempCanvas, {
        backgroundColor: (fabricData.background as string) || '#ffffff',
        preserveObjectStacking: true,
        enableRetinaScaling: true,
      });

      // Load the fabric data
      fabricCanvas.loadFromJSON(fabricData, () => {
        try {
          // Scale the canvas content to thumbnail size
          const scaleX = thumbnailWidth / originalWidth;
          const scaleY = thumbnailHeight / originalHeight;
          const scale = Math.min(scaleX, scaleY);

          // Center the content if aspect ratios don't match
          const scaledWidth = originalWidth * scale;
          const scaledHeight = originalHeight * scale;
          const offsetX = (thumbnailWidth - scaledWidth) / 2;
          const offsetY = (thumbnailHeight - scaledHeight) / 2;

          // Scale and position all objects
          fabricCanvas.getObjects().forEach((obj) => {
            if (obj.type === 'image') {
              // Handle images specially to maintain quality
              obj.set({
                scaleX: (obj.scaleX || 1) * scale,
                scaleY: (obj.scaleY || 1) * scale,
                left: ((obj.left || 0) * scale) + offsetX,
                top: ((obj.top || 0) * scale) + offsetY,
              });
            } else {
              obj.set({
                scaleX: (obj.scaleX || 1) * scale,
                scaleY: (obj.scaleY || 1) * scale,
                left: ((obj.left || 0) * scale) + offsetX,
                top: ((obj.top || 0) * scale) + offsetY,
              });
            }
            obj.setCoords();
          });

          // Render with high quality
          fabricCanvas.renderAll();

          // Convert to data URL with high quality
          const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 0.9,
            multiplier: 1,
          });

          // Clean up
          fabricCanvas.dispose();
          
          resolve(dataURL);
        } catch (renderError) {
          console.error('Error rendering thumbnail:', renderError);
          fabricCanvas.dispose();
          reject(renderError);
        }
      });

    } catch (error) {
      console.error('Error generating thumbnail:', error);
      reject(error);
    }
  });
};

export const generateThumbnailFromCanvas = async (
  canvas: Canvas, 
  maxWidth: number = 300,
  quality: number = 0.9
): Promise<string> => {
  try {
    // Validate canvas
    if (!canvas) {
      console.error('No canvas provided to generateThumbnailFromCanvas');
      return '';
    }

    // Get current canvas dimensions
    const originalWidth = canvas.width || 100;
    const originalHeight = canvas.height || 50;
    
    // Calculate aspect ratio
    const aspectRatio = originalHeight / originalWidth;
    
    // Calculate thumbnail dimensions
    let thumbnailWidth = maxWidth;
    let thumbnailHeight = maxWidth * aspectRatio;
    
    // Ensure minimum quality
    const maxDimension = Math.max(thumbnailWidth, thumbnailHeight);
    if (maxDimension < 200) {
      const scale = 200 / maxDimension;
      thumbnailWidth *= scale;
      thumbnailHeight *= scale;
    }
    
    // Calculate multiplier for high-quality thumbnail
    const multiplier = Math.min(thumbnailWidth / originalWidth, 2); // Max 2x for quality

    // Generate high-quality thumbnail
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: quality,
      multiplier: multiplier,
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

// New function for batch thumbnail generation (for performance)
export const generateThumbnailBatch = async (
  canvasDataList: Record<string, unknown>[],
  maxWidth: number = 300
): Promise<string[]> => {
  const results: string[] = [];
  
  // Process in batches to avoid blocking the UI
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < canvasDataList.length; i += BATCH_SIZE) {
    const batch = canvasDataList.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(canvasData => 
      generateThumbnailFromFabric(canvasData, maxWidth)
        .catch(error => {
          console.warn('Failed to generate thumbnail in batch:', error);
          return ''; // Return empty string for failed thumbnails
        })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to keep UI responsive
    if (i + BATCH_SIZE < canvasDataList.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return results;
};
