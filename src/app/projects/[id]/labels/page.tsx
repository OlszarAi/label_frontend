'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { Label } from '@/features/project-management/types/project.types';
import { LabelList } from '@/features/project-management/components/LabelList';
import { LabelFilters } from '@/features/project-management/components/LabelFilters';
import { ExportButton, ExportModal } from '@/features/label-export';
import '@/features/project-management/styles/projects.css';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Filter and sort labels
  const filteredAndSortedLabels = React.useMemo(() => {
    const filtered = labels.filter((label: Label) =>
      label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (label.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort labels
    const sorted = [...filtered].sort((a: Label, b: Label) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
        case 'updatedAt':
          aValue = new Date(a[sortField]);
          bValue = new Date(b[sortField]);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [labels, searchTerm, sortField, sortOrder]);

  const handleCreateLabel = () => {
    // Navigate to label editor with project context
    router.push(`/editor/new?projectId=${projectId}`);
  };

  const handleEditLabel = (label: Label) => {
    // Navigate to label editor with label data
    router.push(`/editor/${label.id}`);
  };

  const handleLabelClick = (label: Label) => {
    // Navigate to label editor 
    router.push(`/editor/${label.id}`);
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
          {/* Filters */}
          <LabelFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateLabel={handleCreateLabel}
            onBackToProjects={handleBackToProjects}
            projectName={currentProject?.name}
            totalCount={filteredAndSortedLabels.length}
          />

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

          {/* Labels List */}
          {currentProject && (
            <LabelList
              labels={filteredAndSortedLabels}
              viewMode={viewMode}
              onLabelClick={handleLabelClick}
              onEditLabel={handleEditLabel}
              onDeleteLabel={(labelId) => setDeleteConfirm(labelId)}
              onAddNewLabel={handleCreateLabel}
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
