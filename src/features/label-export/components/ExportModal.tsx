'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useExport } from '../hooks/useExport';
import { PDFExportOptions, ExportFormat, ExportOptions } from '../types/export.types';
import { EXPORT_FORMATS, DEFAULT_EXPORT_OPTIONS } from '../constants/exportConstants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelIds?: string[];
  projectId: string;
  projectName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  labelIds,
  projectId,
  projectName = 'Projekt'
}) => {
  const { isExporting, progress, error, exportLabels, exportProjectLabels, resetState } = useExport();
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  const handleExport = async () => {
    if (labelIds && labelIds.length > 0) {
      await exportLabels(labelIds, projectId, options);
    } else {
      await exportProjectLabels(projectId, options);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      resetState();
      onClose();
    }
  };

  const labelCount = labelIds ? labelIds.length : 'wszystkie';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white dark:text-white">
            Eksport etykiet
          </h3>
          {!isExporting && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Informacje o eksporcie */}
          <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="font-medium text-blue-300">Projekt: {projectName}</span>
            </div>
            <div className="text-sm text-blue-200">
              Etykiety do eksportu: <span className="font-medium">{labelCount}</span>
            </div>
          </div>

          {/* Opcje eksportu */}
          {!isExporting && !progress && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format eksportu
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(EXPORT_FORMATS).map(([format, info]) => (
                    <label
                      key={format}
                      className={`
                        flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                        ${info.available 
                          ? 'hover:bg-gray-800 border-gray-600 text-white' 
                          : 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500'
                        }
                        ${options.format === format && info.available
                          ? 'border-blue-500 bg-blue-900/20'
                          : ''
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={options.format === format}
                        disabled={!info.available}
                        onChange={(e) => setOptions(prev => ({ 
                          ...prev, 
                          format: e.target.value as ExportFormat
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {info.name}
                          </span>
                          {!info.available && (
                            <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {info.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opcje PDF */}
              {options.format === 'pdf' && (
                <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg space-y-3">
                  <h4 className="font-medium text-white">Opcje PDF</h4>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.includeBackground}
                        onChange={(e) => setOptions(prev => ({ 
                          ...prev, 
                          includeBackground: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Dołącz tło etykiet</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Margines (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={(options as PDFExportOptions).margin || 0}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        margin: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress i status */}
          <AnimatePresence>
            {(isExporting || progress) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {progress?.labelName || 'Przygotowywanie...'}
                    </span>
                    <span className="text-gray-400">
                      {progress?.currentLabel || 0} / {progress?.totalLabels || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress?.totalLabels ? (progress.currentLabel / progress.totalLabels) * 100 : 0}%`
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${progress?.totalLabels ? (progress.currentLabel / progress.totalLabels) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                {progress?.status === 'complete' && (
                  <div className="flex items-center gap-2 text-green-300 bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Eksport zakończony pomyślnie!</span>
                  </div>
                )}

                {progress?.status === 'error' && (
                  <div className="flex items-center gap-2 text-red-300 bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Wystąpił błąd podczas eksportu</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-300">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="font-medium">Błąd eksportu</span>
              </div>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
              className="flex-1"
            >
              {progress?.status === 'complete' ? 'Zamknij' : 'Anuluj'}
            </Button>
            
            {!progress?.status && (
              <Button
                onClick={handleExport}
                disabled={isExporting || !EXPORT_FORMATS[options.format].available}
                className="flex-1"
              >
                {isExporting ? 'Eksportuję...' : 'Rozpocznij eksport'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
