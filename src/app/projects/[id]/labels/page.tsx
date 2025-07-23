'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { Label } from '@/features/project-management/types/project.types';
import ImprovedLabelGallery from '@/features/project-management/components/ImprovedLabelGallery';
import { ExportButton, ExportModal } from '@/features/label-export';
import '@/features/project-management/styles/projects.css';
import '@/features/project-management/styles/improved-gallery.css';
import '@/features/project-management/styles/quick-templates.css';
import '@/features/project-management/styles/size-comparator.css';

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
      router.push('/login');
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

  const handleBackToProjects = () => {
    router.push('/projects');
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

      <div className="projects-content">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="projects-header"
        >
          <div className="projects-header-container">
            <div className="projects-header-left">
              {/* Breadcrumb Navigation */}
              <div style={{ 
                marginBottom: '1rem', 
                paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(55, 65, 81, 0.2)'
              }}>
                <nav style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#9ca3af', 
                  fontSize: '0.875rem' 
                }}>
                  <button
                    onClick={handleBackToProjects}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#9ca3af', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Projects
                  </button>
                  <span>/</span>
                  <span style={{ color: '#e2e8f0' }}>{currentProject?.name || 'Project'}</span>
                </nav>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
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
                <h1>{currentProject?.name || 'Project'} Labels</h1>
              </div>
              <p>{currentProject?.description || 'Manage labels in this project'}</p>
            </div>
            <div className="projects-header-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ExportButton
                  projectId={projectId}
                  variant="secondary"
                  size="md"
                  text="Eksportuj wszystkie"
                  onClick={() => setShowExportModal(true)}
                />
                <div className="projects-user-info">
                  Welcome back, {user?.firstName || user?.email}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="projects-main"
        >
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
