'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/features/project-management/types/project.types';
import { ProjectList } from '@/features/project-management/components/ProjectList';
import { ProjectFilters } from '@/features/project-management/components/ProjectFilters';
import { ProjectForm } from '@/features/project-management/components/ProjectForm';
import '@/features/project-management/styles/projects.css';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjects();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch projects on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, token, fetchProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    const filtered = projects.filter((project: Project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort projects
    const sorted = [...filtered].sort((a: Project, b: Project) => {
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
  }, [projects, searchTerm, sortField, sortOrder]);

  const handleFormSubmit = async (projectData: CreateProjectRequest | UpdateProjectRequest) => {
    if (editingProject) {
      // Update existing project
      const result = await updateProject(editingProject.id, projectData as UpdateProjectRequest);
      if (result.success) {
        setEditingProject(null);
        fetchProjects();
      } else {
        console.error('Failed to update project:', result.error);
        alert('Failed to update project. Please try again.');
      }
    } else {
      // Create new project
      const result = await createProject(projectData as CreateProjectRequest);
      if (result.success) {
        setShowCreateForm(false);
        fetchProjects();
      } else {
        console.error('Failed to create project:', result.error);
        alert('Failed to create project. Please try again.');
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await deleteProject(projectId);
    if (result.success) {
      setDeleteConfirm(null);
      // Refresh projects list
      fetchProjects();
    } else {
      console.error('Failed to delete project:', result.error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleProjectClick = (project: Project) => {
    // Navigate to project labels page
    router.push(`/projects/${project.id}/labels`);
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
              <h1>Projects</h1>
              <p>Manage your label projects and organize your work</p>
            </div>
            <div className="projects-header-right">
              <div className="projects-user-info">
                Welcome back, {user?.firstName || user?.email}
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
          <ProjectFilters
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
            onCreateProject={() => setShowCreateForm(true)}
            totalCount={filteredAndSortedProjects.length}
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

          {/* Projects List */}
          <ProjectList
            projects={filteredAndSortedProjects}
            viewMode={viewMode}
            onProjectClick={handleProjectClick}
            onEditProject={(project) => setEditingProject(project)}
            onDeleteProject={(projectId) => setDeleteConfirm(projectId)}
            loading={isLoading}
          />
        </motion.div>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <ProjectForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowCreateForm(false)}
          loading={isLoading}
        />
      )}

      {/* Edit Project Form */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingProject(null)}
          loading={isLoading}
        />
      )}

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
              <h3 className="delete-modal-title">Delete Project</h3>
              <p className="delete-modal-message">
                Are you sure you want to delete this project? This action cannot be undone and will also delete all labels in this project.
              </p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="delete-modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteConfirm)}
                  className="delete-modal-btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
