'use client';

import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { ProjectProvider } from '@/features/project-management/context/ProjectContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { use } from 'react';

interface WorkspaceProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkspaceProjectPage({ params }: WorkspaceProjectPageProps) {
  const { id } = use(params); // Next.js 15 fix
  
  return (
    <ProtectedRoute>
      <ProjectProvider>
        <WorkspaceLayout projectId={id} />
      </ProjectProvider>
    </ProtectedRoute>
  );
}
