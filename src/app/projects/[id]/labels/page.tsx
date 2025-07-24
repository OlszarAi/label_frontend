'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { Label } from '@/features/project-management/types/project.types';
import ImprovedLabelGallery from '@/features/project-management/components/ImprovedLabelGallery';
import { ExportButton, ExportModal } from '@/features/label-export';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import '@/features/project-management/styles/projects.css';
import '@/features/project-management/styles/improved-gallery.css';
import '@/features/project-management/styles/quick-templates.css';
import '@/features/project-management/styles/size-comparator.css';
import '@/components/navigation/TopNavigation.css';

export default function ProjectLabelsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    currentProject,
    labels,
    isLoading,
    error,
    fetchProject,
    fetchProjectLabels,
    deleteLabel
  } = useProjects();

  // UI State
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Callback for when new label is created
  const handleLabelCreated = () => {
    // Refresh the labels list
    if (projectId) {
      fetchProjectLabels(projectId);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch project and labels on component mount
  useEffect(() => {
    if (isAuthenticated && token && projectId) {
      fetchProject(projectId);
      fetchProjectLabels(projectId);
    }
  }, [isAuthenticated, token, projectId, fetchProject, fetchProjectLabels]);

  // Refresh data when returning to the page (e.g., from editor)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && token && projectId) {
        fetchProjectLabels(projectId);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // Also listen for visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && token && projectId) {
        fetchProjectLabels(projectId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, token, projectId, fetchProjectLabels]);

  const handleCreateFromTemplate = (template: { width: number; height: number; name: string }) => {
    // Navigate to label editor with template data
    const params = new URLSearchParams({
      projectId,
      width: template.width.toString(),
      height: template.height.toString(),
      templateName: template.name
    });
    router.push(`/editor/new?${params.toString()}`);
  };

  const handleEditLabel = (label: Label) => {
    // Navigate to label editor with label data and project context
    router.push(`/editor/${label.id}?projectId=${projectId}`);
  };

  const handleLabelClick = (label: Label) => {
    // Navigate to label editor with project context
    router.push(`/editor/${label.id}?projectId=${projectId}`);
  };

  const handleDeleteLabel = async (labelId: string) => {
    const result = await deleteLabel(labelId);
    if (result.success) {
      setDeleteConfirm(null);
      // Refresh labels list
      if (projectId) {
        fetchProjectLabels(projectId);
      }
    } else {
      console.error('Failed to delete label:', result.error);
      alert('Failed to delete label. Please try again.');
    }
  };

  const handleBulkAction = async (action: string, labelIds: string[]) => {
    switch (action) {
      case 'delete':
        // Handle bulk delete
        for (const labelId of labelIds) {
          await deleteLabel(labelId);
        }
        if (projectId) {
          fetchProjectLabels(projectId);
        }
        break;
      case 'duplicate':
        // TODO: Implement bulk duplicate functionality
        console.log('Bulk duplicate:', labelIds);
        break;
      case 'export':
        // TODO: Implement bulk export functionality
        console.log('Bulk export:', labelIds);
        break;
      default:
        console.log('Unknown bulk action:', action);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="projects-page">
        <div className="projects-background">
          <div className="projects-background-grid"></div>
          <div className="projects-background-glow"></div>
        </div>
        <div className="projects-content">
          <div className="projects-loading">
            <div className="projects-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Background Elements */}
      <div className="projects-background">
        <div className="projects-background-grid"></div>
        <div className="projects-background-glow"></div>
      </div>

      {/* Top Navigation */}
      <TopNavigation
        title={`${currentProject?.name || 'Projekt'} - Etykiety`}
        subtitle={currentProject?.description || 'Zarządzaj etykietami w tym projekcie'}
        showBackButton={true}
        backHref="/projects"
        breadcrumbs={[
          { label: 'Strona główna', href: '/' },
          { label: 'Projekty', href: '/projects' },
          { label: currentProject?.name || 'Projekt' }
        ]}
      />

      <div className="projects-content">
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="projects-main"
        >
          {/* Project Info Card */}
          <div className="project-info-card" style={{
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {currentProject?.icon ? (
                <span style={{ fontSize: '2rem' }}>{currentProject.icon}</span>
              ) : (
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white', 
                    fontWeight: '700',
                    fontSize: '1.5rem',
                    backgroundColor: currentProject?.color || '#3B82F6' 
                  }}
                >
                  {currentProject?.name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
              <div>
                <h2 style={{ margin: 0, color: '#F3F4F6', fontSize: '1.25rem', fontWeight: '600' }}>
                  {currentProject?.name || 'Projekt'}
                </h2>
                <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.875rem' }}>
                  {labels.length} {labels.length === 1 ? 'etykieta' : 'etykiet'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ExportButton
                projectId={projectId}
                variant="secondary"
                size="md"
                text="Eksportuj wszystkie"
                onClick={() => setShowExportModal(true)}
              />
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="projects-error">
              <div className="projects-error-content">
                <svg className="projects-error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading for project data */}
          {isLoading && !currentProject && (
            <div className="projects-loading">
              <div className="projects-spinner"></div>
            </div>
          )}

          {/* Enhanced Label Gallery */}
          {currentProject && (
            <ImprovedLabelGallery
              labels={labels}
              projectId={projectId}
              onLabelClick={handleLabelClick}
              onEditLabel={handleEditLabel}
              onDeleteLabel={(labelId: string) => setDeleteConfirm(labelId)}
              onCreateFromTemplate={handleCreateFromTemplate}
              onBulkAction={handleBulkAction}
              onLabelCreated={handleLabelCreated}
              loading={isLoading}
            />
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="project-modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="delete-modal"
          >
            <div className="delete-modal-content">
              <div className="delete-modal-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="delete-modal-title">Delete Label</h3>
              <p className="delete-modal-message">
                Are you sure you want to delete this label? This action cannot be undone.
              </p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="delete-modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDeleteLabel(deleteConfirm)}
                  className="delete-modal-btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectId={projectId}
        projectName={currentProject?.name}
      />
    </div>
  );
}
