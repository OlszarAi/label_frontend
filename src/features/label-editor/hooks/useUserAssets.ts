/**
 * User Asset Management Hook
 * Provides functionality for managing user-uploaded graphics/logos
 */

import { useState, useEffect, useCallback } from 'react';
import { userAssetService, UserAsset, AssetStats } from '../../../services/userAsset.service';

export interface AssetUploadProgress {
  file: File;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  asset?: UserAsset;
}

export const useUserAssets = (autoLoad: boolean = true) => {
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<AssetUploadProgress[]>([]);

  /**
   * Load user assets
   */
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [assetsData, statsData] = await Promise.all([
        userAssetService.getUserAssets(),
        userAssetService.getAssetStats(),
      ]);
      
      setAssets(assetsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload single asset
   */
  const uploadAsset = useCallback(async (file: File, name: string): Promise<UserAsset | null> => {
    const progressItem: AssetUploadProgress = {
      file,
      name,
      progress: 0,
      status: 'uploading',
    };

    setUploadProgress(prev => [...prev, progressItem]);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file && item.status === 'uploading'
              ? { ...item, progress: Math.min(item.progress + 10, 90) }
              : item
          )
        );
      }, 200);

      const asset = await userAssetService.uploadAsset(file, name);

      clearInterval(progressInterval);

      // Update progress to success
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === file
            ? { ...item, progress: 100, status: 'success', asset }
            : item
        )
      );

      // Reload assets to get the new one
      await loadAssets();

      // Remove from progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.file !== file));
      }, 2000);

      return asset;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === file
            ? { ...item, progress: 0, status: 'error', error }
            : item
        )
      );

      // Remove error from progress after 3 seconds
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.file !== file));
      }, 3000);

      return null;
    }
  }, [loadAssets]);

  /**
   * Upload multiple assets
   */
  const uploadMultipleAssets = useCallback(async (
    files: Array<{ file: File; name: string }>
  ): Promise<UserAsset[]> => {
    const results: UserAsset[] = [];

    for (const { file, name } of files) {
      const asset = await uploadAsset(file, name);
      if (asset) {
        results.push(asset);
      }
    }

    return results;
  }, [uploadAsset]);

  /**
   * Delete asset
   */
  const deleteAsset = useCallback(async (assetId: string): Promise<boolean> => {
    try {
      await userAssetService.deleteUserAsset(assetId);
      await loadAssets(); // Reload assets
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      return false;
    }
  }, [loadAssets]);

  /**
   * Update asset name
   */
  const updateAsset = useCallback(async (
    assetId: string, 
    updates: { name?: string }
  ): Promise<boolean> => {
    try {
      await userAssetService.updateUserAsset(assetId, updates);
      await loadAssets(); // Reload assets
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
      return false;
    }
  }, [loadAssets]);

  /**
   * Get asset by ID
   */
  const getAsset = useCallback((assetId: string): UserAsset | undefined => {
    return assets.find(asset => asset.id === assetId);
  }, [assets]);

  /**
   * Filter assets by type
   */
  const filterAssetsByType = useCallback((mimeType: string): UserAsset[] => {
    return assets.filter(asset => asset.mimeType.startsWith(mimeType));
  }, [assets]);

  /**
   * Get images only
   */
  const getImageAssets = useCallback((): UserAsset[] => {
    return filterAssetsByType('image/');
  }, [filterAssetsByType]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear upload progress
   */
  const clearUploadProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  // Load assets on mount (conditionally)
  useEffect(() => {
    if (autoLoad) {
      loadAssets();
    }
  }, [loadAssets, autoLoad]);

  return {
    // Data
    assets,
    stats,
    uploadProgress,
    
    // State
    loading,
    error,
    
    // Actions
    loadAssets,
    uploadAsset,
    uploadMultipleAssets,
    deleteAsset,
    updateAsset,
    
    // Helpers
    getAsset,
    filterAssetsByType,
    getImageAssets,
    clearError,
    clearUploadProgress,
  };
};
