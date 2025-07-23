// Stałe dla systemu eksportu etykiet

import { ExportFormat, PDFExportOptions } from '../types/export.types';

export const EXPORT_FORMATS: Record<ExportFormat, { name: string; extension: string; description: string; available: boolean }> = {
  pdf: {
    name: 'PDF',
    extension: 'pdf',
    description: 'Jedna etykieta na stronę, idealne rozmiary',
    available: true
  },
  png: {
    name: 'PNG',
    extension: 'png', 
    description: 'Wysokiej jakości obrazy rasterowe',
    available: false // Coming soon
  },
  jpg: {
    name: 'JPEG',
    extension: 'jpg',
    description: 'Skompresowane obrazy, mniejsze pliki',
    available: false // Coming soon
  },
  svg: {
    name: 'SVG',
    extension: 'svg',
    description: 'Wektorowe pliki, skalowalne',
    available: false // Coming soon
  }
} as const;

export const DEFAULT_EXPORT_OPTIONS: PDFExportOptions = {
  format: 'pdf',
  pageSize: 'custom',
  orientation: 'portrait',
  margin: 0,
  quality: 1.0,
  includeBackground: true,
  scale: 1.0
} as const;

export const PDF_SETTINGS = {
  DPI: 300, // Wysoka rozdzielczość dla druku
  UNITS: 'mm' as const,
  FORMAT: 'a4' as const, // Domyślny format, ale używamy custom size
  COMPRESSION: {
    NONE: 'NONE',
    FAST: 'FAST',
    SLOW: 'SLOW'
  }
} as const;

export const EXPORT_LIMITS = {
  MAX_LABELS_PER_EXPORT: 100,
  MAX_FILE_SIZE_MB: 50,
  MIN_LABEL_SIZE_MM: 5,
  MAX_LABEL_SIZE_MM: 1000
} as const;
