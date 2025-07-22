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
    toast.info('View reset to 100%');
  }, [updateZoom]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(ZOOM.MAX, zoom + ZOOM.STEP);
    updateZoom(newZoom);
  }, [updateZoom, zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(ZOOM.MIN, zoom - ZOOM.STEP);
    updateZoom(newZoom);
  }, [updateZoom, zoom]);

  return {
    handleResetView,
    handleZoomIn,
    handleZoomOut
  };
}; 