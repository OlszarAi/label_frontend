import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Label {
  id: string;
  name: string;
  projectId: string;
}

interface UseLabelActionsProps {
  saveLabel: () => Promise<boolean>;
  currentLabel: Label | null;
  refreshLabelThumbnail: (id: string) => Promise<void>;
  refreshLabelThumbnailImmediate?: (id: string) => Promise<void>;
  switchToLabel: (id: string) => Promise<void>;
  createLabelAndNavigate: () => Promise<Label | null>;
  hasUnsavedChanges: boolean;
  autoSave: boolean;
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

  // Enhanced save function for manual saves (shows toast)
  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple concurrent saves
    
    setIsSaving(true);
    try {
      const result = await saveLabel();
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
      const result = await saveLabel();
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
    if (hasUnsavedChanges && !autoSave) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  }, [router, hasUnsavedChanges, autoSave]);

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
    if (currentLabel?.projectId) {
      try {
        const newLabel = await createLabelAndNavigate();
        if (newLabel) {
          // The createLabelAndNavigate function handles navigation
          toast.success('New label created');
        }
      } catch (error) {
        console.error('Failed to create label:', error);
        toast.error('Failed to create label');
      }
    }
  }, [currentLabel?.projectId, createLabelAndNavigate]);

  return {
    handleSave,
    handleAutoSave,
    handleBack,
    handlePreview,
    handleShare,
    handleLabelSelect,
    handleCreateLabel,
    isSaving
  };
}; 