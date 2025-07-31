/**
 * Asset Upload Modal
 * Modal for uploading and managing user graphics/logos
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useUserAssets } from '../../hooks/useUserAssets';

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetUploaded?: (assets: unknown[]) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const AssetUploadModal: React.FC<AssetUploadModalProps> = ({
  isOpen,
  onClose,
  onAssetUploaded,
}) => {
  const { uploadAsset, uploadProgress } = useUserAssets();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Niewspierany typ pliku. Wybierz PNG, JPEG, WebP lub SVG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Plik jest za duży. Maksymalny rozmiar to 5MB.';
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const names: Record<string, string> = { ...fileNames };

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
        // Default name is filename without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        names[file.name] = nameWithoutExt;
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFileNames(names);
  }, [fileNames]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[fileName];
      return newNames;
    });
  }, []);

  const updateFileName = useCallback((fileName: string, newName: string) => {
    setFileNames(prev => ({ ...prev, [fileName]: newName }));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedAssets = [];

    try {
      for (const file of selectedFiles) {
        const name = fileNames[file.name] || file.name;
        const asset = await uploadAsset(file, name);
        if (asset) {
          uploadedAssets.push(asset);
        }
      }

      onAssetUploaded?.(uploadedAssets);
      setSelectedFiles([]);
      setFileNames({});
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, fileNames, uploadAsset, onAssetUploaded, onClose]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return PhotoIcon;
    return DocumentIcon;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Importuj Grafiki
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Przeciągnij pliki tutaj
                </h3>
                <p className="text-gray-500 mb-4">
                  lub kliknij aby wybrać pliki
                </p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Wybierz pliki
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={handleFileInput}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-4">
                  PNG, JPEG, WebP, SVG • Maksymalnie 5MB na plik
                </p>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Wybrane pliki ({selectedFiles.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      const progress = uploadProgress.find((p: { file: File }) => p.file === file);
                      
                      return (
                        <div
                          key={file.name}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <FileIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                          
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={fileNames[file.name] || ''}
                              onChange={(e) => updateFileName(file.name, e.target.value)}
                              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1"
                              placeholder="Nazwa grafiki..."
                            />
                            <p className="text-xs text-gray-500">
                              {file.name} • {formatFileSize(file.size)}
                            </p>
                          </div>

                          {progress && (
                            <div className="flex items-center gap-2">
                              {progress.status === 'uploading' && (
                                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              )}
                              {progress.status === 'success' && (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              )}
                              {progress.status === 'error' && (
                                <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          )}

                          {!progress && (
                            <button
                              onClick={() => removeFile(file.name)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {selectedFiles.length > 0 && `${selectedFiles.length} plik(ów) wybranych`}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Wysyłanie...' : 'Importuj'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
