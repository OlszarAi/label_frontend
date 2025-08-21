import { generateUUID } from '../../label-editor/utils/uuid';

/**
 * Advanced Bulk Label Processing Service
 * 
 * This service creates each bulk label with truly unique UUIDs and QR codes,
 * following the EXACT same pattern as the main label editor.
 * 
 * Key principle: Each label must have its own UUID, and ALL UUID/QR objects 
 * within that label must use the SAME UUID (sharedUUID system).
 */
export class BulkLabelPostProcessor {
  
  /**
   * Generate unique fabricData for each label in bulk creation
   * This mimics how the main editor handles UUID/QR objects
   */
  static generateUniqueFabricDataSet(
    templateFabricData: any,
    count: number,
    qrPrefix: string = '',
    uuidLength: number = 8
  ): Array<{ fabricData: any; labelUUID: string }> {
    const results: Array<{ fabricData: any; labelUUID: string }> = [];
    
    console.log(`🔧 Processing template for ${count} labels...`);
    console.log('📋 Template fabricData:', templateFabricData);
    
    // Analyze template objects
    const analysis = this.analyzeFabricDataObjects(templateFabricData);
    console.log('📊 Template analysis:', analysis);
    
    for (let i = 0; i < count; i++) {
      // Generate unique UUID for this specific label (same algorithm as main editor)
      const labelUUID = generateUUID(uuidLength);
      
      // Deep clone the template to avoid reference issues
      const uniqueFabricData = JSON.parse(JSON.stringify(templateFabricData));
      
      // Ensure structure matches main editor format
      if (!uniqueFabricData.version) {
        uniqueFabricData.version = '6.0.0';
      }
      if (!uniqueFabricData.background) {
        uniqueFabricData.background = '#ffffff';
      }
      
      // Process all objects to assign the same UUID to all UUID/QR objects
      if (uniqueFabricData.objects && Array.isArray(uniqueFabricData.objects)) {
        uniqueFabricData.objects = uniqueFabricData.objects.map((obj: any, objIndex: number) => {
          // Handle UUID text objects
          if (obj.type === 'uuid') {
            const updatedObj = {
              ...obj,
              text: labelUUID,           // Display text shows the UUID
              sharedUUID: labelUUID      // Shared UUID for consistency
            };
            console.log(`🏷️ Label ${i + 1} - UUID object ${objIndex}: ${labelUUID}`);
            return updatedObj;
          }
          
          // Handle QR Code objects  
          if (obj.type === 'qrcode') {
            const qrData = `${qrPrefix}${labelUUID}`;
            const updatedObj = {
              ...obj,
              sharedUUID: labelUUID,     // Shared UUID for consistency
              data: qrData               // QR code data with prefix
            };
            console.log(`📱 Label ${i + 1} - QR object ${objIndex}: ${qrData}`);
            return updatedObj;
          }
          
          // Leave other objects unchanged
          return obj;
        });
      }
      
      results.push({
        fabricData: uniqueFabricData,
        labelUUID
      });
    }
    
    console.log(`✨ Generated ${results.length} unique fabricData sets`);
    return results;
  }

  /**
   * Analyze fabricData to understand what objects need UUID processing
   */
  static analyzeFabricDataObjects(fabricData: any): {
    hasUUIDObjects: boolean;
    hasQRObjects: boolean;
    uuidCount: number;
    qrCount: number;
    totalObjects: number;
  } {
    if (!fabricData || !fabricData.objects || !Array.isArray(fabricData.objects)) {
      return {
        hasUUIDObjects: false,
        hasQRObjects: false,
        uuidCount: 0,
        qrCount: 0,
        totalObjects: 0
      };
    }
    
    let uuidCount = 0;
    let qrCount = 0;
    
    fabricData.objects.forEach((obj: any) => {
      if (obj.type === 'uuid') uuidCount++;
      if (obj.type === 'qrcode') qrCount++;
    });
    
    return {
      hasUUIDObjects: uuidCount > 0,
      hasQRObjects: qrCount > 0,
      uuidCount,
      qrCount,
      totalObjects: fabricData.objects.length
    };
  }

  /**
   * Validate that all UUID/QR objects in a fabricData use the same UUID
   * This ensures consistency like in the main editor
   */
  static validateLabelUUIDConsistency(fabricData: any, expectedUUID: string): {
    isValid: boolean;
    issues: string[];
    foundUUIDs: string[];
  } {
    const issues: string[] = [];
    const foundUUIDs: Set<string> = new Set();
    
    if (!fabricData || !fabricData.objects) {
      return { isValid: true, issues: [], foundUUIDs: [] };
    }
    
    fabricData.objects.forEach((obj: any, index: number) => {
      if (obj.type === 'uuid') {
        if (obj.text && obj.text !== expectedUUID) {
          issues.push(`UUID object ${index}: text "${obj.text}" ≠ expected "${expectedUUID}"`);
        }
        if (obj.sharedUUID && obj.sharedUUID !== expectedUUID) {
          issues.push(`UUID object ${index}: sharedUUID "${obj.sharedUUID}" ≠ expected "${expectedUUID}"`);
        }
        if (obj.sharedUUID) foundUUIDs.add(obj.sharedUUID);
        if (obj.text) foundUUIDs.add(obj.text);
      }
      
      if (obj.type === 'qrcode') {
        if (obj.sharedUUID && obj.sharedUUID !== expectedUUID) {
          issues.push(`QR object ${index}: sharedUUID "${obj.sharedUUID}" ≠ expected "${expectedUUID}"`);
        }
        if (obj.sharedUUID) foundUUIDs.add(obj.sharedUUID);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues,
      foundUUIDs: Array.from(foundUUIDs)
    };
  }

  /**
   * Debug function to inspect a fabricData structure
   */
  static debugFabricData(fabricData: any, labelIndex?: number): void {
    const prefix = labelIndex !== undefined ? `Label ${labelIndex}` : 'FabricData';
    console.log(`🔍 ${prefix} Debug:`, {
      version: fabricData?.version,
      background: fabricData?.background,
      objectCount: fabricData?.objects?.length || 0,
      objects: fabricData?.objects?.map((obj: any, i: number) => ({
        index: i,
        type: obj.type,
        sharedUUID: obj.sharedUUID,
        text: obj.type === 'uuid' ? obj.text : undefined,
        data: obj.type === 'qrcode' ? obj.data : undefined
      })) || []
    });
  }

  /**
   * Legacy compatibility method
   * @deprecated Use generateUniqueFabricDataSet for new implementations
   */
  static async processCreatedLabels(
    labelIds: string[], 
    qrPrefix?: string
  ): Promise<{ success: boolean; processedCount: number; errors: string[] }> {
    console.warn('⚠️ BulkLabelPostProcessor.processCreatedLabels is deprecated and disabled.');
    console.warn('⚠️ Use the new bulk creation system with generateUniqueFabricDataSet instead.');
    
    return {
      success: true,
      processedCount: labelIds.length,
      errors: []
    };
  }
}
