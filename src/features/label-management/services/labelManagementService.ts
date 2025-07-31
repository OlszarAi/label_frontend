/**
 * Dedykowany serwis do zarządzania etykietami
 * Centralizuje wszystkie operacje tworzenia i zarządzania etykietami
 */

export interface CreateLabelRequest {
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  fabricData?: unknown;
  thumbnail?: string;
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  projectId: string;
  version: number;
  fabricData?: unknown;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export class LabelManagementService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Tworzy nową etykietę z automatycznym nazewnictwem
   * Nie wymaga podawania nazwy - system automatycznie wygeneruje unikatową nazwę
   */
  static async createLabel(projectId: string, data: CreateLabelRequest = {}): Promise<Label> {
    const response = await fetch(`/api/label-management/projects/${projectId}/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result: ApiResponse<Label> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create label');
    }

    if (!result.data) {
      throw new Error('No label data returned');
    }

    return result.data;
  }

  /**
   * Pomocnicza metoda dla prostego tworzenia etykiety z domyślnymi parametrami
   */

  /**
   * Duplikuje istniejącą etykietę z automatycznym nazewnictwem
   */
  static async duplicateLabel(labelId: string): Promise<Label> {
    const response = await fetch(`/api/label-management/labels/${labelId}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    const result: ApiResponse<Label> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to duplicate label');
    }

    if (!result.data) {
      throw new Error('No label data returned');
    }

    return result.data;
  }

  /**
   * Tworzy etykietę z szablonu
   */
  static async createFromTemplate(
    projectId: string, 
    templateData: {
      name?: string;
      width: number;
      height: number;
      fabricData?: unknown;
      baseName?: string;
    }
  ): Promise<Label> {
    const response = await fetch(`/api/label-management/projects/${projectId}/create-from-template`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData)
    });

    const result: ApiResponse<Label> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create label from template');
    }

    if (!result.data) {
      throw new Error('No label data returned');
    }

    return result.data;
  }

  /**
   * Tworzy wiele etykiet naraz
   */
  static async createBulkLabels(
    projectId: string, 
    count: number, 
    baseData: CreateLabelRequest = {}
  ): Promise<Label[]> {
    if (count < 1 || count > 50) {
      throw new Error('Count must be between 1 and 50');
    }

    const response = await fetch(`/api/label-management/projects/${projectId}/bulk-create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ count, ...baseData })
    });

    const result: ApiResponse<Label[]> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create bulk labels');
    }

    if (!result.data) {
      throw new Error('No label data returned');
    }

    return result.data;
  }

  /**
   * Pomocnicza metoda dla prostego tworzenia etykiety z domyślnymi parametrami
   */
  static async createSimpleLabel(projectId: string): Promise<Label> {
    return this.createLabel(projectId, {
      width: 100,
      height: 50,
      fabricData: {
        version: '6.0.0',
        objects: [],
        background: '#ffffff'
      }
    });
  }

  /**
   * Tworzy etykietę i zwraca URL do edytora
   */
  static async createLabelAndGetEditorUrl(projectId: string, data: CreateLabelRequest = {}): Promise<{
    label: Label;
    editorUrl: string;
  }> {
    const label = await this.createLabel(projectId, data);
    return {
      label,
      editorUrl: `/editor/${label.id}?projectId=${projectId}`
    };
  }
}
