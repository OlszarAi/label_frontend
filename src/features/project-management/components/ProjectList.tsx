import React from 'react';
import { Project } from '../types/project.types';
import { ProjectCard } from './ProjectCard';
import { ProjectListItem } from './ProjectListItem';

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onProjectClick: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  loading?: boolean;
}

export function ProjectList({ 
  projects, 
  viewMode, 
  onProjectClick, 
  onEditProject, 
  onDeleteProject,
  loading = false 
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="projects-loading">
        <div className="projects-spinner"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="projects-empty">
        <div className="projects-empty-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="projects-empty-title">No projects yet</h3>
        <p className="projects-empty-description">
          Create your first project to get started with organizing your labels and managing your workflow.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
            onEdit={() => onEditProject(project)}
            onDelete={() => onDeleteProject(project.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="projects-list">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          onEdit={() => onEditProject(project)}
          onDelete={() => onDeleteProject(project.id)}
        />
      ))}
    </div>
  );
}
