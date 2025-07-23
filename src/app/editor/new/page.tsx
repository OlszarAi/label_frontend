'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LabelEditor } from '../../../features/label-editor';

function NewEditorContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  return <LabelEditor projectId={projectId} />;
}

export default function NewEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewEditorContent />
    </Suspense>
  );
}
