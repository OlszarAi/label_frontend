'use client';

import { LabelEditor } from '@/features/label-editor';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <LabelEditor />
    </ProtectedRoute>
  );
}
