// Clipboard utility for copy/paste functionality
import { CanvasObject } from '../types/editor.types';

let clipboard: CanvasObject | null = null;

export const copyObject = (object: CanvasObject): void => {
  clipboard = { ...object };
};

export const pasteObject = (): CanvasObject | null => {
  if (!clipboard) return null;
  
  // Create a new object with offset position
  return {
    ...clipboard,
    id: crypto.randomUUID(),
    x: clipboard.x + 5, // Offset by 5mm
    y: clipboard.y + 5,
  };
};

export const hasClipboard = (): boolean => {
  return clipboard !== null;
};

export const clearClipboard = (): void => {
  clipboard = null;
};
