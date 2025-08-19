"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  FileText, 
  Settings,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useExport } from '@/features/label-export/hooks/useExport';
import { PDFExportOptions } from '@/features/label-export/types/export.types';
import './bulk-export-modal.css';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelIds: string[];
  projectId: string;
  projectName?: string;
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  isOpen,
  onClose,
  labelIds,
  projectId,
  projectName = 'Projekt'
}) => {
  const { exportLabels, isExporting, progress, error, resetState } = useExport();
  
  // Export options state
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>({
    format: 'pdf',
    quality: 1.0,
    margin: 0
  });

  const handleExport = async () => {
    try {
      await exportLabels(labelIds, projectId, exportOptions);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.round((progress.currentLabel / progress.totalLabels) * 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="bulk-export-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bulk-export-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="export-header">
            <div className="header-content">
              <div className="header-icon">
                <Download size={24} />
              </div>
              <div className="header-text">
                <h2>Eksport etykiet</h2>
                <p>
                  Eksportuj {labelIds.length} etykiet z projektu &quot;{projectName}&quot;
                </p>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={handleClose}
              disabled={isExporting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="export-content">
            {/* Export Options */}
            <div className="export-section">
              <div className="section-header">
                <Settings size={18} />
                <h3>Ustawienia eksportu</h3>
              </div>
              
              <div className="options-grid">
                {/* Format */}
                <div className="option-group">
                  <label className="option-label">Format pliku</label>
                  <div className="format-options">
                    <button 
                      className={`format-btn ${exportOptions.format === 'pdf' ? 'active' : ''}`}
                      onClick={() => setExportOptions({...exportOptions, format: 'pdf'})}
                      disabled={isExporting}
                    >
                      <FileText size={16} />
                      PDF
                    </button>
                  </div>
                  <p className="option-hint">PDF to najlepszy format do druku etykiet</p>
                </div>

                {/* Quality */}
                <div className="option-group">
                  <label className="option-label">
                    Jakość ({Math.round((exportOptions.quality || 1) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={exportOptions.quality || 1}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      quality: parseFloat(e.target.value)
                    })}
                    className="option-range"
                    disabled={isExporting}
                  />
                  <div className="quality-labels">
                    <span>Niska</span>
                    <span>Wysoka</span>
                  </div>
                </div>

                {/* Print Options */}
                <div className="option-group">
                  <label className="option-label">Opcje druku</label>
                  <div className="checkbox-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeBackground || false}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeBackground: e.target.checked
                        })}
                        disabled={isExporting}
                      />
                      <span className="checkbox-text">Uwzględnij tło</span>
                    </label>
                  </div>
                </div>

                {/* Margin */}
                <div className="option-group">
                  <label className="option-label">
                    Margines ({exportOptions.margin}mm)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={exportOptions.margin}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      margin: parseFloat(e.target.value)
                    })}
                    className="option-range"
                    disabled={isExporting}
                  />
                </div>
              </div>
            </div>

            {/* Progress */}
            {(isExporting || progress) && (
              <div className="export-section">
                <div className="section-header">
                  <Loader2 size={18} className={isExporting ? 'spinning' : ''} />
                  <h3>Postęp eksportu</h3>
                </div>
                
                <div className="progress-content">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  
                  {progress && (
                    <div className="progress-details">
                      <div className="progress-text">
                        <span className="progress-label">{progress.labelName}</span>
                        <span className="progress-count">
                          {progress.currentLabel} z {progress.totalLabels}
                        </span>
                      </div>
                      <div className="progress-percentage">
                        {getProgressPercentage()}%
                      </div>
                    </div>
                  )}

                  {progress?.status === 'complete' && (
                    <div className="progress-complete">
                      <Check size={16} />
                      <span>Eksport zakończony pomyślnie!</span>
                    </div>
                  )}

                  {error && (
                    <div className="progress-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="export-footer">
            <div className="export-info">
              <p>
                Eksport może potrwać kilka minut w zależności od liczby etykiet i jakości.
              </p>
            </div>
            
            <div className="export-actions">
              <button 
                className="action-btn secondary"
                onClick={handleClose}
                disabled={isExporting}
              >
                {isExporting ? 'Anuluj' : 'Zamknij'}
              </button>
              <button 
                className="action-btn primary"
                onClick={handleExport}
                disabled={isExporting || labelIds.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    Eksportowanie...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Eksportuj ({labelIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
