export interface Template {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  tags: string[];
  width: number;
  height: number;
  fabricData: {
    version: string;
    objects: unknown[];
    background: string;
  };
  thumbnail?: string;
  isPublic: boolean;
  isDefault: boolean;
  isSystem: boolean;
  downloads: number;
  likes: number;
  userId?: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    labels: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 
  | 'STANDARD' 
  | 'ADDRESS' 
  | 'SHIPPING' 
  | 'PRODUCT' 
  | 'INDUSTRIAL' 
  | 'CUSTOM' 
  | 'MARKETING' 
  | 'OFFICE';

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: TemplateCategory;
  tags?: string[];
  width: number;
  height: number;
  fabricData: {
    version: string;
    objects: unknown[];
    background: string;
  };
  thumbnail?: string;
  isPublic?: boolean;
  isDefault?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  tags?: string[];
  isPublic?: boolean;
  isDefault?: boolean;
  thumbnail?: string;
  fabricData?: {
    version: string;
    objects: unknown[];
    background: string;
  };
}

export interface GetTemplatesParams {
  category?: TemplateCategory | 'all';
  isPublic?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TemplatesResponse {
  success: boolean;
  data: Template[];
  total: number;
  cached: boolean;
}

export interface TemplateResponse {
  success: boolean;
  data: Template;
}

export interface CategoryCount {
  category: TemplateCategory;
  count: number;
}

export class TemplateService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get all templates (public + user's private ones)
   */
  static async getTemplates(params: GetTemplatesParams = {}): Promise<TemplatesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category && params.category !== 'all') {
        queryParams.append('category', params.category);
      }
      
      if (params.isPublic !== undefined) {
        queryParams.append('isPublic', params.isPublic.toString());
      }
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (params.offset) {
        queryParams.append('offset', params.offset.toString());
      }

      const response = await fetch(`/api/templates?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  /**
   * Get single template by ID
   */
  static async getTemplate(templateId: string): Promise<TemplateResponse> {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch template:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  static async createTemplate(templateData: CreateTemplateRequest): Promise<TemplateResponse> {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  static async updateTemplate(templateId: string, templateData: UpdateTemplateRequest): Promise<TemplateResponse> {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  static async deleteTemplate(templateId: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(templateId: string): Promise<TemplateResponse> {
    try {
      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      throw error;
    }
  }

  /**
   * Save label as template
   */
  static async saveAsTemplate(
    labelId: string, 
    templateData: {
      name: string;
      description?: string;
      category?: TemplateCategory;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<TemplateResponse> {
    try {
      const response = await fetch(`/api/label-management/labels/${labelId}/save-as-template`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save label as template:', error);
      throw error;
    }
  }

  /**
   * Get template categories with counts
   */
  static async getTemplateCategories(): Promise<{success: boolean; data: CategoryCount[]}> {
    try {
      const response = await fetch('/api/templates/categories', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch template categories:', error);
      throw error;
    }
  }
}
