/**
 * User Asset Service
 * Handles API calls for user-uploaded graphics/logos
 */

export interface UserAsset {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface AssetStats {
  totalAssets: number;
  totalSize: number;
  byMimeType: Record<string, number>;
}

class UserAssetService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private getAuthHeaders(): Headers {
    const headers = new Headers({
      'Accept': 'application/json',
    });

    // Get token from localStorage - use the same key as useAuth
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Generate proxy URL for asset image to avoid CORS issues
   */
  private getProxyUrl(assetId: string): string {
    return `${this.baseUrl}/api/assets/${assetId}/proxy`;
  }

  /**
   * Upload a new user asset
   */
  async uploadAsset(file: File, name: string): Promise<UserAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await fetch(`${this.baseUrl}/api/assets/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Failed to upload asset');
    }

    const result = await response.json();
    // Replace URL with proxy URL to avoid CORS issues
    return {
      ...result.data,
      url: this.getProxyUrl(result.data.id)
    };
  }

  /**
   * Get all user assets
   */
  async getUserAssets(): Promise<UserAsset[]> {
    const response = await fetch(`${this.baseUrl}/api/assets`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch assets' }));
      throw new Error(error.error || 'Failed to fetch assets');
    }

    const result = await response.json();
    // Replace URLs with proxy URLs to avoid CORS issues
    return result.data.map((asset: UserAsset) => ({
      ...asset,
      url: this.getProxyUrl(asset.id)
    }));
  }

  /**
   * Get single user asset
   */
  async getUserAsset(assetId: string): Promise<UserAsset> {
    const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch asset' }));
      throw new Error(error.error || 'Failed to fetch asset');
    }

    const result = await response.json();
    // Replace URL with proxy URL to avoid CORS issues
    return {
      ...result.data,
      url: this.getProxyUrl(result.data.id)
    };
  }

  /**
   * Update user asset name
   */
  async updateUserAsset(assetId: string, updates: { name?: string }): Promise<UserAsset> {
    const headers = this.getAuthHeaders();
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update asset' }));
      throw new Error(error.error || 'Failed to update asset');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete user asset
   */
  async deleteUserAsset(assetId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete asset' }));
      throw new Error(error.error || 'Failed to delete asset');
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<AssetStats> {
    const response = await fetch(`${this.baseUrl}/api/assets/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch stats' }));
      throw new Error(error.error || 'Failed to fetch stats');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Upload multiple assets with progress tracking
   */
  async uploadMultipleAssets(
    files: Array<{ file: File; name: string }>,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UserAsset[]> {
    const results: UserAsset[] = [];

    for (let i = 0; i < files.length; i++) {
      const { file, name } = files[i];
      
      try {
        onProgress?.(i, 0);
        const asset = await this.uploadAsset(file, name);
        results.push(asset);
        onProgress?.(i, 100);
      } catch (error) {
        onProgress?.(i, -1); // Error indicator
        throw error;
      }
    }

    return results;
  }
}

export const userAssetService = new UserAssetService();
