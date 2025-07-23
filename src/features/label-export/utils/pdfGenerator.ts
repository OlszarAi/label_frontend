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
      errorCorrectionLevel: errorCorrectionLevel as any,
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
        format: 'png' as any, 
        quality: 1.0, 
        multiplier: 1 
      });
    }

    // Przetwarzanie obiektów z fabricData
    for (const obj of fabricData.objects) {
      if (!obj || typeof obj !== 'object') continue;
      
      let fabricObj: CustomFabricObject | null = null;

      try {
        switch ((obj as any).type) {
          case 'text':
          case 'i-text':
            fabricObj = new IText((obj as any).text || 'Tekst', {
              left: mmToPx((obj as any).x || 0, dpi),
              top: mmToPx((obj as any).y || 0, dpi),
              fontSize: ((obj as any).fontSize || 12) * (dpi / 96), // Skalowanie czcionki dla DPI
              fontFamily: (obj as any).fontFamily || 'Arial',
              fontWeight: (obj as any).fontWeight || 'normal',
              fontStyle: (obj as any).fontStyle || 'normal',
              underline: (obj as any).underline || false,
              linethrough: (obj as any).linethrough || false,
              textAlign: (obj as any).textAlign || 'left',
              lineHeight: (obj as any).lineHeight || 1.2,
              charSpacing: (obj as any).charSpacing || 0,
              fill: (obj as any).fill || '#000000',
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'rectangle':
          case 'rect':
            fabricObj = new Rect({
              left: mmToPx((obj as any).x || 0, dpi),
              top: mmToPx((obj as any).y || 0, dpi),
              width: mmToPx((obj as any).width || 20, dpi),
              height: mmToPx((obj as any).height || 10, dpi),
              fill: (obj as any).fill || 'transparent',
              stroke: (obj as any).stroke || '#000000',
              strokeWidth: ((obj as any).strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'circle':
            fabricObj = new Circle({
              left: mmToPx((obj as any).x || 0, dpi),
              top: mmToPx((obj as any).y || 0, dpi),
              radius: mmToPx(((obj as any).width || 20) / 2, dpi),
              fill: (obj as any).fill || 'transparent',
              stroke: (obj as any).stroke || '#000000',
              strokeWidth: ((obj as any).strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'line':
            fabricObj = new Line([
              mmToPx((obj as any).x || 0, dpi),
              mmToPx((obj as any).y || 0, dpi),
              mmToPx(((obj as any).x || 0) + ((obj as any).width || 20), dpi),
              mmToPx((obj as any).y || 0, dpi)
            ], {
              stroke: (obj as any).stroke || '#000000',
              strokeWidth: ((obj as any).strokeWidth || 1) * (dpi / 96),
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'uuid':
            const uuidText = (obj as any).sharedUUID || (obj as any).text || 'UUID';
            fabricObj = new Text(uuidText, {
              left: mmToPx((obj as any).x || 0, dpi),
              top: mmToPx((obj as any).y || 0, dpi),
              fontSize: ((obj as any).fontSize || 12) * (dpi / 96),
              fontFamily: (obj as any).fontFamily || 'Arial',
              fontWeight: (obj as any).fontWeight || 'normal',
              fontStyle: (obj as any).fontStyle || 'normal',
              underline: (obj as any).underline || false,
              linethrough: (obj as any).linethrough || false,
              textAlign: (obj as any).textAlign || 'left',
              lineHeight: (obj as any).lineHeight || 1.2,
              charSpacing: (obj as any).charSpacing || 0,
              fill: (obj as any).fill || '#000000',
              selectable: false,
              hasControls: false,
              hasBorders: false,
            }) as CustomFabricObject;
            break;

          case 'qrcode':
            const qrData = (obj as any).qrData || (obj as any).sharedUUID || 'QR';
            const qrSize = mmToPx((obj as any).width || 20, dpi);
            
            const qrDataURL = await createQRCodeDataURL(
              qrData,
              qrSize,
              (obj as any).qrErrorCorrectionLevel || 'M',
              (obj as any).fill || '#000000',
              (obj as any).stroke || '#ffffff'
            );
            
            if (qrDataURL) {
              const img = await FabricImage.fromURL(qrDataURL);
              img.set({
                left: mmToPx((obj as any).x || 0, dpi),
                top: mmToPx((obj as any).y || 0, dpi),
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
            console.warn('Unknown object type:', (obj as any).type);
            continue;
        }

        if (fabricObj) {
          fabricObj.customData = { id: (obj as any).id || 'unknown' };
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
      format: 'png' as any,
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
