import { BulkCreationResult } from '../types/bulk-label.types';
import { BulkLabelProcessor } from './BulkLabelProcessor';

interface CreateBulkLabelsRequest {
  name: string;
  description: string;
  width: number;
  height: number;
  fabricData: {version: string; objects: unknown[]; background: string};
  count: number;
  qrPrefix?: string;
  uuidLength?: number;
  thumbnail?: string;
}

export class BulkLabelService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Nowy, prosty system tworzenia etykiet
   * Tworzy każdą etykietę osobno - tak samo jak główny edytor
   */
  static async createBulkLabels(
    projectId: string,
    request: CreateBulkLabelsRequest
  ): Promise<BulkCreationResult> {
    try {
      console.log(`🚀 Creating ${request.count} labels one by one...`);
      console.log(`📋 Request parameters:`, {
        qrPrefix: request.qrPrefix,
        uuidLength: request.uuidLength,
        hasQrPrefix: !!request.qrPrefix,
        prefixLength: request.qrPrefix?.length || 0
      });
      
      const createdLabels: Array<{id: string; name: string; uuid: string}> = [];
      const templateData = {
        name: request.name,
        description: request.description,
        width: request.width,
        height: request.height,
        fabricData: request.fabricData,
        thumbnail: request.thumbnail
      };

      // Analiza template
      const analysis = BulkLabelProcessor.analyzeTemplate(request.fabricData);
      console.log('📊 Template analysis:', analysis);

      // Twórz każdą etykietę osobno (jak w głównym edytorze)
      for (let i = 0; i < request.count; i++) {
        
        // 1. Stwórz dane dla jednej etykiety (z unikalnym UUID)
        const labelData = BulkLabelProcessor.createSingleLabelData(
          templateData,
          i,
          request.qrPrefix || '',
          request.uuidLength || 8
        );

        // 2. Wyślij do backend (używając endpoint dla pojedynczej etykiety)
        const response = await fetch(`/api/label-management/projects/${projectId}/create`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            name: labelData.name,
            description: labelData.description,
            width: labelData.width,
            height: labelData.height,
            fabricData: labelData.fabricData,
            thumbnail: labelData.thumbnail
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create label ${i + 1}: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(`Failed to create label ${i + 1}: ${result.message}`);
        }

        // 3. Dodaj do wyników
        const createdLabel = result.data;
        createdLabels.push({
          id: createdLabel.id,
          name: createdLabel.name,
          uuid: 'unique-per-label'
        });

        console.log(`✅ Created label ${i + 1}/${request.count}: ${createdLabel.name}`);
      }

      console.log(`🎯 Successfully created ${createdLabels.length} labels with unique UUIDs!`);

      return {
        success: true,
        createdLabels: createdLabels
      };

    } catch (error) {
      console.error('❌ Bulk creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getUserTemplates(): Promise<unknown[]> {
    try {
      const response = await fetch('/api/templates?limit=50', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch user templates:', error);
      return [];
    }
  }

  static async saveAsTemplate(
    labelId: string,
    templateData: {
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/label-management/labels/${labelId}/save-as-template`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Failed to save template:', error);
      return false;
    }
  }
}
