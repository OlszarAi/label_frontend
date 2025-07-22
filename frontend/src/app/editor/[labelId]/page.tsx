'use client';

import { LabelEditorNew } from '../../../features/label-editor';
import { use } from 'react';

export default function LabelEditorPage({ params }: { params: Promise<{ labelId: string }> }) {
  const { labelId } = use(params);

  return (
    <div className="min-h-screen">
      <LabelEditorNew labelId={labelId} />
    </div>
  );
}
