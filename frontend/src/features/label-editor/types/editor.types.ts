import * as fabric from 'fabric';

export interface EditorState {
  zoom: number;
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  selectedTool: EditorTool;
}

export enum EditorTool {
  SELECT = 'select',
  TEXT = 'text',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface EditorConfig {
  canvasSize: CanvasSize;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  backgroundColor: string;
}

export interface ToolbarButton {
  id: EditorTool;
  label: string;
  icon: string;
  isActive?: boolean;
}
