'use client';

import { LabelEditor } from '../../../features/label-editor';
import { use } from 'react';

export default function EditorPage({ params }: { params: Promise<{ labelId: string }> }) {
  const { labelId } = use(params);
  
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <LabelEditor labelId={labelId} />
    </div>
  );
}
