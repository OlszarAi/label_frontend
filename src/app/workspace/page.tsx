'use client';

import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { ProjectProvider } from '@/features/project-management/context/ProjectContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function WorkspacePage() {
  return (
    <ProtectedRoute>
      <ProjectProvider>
        <WorkspaceLayout />
      </ProjectProvider>
    </ProtectedRoute>
  );
}
