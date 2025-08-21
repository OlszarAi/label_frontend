export type BulkCreationStep = 'template' | 'design' | 'quantity' | 'generating' | 'completed';

export interface BulkLabelDesign {
  name: string;
  width: number;
  height: number;
  fabricData: {
    version: string;
    objects: unknown[];
    background: string;
  };
  thumbnail?: string;
}

export interface BulkCreationOptions {
  quantity: number;
  baseName: string;
  qrPrefix?: string;
  uuidLength?: number; // Length of UUID to generate (default: 8)
}

export interface BulkCreationResult {
  success: boolean;
  createdLabels?: Array<{
    id: string;
    name: string;
    uuid: string;
  }>;
  error?: string;
}

export interface TemplateData {
  id: string;
  name: string;
  width: number;
  height: number;
  fabricData: {version: string; objects: unknown[]; background: string};
  thumbnail?: string;
  isUserTemplate: boolean;
  category: 'standard' | 'shipping' | 'address' | 'custom' | 'user';
}
