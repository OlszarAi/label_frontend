// Conversion utilities between mm and pixels
export const PIXELS_PER_MM = 3.779527559; // 96 DPI conversion

export const mmToPx = (mm: number): number => {
  return mm * PIXELS_PER_MM;
};

export const pxToMm = (px: number): number => {
  return px / PIXELS_PER_MM;
};

export const formatMm = (mm: number): string => {
  return `${mm.toFixed(1)}mm`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
