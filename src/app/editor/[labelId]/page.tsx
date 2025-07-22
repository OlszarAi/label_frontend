'use client';
import { LabelEditor } from '../../../features/label-editor';
import { use } from 'react';

export default function LabelEditorPage({ 
  params 
}: { 
  params: Promise<{ labelId: string }> 
}) {
  const { labelId } = use(params);
  return <LabelEditor labelId={labelId} />;
}
