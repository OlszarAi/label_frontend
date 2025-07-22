// Grid utility functions

/**
 * Snaps a coordinate to the grid if snap-to-grid is enabled
 */
export const snapToGrid = (value: number, gridSize: number, enabled: boolean): number => {
  if (!enabled || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snaps x,y coordinates to grid
 */
export const snapCoordinatesToGrid = (
  x: number, 
  y: number, 
  gridSize: number, 
  enabled: boolean
): { x: number; y: number } => {
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled)
  };
};
