'use client';

import { LabelEditorNew } from '../../../features/label-editor';
import { use } from 'react';

export default function NewLabelPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = use(searchParams);

  return (
    <div className="min-h-screen">
      <LabelEditorNew projectId={projectId} />
    </div>
  );
}
