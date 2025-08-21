import { generateUUID } from '../../label-editor/utils/uuid';

/**
 * Prosty system tworzenia unikalnych etykiet
 * Działa dokładnie jak główny edytor - każda etykieta tworzona oddzielnie
 */
export class BulkLabelProcessor {
  
  /**
   * Tworzy jedną etykietę z unikalnym UUID - tak samo jak główny edytor
   */
  static createSingleLabelData(
    templateData: {
      name: string;
      description: string;
      width: number;
      height: number;
      fabricData: any;
      thumbnail?: string;
    },
    index: number,
    qrPrefix: string = '',
    uuidLength: number = 8
  ): any {
    
    // 1. Generuj unikalny UUID dla tej etykiety (tak samo jak główny edytor)
    const uniqueUUID = generateUUID(uuidLength);
    
    console.log(`🏷️ Creating label ${index + 1} with UUID: ${uniqueUUID}, prefix: "${qrPrefix}"`);
    
    // 2. Skopiuj template fabricData
    const fabricData = JSON.parse(JSON.stringify(templateData.fabricData));
    
    // 3. Ustaw pełne preferences (tak jak w głównym edytorze)
    const defaultPreferences = {
      uuid: {
        uuidLength: uuidLength,
        qrPrefix: qrPrefix,
        labelUUID: uniqueUUID  // ⭐ KLUCZOWE: zapisz UUID etykiety w preferences
      },
      grid: {
        size: 5,
        snapToGrid: false,
        showGrid: false,
        color: '#e0e0e0',
        opacity: 0.5,
      },
      ruler: {
        showRulers: false,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        opacity: 0.9,
        size: 24,
      }
    };
    
    fabricData.preferences = {
      ...defaultPreferences,
      ...fabricData.preferences,
      uuid: {
        ...defaultPreferences.uuid,
        ...fabricData.preferences?.uuid,
        labelUUID: uniqueUUID  // ⭐ Zawsze ustaw UUID etykiety
      }
    };
    
    // 4. Przetworz wszystkie obiekty - ustaw sharedUUID (ale NIE zmieniaj data dla QR!)
    if (fabricData.objects && Array.isArray(fabricData.objects)) {
      fabricData.objects = fabricData.objects.map((obj: any) => {
        const newObj = { ...obj };
        
        // Dla WSZYSTKICH obiektów UUID/QR - ustaw sharedUUID na UUID etykiety
        if (obj.type === 'uuid') {
          newObj.text = uniqueUUID;
          newObj.sharedUUID = uniqueUUID;
        }
        
        if (obj.type === 'qrcode') {
          // NIE ustawiaj data! QR kod będzie renderowany dynamicznie z qrPrefix + sharedUUID
          newObj.sharedUUID = uniqueUUID;
        }
        
        return newObj;
      });
    }
    
    console.log(`🎯 Label ${index + 1} objects processed:`, {
      totalObjects: fabricData.objects?.length || 0,
      uuidObjects: fabricData.objects?.filter((obj: any) => obj.type === 'uuid').length || 0,
      qrObjects: fabricData.objects?.filter((obj: any) => obj.type === 'qrcode').length || 0,
      labelUUID: uniqueUUID,
      qrPrefix: qrPrefix
    });
    
    // 5. Zwróć kompletne dane etykiety
    return {
      name: `${templateData.name} ${index + 1}`,
      description: templateData.description || `Bulk created label ${index + 1}`,
      width: templateData.width,
      height: templateData.height,
      fabricData: fabricData,
      thumbnail: templateData.thumbnail
    };
  }
  
  /**
   * Analiza template - sprawdza czy ma obiekty UUID/QR
   */
  static analyzeTemplate(fabricData: any): {
    hasUUIDObjects: boolean;
    hasQRObjects: boolean;
  } {
    if (!fabricData || !fabricData.objects || !Array.isArray(fabricData.objects)) {
      return { hasUUIDObjects: false, hasQRObjects: false };
    }
    
    const hasUUIDObjects = fabricData.objects.some((obj: any) => obj.type === 'uuid');
    const hasQRObjects = fabricData.objects.some((obj: any) => obj.type === 'qrcode');
    
    return { hasUUIDObjects, hasQRObjects };
  }
}
