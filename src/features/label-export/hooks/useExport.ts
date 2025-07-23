'use client';

import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { ExportOptions, ExportProgress, PDFExportOptions } from '../types/export.types';
import { exportService } from '../services/exportService';
import { generatePDFFromLabels } from '../utils/pdfGenerator';
import { DEFAULT_EXPORT_OPTIONS } from '../constants/exportConstants';

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset stanu
  const resetState = useCallback(() => {
    setIsExporting(false);
    setProgress(null);
    setError(null);
  }, []);

  // Eksport wybranych etykiet
  const exportLabels = useCallback(async (
    labelIds: string[],
    projectId: string,
    options: ExportOptions = DEFAULT_EXPORT_OPTIONS
  ) => {
    if (isExporting) {
      console.warn('Export already in progress');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setProgress({
        currentLabel: 0,
        totalLabels: labelIds.length,
        labelName: 'Przygotowywanie...',
        status: 'preparing'
      });

      // Walidacja
      const validation = exportService.validateExportRequest({
        labelIds,
        projectId,
        options
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Pobieranie danych etykiet
      setProgress(prev => prev ? {
        ...prev,
        labelName: 'Pobieranie danych etykiet...',
        status: 'preparing'
      } : null);

      const labelData = await exportService.getLabelExportData(labelIds);

      if (labelData.length === 0) {
        throw new Error('Nie znaleziono etykiet do eksportu');
      }

      // Generowanie eksportu w zależności od formatu
      let blob: Blob | null = null;
      let filename = '';

      if (options.format === 'pdf') {
        const pdfOptions = options as PDFExportOptions;
        blob = await generatePDFFromLabels(labelData, pdfOptions, setProgress);
        
        const projectName = await exportService.getProjectName(projectId);
        filename = exportService.generateFilename(projectName, labelData.length, 'pdf');
      } else {
        throw new Error(`Format ${options.format} nie jest jeszcze obsługiwany`);
      }

      if (!blob) {
        throw new Error('Nie udało się wygenerować pliku eksportu');
      }

      // Pobieranie pliku
      saveAs(blob, filename);

      setProgress({
        currentLabel: labelData.length,
        totalLabels: labelData.length,
        labelName: 'Eksport zakończony pomyślnie',
        status: 'complete'
      });

      // Reset po 2 sekundach
      setTimeout(resetState, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd eksportu';
      console.error('Export error:', err);
      setError(errorMessage);
      setProgress(prev => prev ? {
        ...prev,
        labelName: 'Błąd eksportu',
        status: 'error'
      } : null);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, resetState]);

  // Eksport wszystkich etykiet z projektu
  const exportProjectLabels = useCallback(async (
    projectId: string,
    options: ExportOptions = DEFAULT_EXPORT_OPTIONS
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress({
        currentLabel: 0,
        totalLabels: 0,
        labelName: 'Pobieranie listy etykiet...',
        status: 'preparing'
      });

      // Pobieranie wszystkich etykiet z projektu
      const labelData = await exportService.getProjectLabels(projectId);

      if (labelData.length === 0) {
        throw new Error('Projekt nie ma etykiet do eksportu');
      }

      const labelIds = labelData.map(label => label.id);
      
      // Użycie standardowej funkcji eksportu
      await exportLabels(labelIds, projectId, options);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd eksportu';
      console.error('Export project labels error:', err);
      setError(errorMessage);
      setIsExporting(false);
    }
  }, [exportLabels]);

  return {
    // Stan
    isExporting,
    progress,
    error,
    
    // Akcje
    exportLabels,
    exportProjectLabels,
    resetState
  };
};
