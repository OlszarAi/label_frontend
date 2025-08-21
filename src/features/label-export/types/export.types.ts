// Types dla systemu eksportu etykiet

export interface FabricObject {
  type: string;
  text?: string;
  qrData?: string;
  sharedUUID?: string;
  data?: string;
  [key: string]: unknown;
}

export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'svg'; // Na razie tylko PDF, reszta coming soon

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // 0.1 - 1.0 dla jpg/png
  includeBackground?: boolean;
  scale?: number; // Skala eksportu
}

export interface PDFExportOptions extends ExportOptions {
  format: 'pdf';
  pageSize?: 'custom' | 'a4' | 'letter'; // Na razie tylko custom (rozmiar etykiety)
  orientation?: 'portrait' | 'landscape';
  margin?: number; // Margines w mm
}

export interface ExportRequest {
  labelIds: string[];
  projectId: string;
  options: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  data?: {
    downloadUrl?: string;
    filename: string;
    fileSize: number;
  };
  error?: string;
}

export interface LabelExportData {
  id: string;
  name: string;
  width: number;
  height: number;
  fabricData: {
    objects: FabricObject[];
    background?: string;
    version?: string;
    preferences?: {
      uuid?: {
        qrPrefix?: string;
        uuidLength?: number;
        labelUUID?: string;
      };
    };
  };
}

export interface ExportProgress {
  currentLabel: number;
  totalLabels: number;
  labelName: string;
  status: 'preparing' | 'rendering' | 'generating' | 'complete' | 'error';
}
