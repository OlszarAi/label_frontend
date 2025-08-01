export interface LabelDimensions {
  width: number;  // in mm
  height: number; // in mm
}

export interface UUIDPreferences {
  uuidLength: number;
  qrPrefix: string; // Prefix used in QR code (e.g., "https://example.com/")
}

export interface GridPreferences {
  size: number; // Grid size in mm
  snapToGrid: boolean;
  showGrid: boolean; // Whether to visually show the grid
  color: string;
  opacity: number; // 0 to 1
}

export interface RulerPreferences {
  showRulers: boolean; // Whether to visually show the rulers
  color: string;
  backgroundColor: string;
  opacity: number; // 0 to 1
  size: number; // Ruler size in pixels (adaptive)
}

export interface EditorPreferences {
  uuid: UUIDPreferences;
  grid: GridPreferences;
  ruler: RulerPreferences;
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line' | 'qrcode' | 'uuid' | 'image';
  x: number;      // position in mm
  y: number;      // position in mm
  width?: number; // in mm
  height?: number; // in mm
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  underline?: boolean;
  linethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  charSpacing?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // QR Code specific properties
  qrErrorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  // Shared UUID for both QR and UUID objects
  sharedUUID?: string;
  // Image specific properties
  imageUrl?: string;
  imageAssetId?: string;
  imageOriginalWidth?: number;
  imageOriginalHeight?: number;
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

export interface UserAsset {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface AssetUploadProgress {
  file: File;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  asset?: UserAsset;
}
