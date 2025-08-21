import { projectCache, labelCache, thumbnailCache, useOptimizedRequest } from '../hooks/useOptimizedRequest';

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricData?: any;
  thumbnail?: string;
  width: number;
  height: number;
  version: number;
  batchId?: string;
  templateId?: string;
  uniqueId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Optimized workspace service with intelligent caching and request batching
 */
export class OptimizedWorkspaceService {
  private static API_BASE = '/api';

  /**
   * Fetch projects with optimized caching
   */
  static async getProjects(options: {
    page?: number;
    limit?: number;
    search?: string;
    force?: boolean;
  } = {}): Promise<Project[]> {
    const { page = 1, limit = 10, search = '', force = false } = options;
    const cacheKey = `projects:${page}:${limit}:${search}`;

    // Check authentication first
    if (!this.isAuthenticated()) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    if (force) {
      projectCache.invalidate(cacheKey);
    }

    return projectCache.get(cacheKey, async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);

      const response = await fetch(`${this.API_BASE}/projects?${params}`, {
        headers: this.getAuthHeaders()
      });

      this.handleApiError(response, `/projects?${params}`);

      const result: ApiResponse<Project[]> = await response.json();
      return result.data || [];
    });
  }

  /**
   * Fetch single project with labels
   */
  static async getProject(projectId: string, force = false, token?: string): Promise<Project> {
    const cacheKey = `project:${projectId}`;

    // Check authentication first - use provided token or check localStorage
    if (token) {
      // Use provided token
    } else if (!this.isAuthenticated()) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    if (force) {
      projectCache.invalidate(cacheKey);
    }

    return projectCache.get(cacheKey, async () => {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}/projects/${projectId}`, {
        headers
      });

      this.handleApiError(response, `/projects/${projectId}`);

      const result: ApiResponse<Project> = await response.json();
      
      // Cache individual labels too
      if (result.data.labels) {
        result.data.labels.forEach(label => {
          labelCache.cache.set(`label:${label.id}`, {
            data: label,
            loading: false,
            error: null,
            lastFetch: Date.now()
          });
        });
      }

      return result.data;
    });
  }

  /**
   * Fetch project labels with optimized loading
   */
  static async getProjectLabels(projectId: string, force = false, token?: string): Promise<Label[]> {
    const cacheKey = `project:${projectId}:labels`;

    // Check authentication first - use provided token or check localStorage
    if (token) {
      // Use provided token
    } else if (!this.isAuthenticated()) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    if (force) {
      labelCache.invalidate(cacheKey);
    }

    return labelCache.get(cacheKey, async () => {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}/projects/${projectId}/labels`, {
        headers
      });

      this.handleApiError(response, `/projects/${projectId}/labels`);

      const result: ApiResponse<Label[]> = await response.json();
      const labels = result.data || [];

      // Cache individual labels
      labels.forEach(label => {
        labelCache.cache.set(`label:${label.id}`, {
          data: label,
          loading: false,
          error: null,
          lastFetch: Date.now()
        });
      });

      return labels;
    });
  }

  /**
   * Get single label with caching
   */
  static async getLabel(labelId: string, force = false): Promise<Label> {
    const cacheKey = `label:${labelId}`;

    if (force) {
      labelCache.invalidate(cacheKey);
    }

    return labelCache.get(cacheKey, async () => {
      const response = await fetch(`${this.API_BASE}/projects/labels/${labelId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch label: ${response.statusText}`);
      }

      const result: ApiResponse<Label> = await response.json();
      return result.data;
    });
  }

  /**
   * Get thumbnail URL with aggressive caching
   */
  static async getThumbnailUrl(labelId: string, size: 'sm' | 'md' | 'lg' = 'md'): Promise<string | null> {
    const cacheKey = `thumbnail:${labelId}:${size}`;

    return thumbnailCache.get(cacheKey, async () => {
      const response = await fetch(`${this.API_BASE}/projects/labels/${labelId}/thumbnail?size=${size}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Cache 404 responses to prevent repeated requests
          return null; // No thumbnail available
        }
        throw new Error(`Failed to fetch thumbnail: ${response.statusText}`);
      }

      const result: ApiResponse<{ thumbnailUrl: string }> = await response.json();
      return result.data?.thumbnailUrl || null;
    }, 10 * 60 * 1000); // Cache thumbnails for 10 minutes
  }

  /**
   * Generate thumbnail from canvas dataURL
   */
  static async generateThumbnail(labelId: string, dataURL: string, size: 'sm' | 'md' | 'lg' = 'md'): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_BASE}/label-management/labels/${labelId}/generate-thumbnail`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataURL, size })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate thumbnail: ${response.statusText}`);
      }

      const result: ApiResponse<{ thumbnailUrl: string }> = await response.json();
      
      // Update thumbnail cache
      const cacheKey = `thumbnail:${labelId}:${size}`;
      thumbnailCache.cache.set(cacheKey, {
        data: result.data.thumbnailUrl,
        loading: false,
        error: null,
        lastFetch: Date.now()
      });

      return result.data.thumbnailUrl;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  }

  /**
   * Batch load thumbnails for multiple labels
   */
  static async batchLoadThumbnails(labelIds: string[], size: 'sm' | 'md' | 'lg' = 'md'): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const labelId of labelIds) {
      const cacheKey = `thumbnail:${labelId}:${size}`;
      const cached = thumbnailCache.getState(cacheKey);
      
      if (cached && cached.data !== null && !cached.error && (Date.now() - cached.lastFetch) < 10 * 60 * 1000) {
        results.set(labelId, cached.data as string);
      } else {
        uncachedIds.push(labelId);
      }
    }

    // Batch load uncached thumbnails
    if (uncachedIds.length > 0) {
      const promises = uncachedIds.map(async (labelId) => {
        try {
          const url = await this.getThumbnailUrl(labelId, size);
          results.set(labelId, url);
        } catch (error) {
          console.warn(`Failed to load thumbnail for label ${labelId}:`, error);
          results.set(labelId, null);
        }
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Update label and invalidate related caches
   */
  static async updateLabel(labelId: string, data: Partial<Label>): Promise<Label> {
    const response = await fetch(`${this.API_BASE}/projects/labels/${labelId}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update label: ${response.statusText}`);
    }

    const result: ApiResponse<Label> = await response.json();
    const updatedLabel = result.data;

    // Invalidate related caches
    labelCache.invalidate(`label:${labelId}`);
    projectCache.invalidatePattern(`project:${updatedLabel.projectId}*`);
    thumbnailCache.invalidatePattern(`thumbnail:${labelId}:*`);

    return updatedLabel;
  }

  /**
   * Clear all caches (use when user logs out or major changes)
   */
  static clearAllCaches(): void {
    projectCache.clear();
    labelCache.clear();
    thumbnailCache.clear();
  }

  /**
   * Invalidate caches for a specific project
   */
  static invalidateProject(projectId: string): void {
    projectCache.invalidatePattern(`project:${projectId}*`);
    labelCache.invalidatePattern(`project:${projectId}:*`);
  }

  /**
   * Invalidate caches for a specific label
   */
  static invalidateLabel(labelId: string): void {
    labelCache.invalidate(`label:${labelId}`);
    thumbnailCache.invalidatePattern(`thumbnail:${labelId}:*`);
  }

  /**
   * Get auth headers for API requests
   */
  private static getAuthHeaders(token?: string | null): Record<string, string> {
    const authToken = token || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const localToken = localStorage.getItem('auth_token');
    const sessionToken = sessionStorage.getItem('auth_token');
    const hasToken = !!(localToken || sessionToken);
    
    return hasToken;
  }

  /**
   * Handle API response errors
   */
  private static handleApiError(response: Response, url: string): void {
    if (response.status === 401) {
      console.warn(`🔒 Authentication required for ${url}. User needs to log in.`);
      // Clear invalid tokens
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      // Don't throw error for 401s to prevent request loops
      throw new Error('AUTHENTICATION_REQUIRED');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

/**
 * React hooks for optimized workspace data
 */

export function useOptimizedProjects(options: {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
} = {}) {
  const { page = 1, limit = 10, search = '', enabled = true } = options;
  
  // Check if user is authenticated
  const isAuthenticated = OptimizedWorkspaceService.isAuthenticated();
  
  return useOptimizedRequest(
    `projects:${page}:${limit}:${search}`,
    () => OptimizedWorkspaceService.getProjects({ page, limit, search }),
    projectCache,
    { enabled: enabled && isAuthenticated, dependencies: [page, limit, search] }
  );
}

export function useOptimizedProject(projectId: string, enabled = true) {
  // Check if user is authenticated
  const isAuthenticated = OptimizedWorkspaceService.isAuthenticated();
  
  return useOptimizedRequest(
    `project:${projectId}`,
    () => OptimizedWorkspaceService.getProject(projectId),
    projectCache,
    { enabled: enabled && !!projectId && isAuthenticated, dependencies: [projectId] }
  );
}

export function useOptimizedProjectLabels(projectId: string, enabled = true) {
  // Check if user is authenticated
  const isAuthenticated = OptimizedWorkspaceService.isAuthenticated();
  
  return useOptimizedRequest(
    `project:${projectId}:labels`,
    () => OptimizedWorkspaceService.getProjectLabels(projectId),
    labelCache,
    { enabled: enabled && !!projectId && isAuthenticated, dependencies: [projectId] }
  );
}

export function useOptimizedLabel(labelId: string, enabled = true) {
  // Check if user is authenticated
  const isAuthenticated = OptimizedWorkspaceService.isAuthenticated();
  
  return useOptimizedRequest(
    `label:${labelId}`,
    () => OptimizedWorkspaceService.getLabel(labelId),
    labelCache,
    { enabled: enabled && !!labelId && isAuthenticated, dependencies: [labelId] }
  );
}

export function useOptimizedThumbnail(labelId: string, size: 'sm' | 'md' | 'lg' = 'md', enabled = true) {
  // Don't use React auth context here - it causes infinite re-renders
  // Instead, get auth status from the service directly
  const isAuthenticated = OptimizedWorkspaceService.isAuthenticated();
  
  return useOptimizedRequest(
    `thumbnail:${labelId}:${size}`,
    () => OptimizedWorkspaceService.getThumbnailUrl(labelId, size),
    thumbnailCache,
    { 
      enabled: enabled && !!labelId && isAuthenticated, 
      dependencies: [labelId, size], // Remove auth-related dependencies that cause loops
      ttl: 10 * 60 * 1000 // 10 minutes
    }
  );
}
