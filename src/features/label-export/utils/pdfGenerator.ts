'use client';

import { jsPDF } from 'jspdf';
import { Canvas, FabricObject, Text, IText, Rect, Circle, Line, FabricImage } from 'fabric';
import QRCode from 'qrcode';
import { LabelExportData, PDFExportOptions, ExportProgress } from '../types/export.types';
import { PDF_SETTINGS } from '../constants/exportConstants';

// Interfaces podobne do tych z CanvasEditor
interface CustomFabricObject extends FabricObject {
  customData?: { id: string };
}

interface FabricObjectData {
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  linethrough?: boolean;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  sharedUUID?: string;
  qrData?: string;
  qrErrorCorrectionLevel?: string;
  id?: string;
  customData?: {
    type?: string;
    content?: string;
    size?: number;
    errorCorrectionLevel?: string;
    foregroundColor?: string;
    backgroundColor?: string;
  };
}

// Helper function do tworzenia QR kodów
const createQRCodeDataURL = async (
  text: string,
  size: number,
  errorCorrectionLevel: string = 'M',
  foreground: string = '#000000',
  background: string = '#ffffff'
): Promise<string | null> => {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: foreground,
        light: background,
      },
      errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Konwersja milimetrów na piksele dla danego DPI
const mmToPx = (mm: number, dpi: number = PDF_SETTINGS.DPI): number => {
  return (mm * dpi) / 25.4;
};

// Renderowanie etykiety do canvas i konwersja na obraz
const renderLabelToImage = async (
  labelData: LabelExportData,
  dpi: number = PDF_SETTINGS.DPI
): Promise<string | null> => {
  try {
    const { width: widthMm, height: heightMm, fabricData } = labelData;
    
    // Tworzenie canvas o wysokiej rozdzielczości
    const widthPx = mmToPx(widthMm, dpi);
    const heightPx = mmToPx(heightMm, dpi);
    
    // Tworzenie canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.width = widthPx;
    canvasElement.height = heightPx;
    
    const canvas = new Canvas(canvasElement, {
      width: widthPx,
      height: heightPx,
      backgroundColor: (fabricData.background as string) || '#ffffff',
      renderOnAddRemove: false
    });

    // Sprawdzenie czy fabricData ma objects
    if (!fabricData.objects || !Array.isArray(fabricData.objects)) {
      console.warn('No objects found in fabricData for label:', labelData.name);
      return canvas.toDataURL({ 
        format: 'png',
        quality: 1.0, 
        multiplier: 1 
      });
    }

    // Przetwarzanie obiektów z fabricData
    for (const obj of fabricData.objects) {
      if (!obj || typeof obj !== 'object') continue;
      
      const objData = obj as FabricObjectData;
      let fabricObj: CustomFabricObject | null = null;

      try {
        switch (objData.type) {
          case 'text':
          case 'i-text':
            fabricObj = new IText(objData.text || 'Tekst', {
              left: mmToPx(objData.x || 0, dpi),
              top: mmToPx(objData.y || 0, dpi),
              fontSize: (objData.fontSize || 12) * (dpi / 96), // Skalowanie czcionki dla DPI
              fontFamily: objData.fontFamily || 'Arial',
              fontWeight: objData.fontWeight || 'normal',
              fontStyle: objData.fontStyle || 'normal',
              underline: objData.underline || false,
              linethrough: objData.linethrough || false,
              textAlign: objData.textAlign || 'left',
              lineHeight: objData.lineHeight || 1.2,
              charSpacing: objData.charSpacing || 0,
              fill: objData.fill || '#000000',
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'rectangle':
          case 'rect':
            fabricObj = new Rect({
              left: mmToPx(objData.x || 0, dpi),
              top: mmToPx(objData.y || 0, dpi),
              width: mmToPx(objData.width || 20, dpi),
              height: mmToPx(objData.height || 10, dpi),
              fill: objData.fill || 'transparent',
              stroke: objData.stroke || '#000000',
              strokeWidth: (objData.strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'circle':
            fabricObj = new Circle({
              left: mmToPx(objData.x || 0, dpi),
              top: mmToPx(objData.y || 0, dpi),
              radius: mmToPx((objData.width || 20) / 2, dpi),
              fill: objData.fill || 'transparent',
              stroke: objData.stroke || '#000000',
              strokeWidth: (objData.strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'line':
            fabricObj = new Line([
              mmToPx(objData.x || 0, dpi),
              mmToPx(objData.y || 0, dpi),
              mmToPx((objData.x || 0) + (objData.width || 20), dpi),
              mmToPx(objData.y || 0, dpi)
            ], {
              stroke: objData.stroke || '#000000',
              strokeWidth: (objData.strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'uuid':
            const uuidText = objData.sharedUUID || objData.text || 'UUID';
            fabricObj = new Text(uuidText, {
              left: mmToPx(objData.x || 0, dpi),
              top: mmToPx(objData.y || 0, dpi),
              fontSize: (objData.fontSize || 12) * (dpi / 96),
              fontFamily: objData.fontFamily || 'Arial',
              fontWeight: objData.fontWeight || 'normal',
              fontStyle: objData.fontStyle || 'normal',
              underline: objData.underline || false,
              linethrough: objData.linethrough || false,
              textAlign: objData.textAlign || 'left',
              lineHeight: objData.lineHeight || 1.2,
              charSpacing: objData.charSpacing || 0,
              fill: objData.fill || '#000000',
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'qrcode':
            const qrData = objData.qrData || objData.sharedUUID || 'QR';
            const qrSize = mmToPx(objData.width || 20, dpi);
            
            const qrDataURL = await createQRCodeDataURL(
              qrData,
              qrSize,
              objData.qrErrorCorrectionLevel || 'M',
              objData.fill || '#000000',
              objData.stroke || '#ffffff'
            );
            
            if (qrDataURL) {
              const img = await FabricImage.fromURL(qrDataURL);
              img.set({
                left: mmToPx(objData.x || 0, dpi),
                top: mmToPx(objData.y || 0, dpi),
                scaleX: 1,
                scaleY: 1,
                selectable: false,
                hasControls: false,
                hasBorders: false,
              });
              fabricObj = img as CustomFabricObject;
            }
            break;

          default:
            console.warn('Unknown object type:', objData.type);
            continue;
        }

        if (fabricObj) {
          fabricObj.customData = { id: objData.id || 'unknown' };
          canvas.add(fabricObj);
        }
      } catch (objError) {
        console.error('Error processing object:', obj, objError);
        continue;
      }
    }

    // Renderowanie canvas
    canvas.renderAll();
    
    // Konwersja do obrazu
    const dataURL = canvas.toDataURL({ 
      format: 'png',
      quality: 1.0,
      multiplier: 1 // Canvas już ma odpowiedni rozmiar
    });

    // Czyszczenie canvas
    canvas.dispose();
    
    return dataURL;
    
  } catch (error) {
    console.error('Error rendering label to image:', error);
    return null;
  }
};

// Główna funkcja generowania PDF
export const generatePDFFromLabels = async (
  labels: LabelExportData[],
  options: PDFExportOptions,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob | null> => {
  if (!labels.length) {
    throw new Error('Brak etykiet do eksportu');
  }

  try {
    // Inicjalizacja PDF - pierwsze etykieta określa format
    const firstLabel = labels[0];
    const doc = new jsPDF({
      orientation: firstLabel.width > firstLabel.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [firstLabel.width, firstLabel.height],
      compress: true
    });

    // Usunięcie pierwszej strony (jsPDF automatycznie ją tworzy)
    doc.deletePage(1);

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      
      // Aktualizacja progressu
      if (onProgress) {
        onProgress({
          currentLabel: i + 1,
          totalLabels: labels.length,
          labelName: label.name,
          status: 'rendering'
        });
      }

      try {
        // Renderowanie etykiety do obrazu
        const imageDataURL = await renderLabelToImage(label, PDF_SETTINGS.DPI);
        
        if (!imageDataURL) {
          console.warn(`Failed to render label: ${label.name}`);
          continue;
        }

        // Dodanie nowej strony z rozmiarem tej etykiety
        doc.addPage([label.width, label.height], label.width > label.height ? 'landscape' : 'portrait');
        
        // Dodanie obrazu etykiety do PDF
        doc.addImage(
          imageDataURL,
          'PNG',
          0 + (options.margin || 0), // X pozycja z marginesem
          0 + (options.margin || 0), // Y pozycja z marginesem  
          label.width - (2 * (options.margin || 0)), // Szerokość z marginesem
          label.height - (2 * (options.margin || 0)), // Wysokość z marginesem
          undefined, // alias
          'FAST' // kompresja
        );

      } catch (labelError) {
        console.error(`Error processing label ${label.name}:`, labelError);
        continue;
      }
    }

    // Finalizacja
    if (onProgress) {
      onProgress({
        currentLabel: labels.length,
        totalLabels: labels.length,
        labelName: 'Finalizowanie...',
        status: 'complete'
      });
    }

    // Konwersja do Blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onProgress) {
      onProgress({
        currentLabel: 0,
        totalLabels: labels.length,
        labelName: 'Błąd eksportu',
        status: 'error'
      });
    }
    throw error;
  }
};
