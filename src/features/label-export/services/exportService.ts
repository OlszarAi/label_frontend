'use client';

import { ExportRequest, LabelExportData } from '../types/export.types';
import { Label } from '@/features/project-management/types/project.types';

class ExportService {
  private readonly baseUrl = '/api';

  // Pobieranie danych etykiet potrzebnych do eksportu
  async getLabelExportData(labelIds: string[]): Promise<LabelExportData[]> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      // Pobieramy dane każdej etykiety
      const labelPromises = labelIds.map(async (labelId) => {
        const response = await fetch(`${this.baseUrl}/projects/labels/${labelId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Nie udało się pobrać etykiety ${labelId}`);
        }

        const { data: label } = await response.json();
        return label as Label;
      });

      const labels = await Promise.all(labelPromises);

      // Konwersja do formatu eksportu
      return labels.map((label): LabelExportData => ({
        id: label.id,
        name: label.name,
        width: label.width,
        height: label.height,
        fabricData: label.fabricData || { objects: [], background: '#ffffff' }
      }));

    } catch (error) {
      console.error('Error fetching label export data:', error);
      throw error;
    }
  }

  // Pobieranie wszystkich etykiet z projektu  
  async getProjectLabels(projectId: string): Promise<LabelExportData[]> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      const response = await fetch(`${this.baseUrl}/projects/${projectId}/labels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać etykiet projektu');
      }

      const { data: labels } = await response.json();

      // Konwersja do formatu eksportu
      return labels.map((label: Label): LabelExportData => ({
        id: label.id,
        name: label.name,
        width: label.width,
        height: label.height,
        fabricData: label.fabricData || { objects: [], background: '#ffffff' }
      }));

    } catch (error) {
      console.error('Error fetching project labels:', error);
      throw error;
    }
  }

  // Walidacja danych eksportu
  validateExportRequest(request: ExportRequest): { valid: boolean; error?: string } {
    if (!request.labelIds || request.labelIds.length === 0) {
      return { valid: false, error: 'Brak etykiet do eksportu' };
    }

    if (request.labelIds.length > 100) {
      return { valid: false, error: 'Maksymalnie 100 etykiet na eksport' };
    }

    if (!request.projectId) {
      return { valid: false, error: 'Brak ID projektu' };
    }

    if (!request.options || !request.options.format) {
      return { valid: false, error: 'Brak opcji eksportu' };
    }

    return { valid: true };
  }

  // Helper do tworzenia nazwy pliku
  generateFilename(projectName: string, labelCount: number, format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (labelCount === 1) {
      return `etykieta_${sanitizedProjectName}_${timestamp}.${format}`;
    } else {
      return `etykiety_${sanitizedProjectName}_${labelCount}szt_${timestamp}.${format}`;
    }
  }

  // Helper do pobierania nazwy projektu
  async getProjectName(projectId: string): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return 'projekt';
      }

      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return 'projekt';
      }

      const { data: project } = await response.json();
      return project.name || 'projekt';

    } catch (error) {
      console.error('Error fetching project name:', error);
      return 'projekt';
    }
  }
}

export const exportService = new ExportService();
