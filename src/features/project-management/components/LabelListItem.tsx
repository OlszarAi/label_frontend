import React from 'react';
import Image from 'next/image';
import { Label } from '../types/project.types';

interface LabelListItemProps {
  label: Label;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LabelListItem({ label, onClick, onEdit, onDelete }: LabelListItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="projects-list-item" onClick={onClick}>
      <div className="projects-list-item-content">
        {/* Left side - Icon and info */}
        <div className="projects-list-item-info">
          <div className="projects-list-item-icon">
            {label.thumbnail ? (
              <Image 
                src={label.thumbnail} 
                alt={label.name}
                width={40}
                height={30}
                className="projects-list-item-thumbnail"
              />
            ) : (
              <div className="projects-list-item-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="projects-list-item-details">
            <div className="projects-list-item-title">{label.name}</div>
            <div className="projects-list-item-subtitle">
              {label.description || 'No description'}
            </div>
          </div>
        </div>

        {/* Center - Meta info */}
        <div className="projects-list-item-meta">
          <div className="projects-list-item-meta-row">
            <span className="projects-list-item-dimensions">
              {label.width} × {label.height} mm
            </span>
          </div>
          <div className="projects-list-item-meta-row">
            <span className="projects-list-item-version">v{label.version}</span>
            <span className="projects-list-item-date">{formatDate(label.updatedAt)}</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="projects-list-item-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="projects-action-btn"
            title="Edit label"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="projects-action-btn projects-action-btn-danger"
            title="Delete label"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
