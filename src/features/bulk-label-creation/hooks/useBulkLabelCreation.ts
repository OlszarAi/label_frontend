'use client';

import { useState, useCallback } from 'react';
import { BulkLabelService } from '../services/BulkLabelService';
import { BulkLabelDesign, BulkCreationOptions } from '../types/bulk-label.types';

interface UseBulkLabelCreationOptions {
  projectId: string;
  onSuccess?: (labels: Array<{id: string; name: string; uuid?: string}>) => void;
  onError?: (error: string) => void;
}

export const useBulkLabelCreation = ({
  projectId,
  onSuccess,
  onError
}: UseBulkLabelCreationOptions) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createBulkLabels = useCallback(async ({
    design,
    options
  }: {
    design: BulkLabelDesign;
    options: BulkCreationOptions;
  }) => {
    if (isCreating) return;

    setIsCreating(true);
    setProgress(0);

    try {
      console.log(`🏷️ Starting bulk creation - each label will be unique!`);
      
      // Prosta symulacja progresu
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);

      // Nowy system - każda etykieta tworzona osobno z unikalnym UUID
      const result = await BulkLabelService.createBulkLabels(projectId, {
        name: options.baseName,
        description: `Bulk created: ${options.quantity} labels`,
        width: design.width,
        height: design.height,
        fabricData: design.fabricData,
        count: options.quantity,
        thumbnail: design.thumbnail,
        qrPrefix: options.qrPrefix || '',
        uuidLength: options.uuidLength || 8
      });

      clearInterval(progressInterval);

      if (!result.success || !result.createdLabels) {
        throw new Error(result.error || 'Failed to create bulk labels');
      }

      setProgress(100);

      console.log(`✅ Successfully created ${result.createdLabels.length} unique labels!`);
      onSuccess?.(result.createdLabels);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bulk labels';
      console.error('❌ Bulk creation failed:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCreating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [projectId, isCreating, onSuccess, onError]);

  return {
    createBulkLabels,
    isCreating,
    progress
  };
};
