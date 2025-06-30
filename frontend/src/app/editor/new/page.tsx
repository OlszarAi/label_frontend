'use client';

import { LabelEditor } from '../../../features/label-editor';
import { useSearchParams } from 'next/navigation';

export default function NewLabelPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <LabelEditor projectId={projectId} />
    </div>
  );
}
