/**
 * User Assets Panel
 * Panel showing user's uploaded graphics/logos for easy access
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { FloatingPanel } from '../common/FloatingPanel';
import { useUserAssets } from '../../hooks/useUserAssets';
import { UserAsset } from '../../../../services/userAsset.service';

interface UserAssetsPanelProps {
  onAssetSelect?: (asset: UserAsset) => void;
  onImportClick?: () => void;
  isVisible: boolean;
  onClose?: () => void;
}

export const UserAssetsPanel: React.FC<UserAssetsPanelProps> = ({
  onAssetSelect,
  onImportClick,
  isVisible,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const { 
    loading, 
    error, 
    deleteAsset, 
    updateAsset,
    getImageAssets,
    clearError,
    loadAssets,
  } = useUserAssets(false); // Don't auto-load

  // Load assets when panel becomes visible (only try once per session, unless manually retried)
  useEffect(() => {
    if (isVisible && !hasAttemptedLoad && !loading && !error) {
      setHasAttemptedLoad(true);
      loadAssets();
    }
  }, [isVisible, hasAttemptedLoad, loading, error, loadAssets]);

  const imageAssets = getImageAssets();
  
  const filteredAssets = imageAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssetClick = useCallback((asset: UserAsset) => {
    onAssetSelect?.(asset);
  }, [onAssetSelect]);

  const handleEditStart = useCallback((asset: UserAsset) => {
    setEditingAsset(asset.id);
    setEditName(asset.name);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingAsset || !editName.trim()) return;
    
    const success = await updateAsset(editingAsset, { name: editName.trim() });
    if (success) {
      setEditingAsset(null);
      setEditName('');
    }
  }, [editingAsset, editName, updateAsset]);

  const handleEditCancel = useCallback(() => {
    setEditingAsset(null);
    setEditName('');
  }, []);

  const handleDeleteClick = useCallback((assetId: string) => {
    setDeleteConfirm(assetId);
  }, []);

  const handleDeleteConfirm = useCallback(async (assetId: string) => {
    const success = await deleteAsset(assetId);
    if (success) {
      setDeleteConfirm(null);
    }
  }, [deleteAsset]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  const headerActions = (
    <button
      onClick={onImportClick}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      title="Importuj nowe grafiki"
    >
      <PlusIcon className="w-3 h-3" />
      Import
    </button>
  );

  return (
    <FloatingPanel
      id="user-assets"
      title="Moje Grafiki"
      defaultPosition={{ x: 100, y: 100 }}
      defaultSize={{ width: 320, height: 500 }}
      minSize={{ width: 280, height: 300 }}
      maxSize={{ width: 500, height: 800 }}
      onClose={onClose}
      headerActions={headerActions}
      className="user-assets-panel"
    >
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj grafik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    clearError();
                    setHasAttemptedLoad(false);
                    loadAssets();
                  }}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Spróbuj ponownie
                </button>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && filteredAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-500 mb-3" />
            <h4 className="text-white font-medium mb-1">
              {searchTerm ? 'Nie znaleziono grafik' : 'Brak grafik'}
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm 
                ? 'Spróbuj zmienić frazy wyszukiwania'
                : 'Zaimportuj swoje logo i grafiki'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={onImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Importuj teraz
              </button>
            )}
          </div>
        )}

        {/* Assets Grid */}
        {!loading && !error && filteredAssets.length > 0 && (
          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-600 hover:border-gray-500"
                onClick={() => handleAssetClick(asset)}
              >
                {/* Asset Preview */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-600">
                    {asset.url ? (
                      <Image
                        src={asset.url}
                        alt={asset.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingAsset === asset.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSave();
                            }}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Zapisz
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCancel();
                            }}
                            className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded hover:bg-gray-500"
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-white text-sm truncate">
                          {asset.name}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {asset.fileName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(asset.fileSize)}
                          </span>
                          {asset.width && asset.height && (
                            <span className="text-xs text-gray-500">
                              {asset.width}×{asset.height}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingAsset !== asset.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(asset);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Edytuj nazwę"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(asset.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Usuń"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg max-w-sm mx-4"
            >
              <h4 className="font-semibold text-white mb-2">Usuń grafikę</h4>
              <p className="text-gray-300 text-sm mb-4">
                Czy na pewno chcesz usunąć tę grafikę? Tej operacji nie można cofnąć.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-sm hover:bg-gray-600"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deleteConfirm)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FloatingPanel>
  );
};
