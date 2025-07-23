/**
 * Main hook for managing editor state and label operations
 * This is a wrapper around the new integrated editor state for backwards compatibility
 */

'use client';

import { useIntegratedEditorState } from './useIntegratedEditorState';

export const useEditorState = (labelId?: string, projectId?: string) => {
  return useIntegratedEditorState(labelId, projectId);
};
