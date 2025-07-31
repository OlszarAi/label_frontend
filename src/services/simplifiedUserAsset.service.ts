/**
 * Simplified User Asset Service
 * Clean, unified service for frontend asset operations
 * Removes duplicates and provides better error handling
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
  url: string; // Always contains proxy URL for CORS-free access
}

export interface AssetStats {
  totalAssets: number;
  totalSize: number;
  byMimeType: Record<string, number>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class SimplifiedUserAssetService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Operation failed');
    }

    return result.data;
  }

  /**
   * Upload a new asset with progress tracking
   */
  async uploadAsset(
    file: File, 
    name: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UserAsset> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());

      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              onProgress(progress);
            }
          });
        }

        // Handle completion
        xhr.addEventListener('load', async () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                resolve(result.data);
              } else {
                reject(new Error(result.error || 'Upload failed'));
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          } catch {
            reject(new Error('Failed to parse server response'));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        // Set up request
        xhr.open('POST', `${this.baseUrl}/api/assets/upload`);
        
        // Add auth headers
        const token = localStorage.getItem('auth_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        // Start upload
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Upload asset error:', error);
      throw new Error(`Failed to upload asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all user assets
   */
  async getUserAssets(): Promise<UserAsset[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<UserAsset[]>(response);

    } catch (error) {
      console.error('Get user assets error:', error);
      throw new Error(`Failed to fetch assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get single asset details
   */
  async getAsset(assetId: string): Promise<UserAsset> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<UserAsset>(response);

    } catch (error) {
      console.error('Get asset error:', error);
      throw new Error(`Failed to fetch asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update asset metadata
   */
  async updateAsset(assetId: string, updates: { name?: string }): Promise<UserAsset> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      return await this.handleResponse<UserAsset>(response);

    } catch (error) {
      console.error('Update asset error:', error);
      throw new Error(`Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse<void>(response);

    } catch (error) {
      console.error('Delete asset error:', error);
      throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<AssetStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<AssetStats>(response);

    } catch (error) {
      console.error('Get asset stats error:', error);
      throw new Error(`Failed to fetch asset statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple assets with progress tracking
   */
  async uploadMultipleAssets(
    files: Array<{ file: File; name: string }>,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UserAsset[]> {
    const results: UserAsset[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const { file, name } = files[i];
      
      try {
        const asset = await this.uploadAsset(file, name, (progress) => {
          onProgress?.(i, progress);
        });
        results.push(asset);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files
        throw error; // Or handle this differently based on requirements
      }
    }

    return results;
  }

  /**
   * Get proxy URL for an asset (for direct use in img src)
   */
  getProxyUrl(assetId: string): string {
    return `${this.baseUrl}/api/assets/${assetId}/proxy`;
  }

  /**
   * Preload an asset image (useful for preventing loading delays)
   */
  async preloadAsset(assetId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to preload asset'));
      img.src = this.getProxyUrl(assetId);
    });
  }
}

// Export singleton instance
export const simplifiedUserAssetService = new SimplifiedUserAssetService();

// For backward compatibility, also export as default
export default simplifiedUserAssetService;
