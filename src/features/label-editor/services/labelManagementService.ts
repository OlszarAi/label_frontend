/**
 * Centralized Label Management Service
 * Single source of truth for all label operations
 */

import { generateUniqueLabel, generateCopyName, type LabelForNaming } from '../utils/labelNaming';

export interface CreateLabelRequest {
  projectId: string;
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  templateData?: {
    width: number;
    height: number;
    templateName: string;
    objects?: object[];
  };
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  projectId: string;
  fabricData?: object;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface DuplicateLabelRequest {
  labelId: string;
}

class LabelManagementService {
  private baseUrl = '/api';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get all labels for a project
   */
  async getProjectLabels(projectId: string): Promise<Label[]> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/labels`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project labels');
    }

    const { data } = await response.json();
    return data || [];
  }

  /**
   * Get a single label by ID
   */
  async getLabel(labelId: string): Promise<Label> {
    const response = await fetch(`${this.baseUrl}/projects/labels/${labelId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch label');
    }

    const { data } = await response.json();
    return data;
  }

  /**
   * Create a new label with smart naming
   */
  async createLabel(request: CreateLabelRequest): Promise<Label> {
    // First, get existing labels to generate unique name
    const existingLabels = await this.getProjectLabels(request.projectId);
    
    // Generate unique name
    let labelName: string;
    if (request.name) {
      // If specific name provided, use it (for templates)
      labelName = request.name;
    } else if (request.templateData) {
      // For templates, use template name as base
      labelName = generateUniqueLabel(
        existingLabels as LabelForNaming[], 
        request.templateData.templateName
      );
    } else {
      // Default case - generate "New Label X"
      labelName = generateUniqueLabel(existingLabels as LabelForNaming[]);
    }

    // Prepare create data
    const createData = {
      name: labelName,
      description: request.description || '',
      width: request.templateData?.width || request.width || 100,
      height: request.templateData?.height || request.height || 50,
      fabricData: {
        version: '6.0.0',
        objects: request.templateData?.objects || [],
        background: '#ffffff',
      },
    };

    const response = await fetch(`${this.baseUrl}/projects/${request.projectId}/labels`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create label');
    }

    const { data } = await response.json();
    return data;
  }

  /**
   * Duplicate an existing label with smart naming
   */
  async duplicateLabel(request: DuplicateLabelRequest): Promise<Label> {
    // Get the original label
    const originalLabel = await this.getLabel(request.labelId);
    
    // Get existing labels for smart naming
    const existingLabels = await this.getProjectLabels(originalLabel.projectId);
    
    // Generate unique copy name (but unused for now)
    generateCopyName(originalLabel.name, existingLabels as LabelForNaming[]);

    const response = await fetch(`${this.baseUrl}/projects/labels/${request.labelId}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate label');
    }

    const { data } = await response.json();
    return data;
  }

  /**
   * Update an existing label
   */
  async updateLabel(labelId: string, updates: Partial<Label>): Promise<Label> {
    const response = await fetch(`${this.baseUrl}/projects/labels/${labelId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update label');
    }

    const { data } = await response.json();
    return data;
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/labels/${labelId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete label');
    }
  }

  /**
   * Create multiple labels at once (for bulk operations)
   */
  async createMultipleLabels(requests: CreateLabelRequest[]): Promise<Label[]> {
    const results: Label[] = [];
    
    // Process sequentially to ensure correct naming
    for (const request of requests) {
      const label = await this.createLabel(request);
      results.push(label);
      
      // Small delay to ensure proper ordering
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

// Export singleton instance
export const labelManagementService = new LabelManagementService();
