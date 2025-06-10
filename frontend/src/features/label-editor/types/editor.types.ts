export interface LabelDimensions {
  width: number;  // in mm
  height: number; // in mm
}

export interface UUIDPreferences {
  uuidLength: number;
  qrPrefix: string; // Prefix used in QR code (e.g., "https://example.com/")
}

export interface EditorPreferences {
  uuid: UUIDPreferences;
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line' | 'qrcode' | 'uuid';
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
  // QR Code specific properties
  qrErrorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  // Shared UUID for both QR and UUID objects
  sharedUUID?: string;
}

export interface EditorState {
  dimensions: LabelDimensions;
  zoom: number;
  panX: number;
  panY: number;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  preferences: EditorPreferences;
}
