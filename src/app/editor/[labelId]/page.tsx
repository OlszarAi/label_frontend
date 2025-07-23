'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LabelEditor } from '../../../features/label-editor';
import { use } from 'react';

function LabelEditorContent({ labelId }: { labelId: string }) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  return <LabelEditor labelId={labelId} projectId={projectId} />;
}

export default function LabelEditorPage({ 
  params 
}: { 
  params: Promise<{ labelId: string }> 
}) {
  const { labelId } = use(params);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LabelEditorContent labelId={labelId} />
    </Suspense>
  );
}
