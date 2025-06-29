import React from 'react';
import { Project } from '../types/project.types';

interface ProjectListItemProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectListItem({ project, onClick, onEdit, onDelete }: ProjectListItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="project-list-item" onClick={onClick}>
      <div className="project-list-item-content">
        {/* Project icon */}
        {project.icon ? (
          <div className="project-list-item-icon">
            {project.icon}
          </div>
        ) : (
          <div 
            className="project-list-item-icon default"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Project info */}
        <div className="project-list-item-details">
          <h3 className="project-list-item-title">
            {project.name}
          </h3>
          {project.description && (
            <p className="project-list-item-description">
              {project.description}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="project-list-item-meta">
          <span>{project._count?.labels || 0} labels</span>
          <span>Created {formatDate(project.createdAt)}</span>
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="project-list-item-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="project-card-btn"
            title="Edit project"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="project-card-btn delete"
            title="Delete project"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
