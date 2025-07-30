import { useCallback } from 'react';
import { toast } from 'sonner';
import { ZOOM } from '../constants';

interface UseZoomControlsProps {
  zoom: number;
  updateZoom: (zoom: number) => void;
}

export const useZoomControls = ({ zoom, updateZoom }: UseZoomControlsProps) => {
  const handleResetView = useCallback(() => {
    updateZoom(ZOOM.DEFAULT);
    toast.info('View reset to 100%. Tip: Use Ctrl+Scroll to zoom');
  }, [updateZoom]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(ZOOM.MAX, zoom + ZOOM.STEP);
    updateZoom(newZoom);
  }, [updateZoom, zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(ZOOM.MIN, zoom - ZOOM.STEP);
    updateZoom(newZoom);
  }, [updateZoom, zoom]);

  const handleWheelZoom = useCallback((event: WheelEvent) => {
    // Prevent default scroll behavior
    event.preventDefault();
    event.stopPropagation();

    console.log('Wheel zoom triggered:', { deltaY: event.deltaY, currentZoom: zoom });

    // Use step-based zoom changes (10% increments)
    // Negative deltaY means scrolling up (zoom in)
    // Positive deltaY means scrolling down (zoom out)
    let newZoom;
    if (event.deltaY < 0) {
      // Zoom in
      newZoom = Math.min(ZOOM.MAX, zoom + ZOOM.STEP);
    } else {
      // Zoom out
      newZoom = Math.max(ZOOM.MIN, zoom - ZOOM.STEP);
    }
    
    console.log('Zoom change:', { oldZoom: zoom, newZoom, direction: event.deltaY < 0 ? 'in' : 'out' });
    
    // Only update if there's a meaningful change
    if (Math.abs(newZoom - zoom) > 0.01) {
      updateZoom(newZoom);
    }
  }, [updateZoom, zoom]);

  return {
    handleResetView,
    handleZoomIn,
    handleZoomOut,
    handleWheelZoom
  };
}; 