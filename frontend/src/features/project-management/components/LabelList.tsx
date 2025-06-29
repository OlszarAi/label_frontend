import React from 'react';
import { Label } from '../types/project.types';
import { LabelCard } from './LabelCard';
import { LabelListItem } from './LabelListItem';

interface LabelListProps {
  labels: Label[];
  viewMode: 'grid' | 'list';
  onLabelClick: (label: Label) => void;
  onEditLabel: (label: Label) => void;
  onDeleteLabel: (labelId: string) => void;
  loading?: boolean;
}

export function LabelList({ 
  labels, 
  viewMode, 
  onLabelClick, 
  onEditLabel, 
  onDeleteLabel,
  loading = false 
}: LabelListProps) {
  if (loading) {
    return (
      <div className="projects-loading">
        <div className="projects-loading-spinner">
          <div className="projects-spinner"></div>
        </div>
        <p>Loading labels...</p>
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="projects-empty-state">
        <div className="projects-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3>No labels found</h3>
        <p>Get started by creating your first label for this project.</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="projects-grid">
        {labels.map((label) => (
          <LabelCard
            key={label.id}
            label={label}
            onClick={() => onLabelClick(label)}
            onEdit={() => onEditLabel(label)}
            onDelete={() => onDeleteLabel(label.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="projects-list">
      {labels.map((label) => (
        <LabelListItem
          key={label.id}
          label={label}
          onClick={() => onLabelClick(label)}
          onEdit={() => onEditLabel(label)}
          onDelete={() => onDeleteLabel(label.id)}
        />
      ))}
    </div>
  );
}
