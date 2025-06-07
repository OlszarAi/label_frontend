export interface LabelDimensions {
  width: number;  // in mm
  height: number; // in mm
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line';
  x: number;      // position in mm
  y: number;      // position in mm
  width?: number; // in mm
  height?: number; // in mm
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface EditorState {
  dimensions: LabelDimensions;
  zoom: number;
  panX: number;
  panY: number;
  objects: CanvasObject[];
  selectedObjectId: string | null;
}
