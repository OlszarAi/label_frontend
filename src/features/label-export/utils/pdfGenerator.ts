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
  angle?: number; // Rotation angle in degrees
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
  data?: string; // Może być używane przez niektóre obiekty QR
  qrErrorCorrectionLevel?: string;
  id?: string;
  // Image specific properties
  src?: string;
  imageUrl?: string;
  scaleX?: number;
  scaleY?: number;
  customData?: {
    type?: string;
    content?: string;
    size?: number;
    errorCorrectionLevel?: string;
    foregroundColor?: string;
    backgroundColor?: string;
  };
}

interface FabricDataPreferences {
  uuid?: {
    qrPrefix?: string;
    uuidLength?: number;
    labelUUID?: string;
  };
}

interface FabricDataWithPreferences {
  objects: FabricObjectData[];
  background?: string;
  version?: string;
  preferences?: FabricDataPreferences;
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
    
    // Pobierz qrPrefix z preferences tej etykiety
    const qrPrefix = (fabricData as FabricDataWithPreferences).preferences?.uuid?.qrPrefix || '';
    
    console.log(`🏷️ Processing label "${labelData.name}" with QR prefix: "${qrPrefix}"`);
    
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
              angle: objData.angle || 0, // Set rotation angle
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
              angle: objData.angle || 0, // Set rotation angle
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
              angle: objData.angle || 0, // Set rotation angle
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
              angle: objData.angle || 0, // Set rotation angle
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
              angle: objData.angle || 0, // Set rotation angle
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
            // Sprawdź różne właściwości QR - system bulk może używać 'data'
            let qrUUID = objData.sharedUUID || 'QR';
            
            // Jeśli data zawiera już prefiks, wydobądź sam UUID
            if (objData.data && objData.data !== objData.sharedUUID) {
              // Sprawdź czy data zawiera prefiks + UUID
              if (qrPrefix && objData.data.startsWith(qrPrefix)) {
                qrUUID = objData.data.substring(qrPrefix.length);
              } else {
                // Jeśli nie ma prefiksu ale data jest różna od sharedUUID, użyj data
                qrUUID = objData.data;
              }
            } else if (objData.qrData && objData.qrData !== objData.sharedUUID) {
              // Podobnie dla qrData
              if (qrPrefix && objData.qrData.startsWith(qrPrefix)) {
                qrUUID = objData.qrData.substring(qrPrefix.length);
              } else {
                qrUUID = objData.qrData;
              }
            }
            
            const qrData = qrPrefix ? `${qrPrefix}${qrUUID}` : qrUUID;
            const qrSize = mmToPx(objData.width || 20, dpi);
            
            console.log(`🔍 QR Code debug:`, {
              sharedUUID: objData.sharedUUID,
              qrData: objData.qrData,
              data: objData.data,
              extractedUUID: qrUUID,
              qrPrefix,
              finalQRData: qrData
            });
            
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
                angle: objData.angle || 0, // Set rotation angle
                scaleX: 1,
                scaleY: 1,
                selectable: false,
                hasControls: false,
                hasBorders: false,
              });
              fabricObj = img as CustomFabricObject;
            }
            break;

          case 'image':
            const imageUrl = objData.src || objData.imageUrl;
            if (imageUrl) {
              try {
                const imageObj = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
                
                // Calculate target dimensions in pixels
                const targetWidthPx = mmToPx(objData.width || 20, dpi);
                const targetHeightPx = mmToPx(objData.height || 20, dpi);
                
                // Calculate scale to fit target dimensions
                const originalWidth = imageObj.width || 1;
                const originalHeight = imageObj.height || 1;
                
                const scaleX = targetWidthPx / originalWidth;
                const scaleY = targetHeightPx / originalHeight;
                
                imageObj.set({
                  left: mmToPx(objData.x || 0, dpi),
                  top: mmToPx(objData.y || 0, dpi),
                  angle: objData.angle || 0, // Set rotation angle
                  scaleX: scaleX,
                  scaleY: scaleY,
                  selectable: false,
                  hasControls: false,
                  hasBorders: false,
                });
                
                fabricObj = imageObj as CustomFabricObject;
              } catch (imageError) {
                console.error('Failed to load image for PDF export:', imageUrl, imageError);
                // Continue without this image rather than failing the whole export
              }
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
