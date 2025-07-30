import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Label } from '../services/labelManagementService';

interface UseLabelActionsProps {
  saveLabel: (isManualSave?: boolean) => Promise<boolean>;
  currentLabel: { id: string; name: string; projectId: string } | null;
  refreshLabelThumbnail: (id: string) => Promise<void>;
  refreshLabelThumbnailImmediate?: (id: string) => Promise<void>;
  switchToLabel: (id: string) => Promise<void>;
  createLabelAndNavigate: () => Promise<Label | null>;
  hasUnsavedChanges: boolean;
  autoSave: boolean;
  onLabelCreated?: (label: Label) => void;
}

export const useLabelActions = ({
  saveLabel,
  currentLabel,
  refreshLabelThumbnail,
  refreshLabelThumbnailImmediate,
  switchToLabel,
  createLabelAndNavigate,
  hasUnsavedChanges,
  autoSave
}: UseLabelActionsProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Enhanced save function for manual saves (shows toast)
  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple concurrent saves
    
    setIsSaving(true);
    try {
      // Pass true to indicate this is a manual save
      const result = await saveLabel(true);
      if (result && currentLabel) {
        // Use immediate refresh for manual saves
        if (refreshLabelThumbnailImmediate) {
          await refreshLabelThumbnailImmediate(currentLabel.id);
        } else {
          await refreshLabelThumbnail(currentLabel.id);
        }
        toast.success('Label saved successfully');
      } else {
        toast.error('Failed to save label');
      }
      return result;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save label');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [saveLabel, currentLabel, refreshLabelThumbnail, refreshLabelThumbnailImmediate, isSaving]);

  // Silent save function for autosave (no toast, optimized for frequent calls)
  const handleAutoSave = useCallback(async () => {
    if (isSaving) return false; // Prevent conflicts with manual saves
    
    try {
      // Pass false to indicate this is an auto-save
      const result = await saveLabel(false);
      if (result && currentLabel) {
        // Update thumbnail more frequently for autosaves, but still optimized
        // Update every 3rd autosave or every 10 seconds (whichever comes first)
        const shouldUpdateThumbnail = Math.random() < 0.6; // 60% chance
        if (shouldUpdateThumbnail) {
          // Use setTimeout to not block the save operation
          setTimeout(() => {
            refreshLabelThumbnail(currentLabel.id).catch(console.error);
          }, 200);
        }
      }
      return result;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    }
  }, [saveLabel, currentLabel, refreshLabelThumbnail, isSaving]);

  const handleBack = useCallback(() => {
    const projectId = currentLabel?.projectId;
    
    if (hasUnsavedChanges && !autoSave) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        if (projectId) {
          router.push(`/projects/${projectId}/labels`);
        } else {
          router.push('/projects');
        }
      }
    } else {
      if (projectId) {
        router.push(`/projects/${projectId}/labels`);
      } else {
        router.push('/projects');
      }
    }
  }, [router, hasUnsavedChanges, autoSave, currentLabel?.projectId]);

  const handlePreview = useCallback(() => {
    toast.info('Preview functionality coming soon');
  }, []);

  const handleShare = useCallback(() => {
    toast.info('Share functionality coming soon');
  }, []);

  // Updated label selection using the safe switching function
  const handleLabelSelect = useCallback(async (selectedLabelId: string) => {
    if (hasUnsavedChanges && !autoSave) {
      if (!confirm('You have unsaved changes. Continue anyway?')) {
        return;
      }
    }

    try {
      // Use the safe switching function from useEditorState
      await switchToLabel(selectedLabelId);
      toast.success('Label switched successfully');
    } catch (error) {
      console.error('Error switching label:', error);
      toast.error('Failed to switch label');
    }
  }, [hasUnsavedChanges, autoSave, switchToLabel]);

  const handleCreateLabel = useCallback(async () => {
    if (currentLabel?.projectId && !isCreatingLabel) {
      setIsCreatingLabel(true);
      try {
        // Use createLabelAndNavigate to automatically navigate to the new label
        const newLabel = await createLabelAndNavigate();
        if (newLabel) {
          toast.success('New label created - navigating to editor');
          // The onLabelCreated callback will handle updating the UI
          // Navigation is handled by createLabelAndNavigate
        }
      } catch (error) {
        console.error('Failed to create label:', error);
        toast.error('Failed to create label');
      } finally {
        // Add small delay to prevent rapid clicking
        setTimeout(() => setIsCreatingLabel(false), 1000);
      }
    }
  }, [currentLabel?.projectId, createLabelAndNavigate, isCreatingLabel]);

  return {
    handleSave,
    handleAutoSave,
    handleBack,
    handlePreview,
    handleShare,
    handleLabelSelect,
    handleCreateLabel,
    isSaving,
    isCreatingLabel
  };
}; 