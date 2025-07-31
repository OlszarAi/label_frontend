/**
 * Centralized Label Management Service
 * Single source of truth for all label operations
 */

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
  
  // Simple cache to prevent duplicate requests
  private labelCache = new Map<string, { label: Label; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private isValidCacheEntry(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
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
    // Check cache first
    const cached = this.labelCache.get(labelId);
    if (cached && this.isValidCacheEntry(cached.timestamp)) {
      return cached.label;
    }

    const response = await fetch(`${this.baseUrl}/projects/labels/${labelId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch label');
    }

    const { data } = await response.json();
    
    // Cache the result
    this.labelCache.set(labelId, {
      label: data,
      timestamp: Date.now()
    });
    
    return data;
  }

  /**
   * Create a new label with smart naming using new backend system
   */
  async createLabel(request: CreateLabelRequest): Promise<Label> {
    // Use the new backend endpoint for automatic naming
    const createData = {
      name: request.name,
      description: request.description || '',
      width: request.templateData?.width || request.width || 100,
      height: request.templateData?.height || request.height || 50,
      fabricData: request.templateData?.objects ? {
        version: '6.0.0',
        objects: request.templateData.objects,
        background: '#ffffff',
      } : undefined,
    };

    const response = await fetch(`${this.baseUrl}/label-management/projects/${request.projectId}/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create label');
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create label');
    }

    return result.data;
  }

  /**
   * Duplicate an existing label with smart naming using new backend system
   */
  async duplicateLabel(request: DuplicateLabelRequest): Promise<Label> {
    const response = await fetch(`${this.baseUrl}/label-management/labels/${request.labelId}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to duplicate label');
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to duplicate label');
    }

    return result.data;
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
    
    // Update cache with new data
    this.labelCache.set(labelId, {
      label: data,
      timestamp: Date.now()
    });
    
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
    
    // Remove from cache
    this.labelCache.delete(labelId);
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
