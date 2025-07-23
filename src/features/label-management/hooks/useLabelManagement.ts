/**
 * Hook do zarządzania etykietami
 * Zapewnia jednolity interfejs do wszystkich operacji na etykietach
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LabelManagementService, Label, CreateLabelRequest } from '../services/labelManagementService';

interface UseLabelManagementOptions {
  projectId?: string;
  onLabelCreated?: (label: Label) => void;
  onLabelDuplicated?: (label: Label) => void;
  onError?: (error: string) => void;
}

export const useLabelManagement = (options: UseLabelManagementOptions = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const router = useRouter();

  const { projectId, onLabelCreated, onLabelDuplicated, onError } = options;

  /**
   * Tworzy nową etykietę bez nawigacji
   * Idealny dla list projektów gdzie nie chcemy przenosić użytkownika do edytora
   */
  const createLabel = useCallback(async (data: CreateLabelRequest = {}): Promise<Label | null> => {
    if (!projectId) {
      const error = 'Project ID is required';
      onError?.(error);
      toast.error(error);
      return null;
    }

    if (isCreating) {
      return null; // Prevent double-clicks
    }

    setIsCreating(true);
    try {
      const label = await LabelManagementService.createLabel(projectId, data);
      
      onLabelCreated?.(label);
      toast.success('Label created successfully');
      
      return label;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create label';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, onLabelCreated, onError, isCreating]);

  /**
   * Tworzy nową etykietę i nawiguje do edytora
   * Idealny dla przycisku "New Label" w edytorze
   */
  const createLabelAndNavigate = useCallback(async (data: CreateLabelRequest = {}): Promise<Label | null> => {
    if (!projectId) {
      const error = 'Project ID is required';
      onError?.(error);
      toast.error(error);
      return null;
    }

    if (isCreating) {
      return null;
    }

    setIsCreating(true);
    try {
      const { label, editorUrl } = await LabelManagementService.createLabelAndGetEditorUrl(projectId, data);
      
      onLabelCreated?.(label);
      toast.success('Label created successfully');
      
      // Navigate to editor
      router.push(editorUrl);
      
      return label;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create label';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, onLabelCreated, onError, router, isCreating]);

  /**
   * Duplikuje istniejącą etykietę
   */
  const duplicateLabel = useCallback(async (labelId: string): Promise<Label | null> => {
    if (isDuplicating) {
      return null;
    }

    setIsDuplicating(true);
    try {
      const label = await LabelManagementService.duplicateLabel(labelId);
      
      onLabelDuplicated?.(label);
      toast.success('Label duplicated successfully');
      
      return label;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate label';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsDuplicating(false);
    }
  }, [onLabelDuplicated, onError, isDuplicating]);

  /**
   * Duplikuje etykietę i nawiguje do edytora
   */
  const duplicateLabelAndNavigate = useCallback(async (labelId: string): Promise<Label | null> => {
    if (isDuplicating) {
      return null;
    }

    setIsDuplicating(true);
    try {
      const label = await LabelManagementService.duplicateLabel(labelId);
      
      onLabelDuplicated?.(label);
      toast.success('Label duplicated successfully');
      
      // Navigate to editor with duplicated label
      router.push(`/editor/${label.id}`);
      
      return label;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate label';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsDuplicating(false);
    }
  }, [onLabelDuplicated, onError, router, isDuplicating]);

  /**
   * Tworzy etykietę z szablonu
   */
  const createFromTemplate = useCallback(async (templateData: {
    name?: string;
    width: number;
    height: number;
    fabricData?: unknown;
    baseName?: string;
  }): Promise<Label | null> => {
    if (!projectId) {
      const error = 'Project ID is required';
      onError?.(error);
      toast.error(error);
      return null;
    }

    if (isCreating) {
      return null;
    }

    setIsCreating(true);
    try {
      const label = await LabelManagementService.createFromTemplate(projectId, templateData);
      
      onLabelCreated?.(label);
      toast.success('Label created from template successfully');
      
      return label;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create label from template';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, onLabelCreated, onError, isCreating]);

  /**
   * Tworzy wiele etykiet naraz
   */
  const createBulkLabels = useCallback(async (count: number, baseData: CreateLabelRequest = {}): Promise<Label[]> => {
    if (!projectId) {
      const error = 'Project ID is required';
      onError?.(error);
      toast.error(error);
      return [];
    }

    if (isCreating) {
      return [];
    }

    setIsCreating(true);
    try {
      const labels = await LabelManagementService.createBulkLabels(projectId, count, baseData);
      
      labels.forEach(label => onLabelCreated?.(label));
      toast.success(`${labels.length} labels created successfully`);
      
      return labels;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bulk labels';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsCreating(false);
    }
  }, [projectId, onLabelCreated, onError, isCreating]);

  /**
   * Prosty helper do tworzenia podstawowej etykiety
   */
  const createSimpleLabel = useCallback(async (): Promise<Label | null> => {
    return createLabel({
      width: 100,
      height: 50,
      fabricData: {
        version: '6.0.0',
        objects: [],
        background: '#ffffff'
      }
    });
  }, [createLabel]);

  return {
    // Actions
    createLabel,
    createLabelAndNavigate,
    duplicateLabel,
    duplicateLabelAndNavigate,
    createFromTemplate,
    createBulkLabels,
    createSimpleLabel,
    
    // State
    isCreating,
    isDuplicating,
  };
};
