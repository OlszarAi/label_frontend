import React from 'react';

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  sortField: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateProject: () => void;
  totalCount?: number;
}

export function ProjectFilters({
  searchTerm,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateProject,
  totalCount = 0
}: ProjectFiltersProps) {
  return (
    <div className="projects-filters">
      <div className="projects-filters-row">
        <div className="projects-search-group">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="projects-search-input"
          />
          
          <div className="projects-sort-group">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [
                  'name' | 'createdAt' | 'updatedAt',
                  'asc' | 'desc'
                ];
                onSortChange(field, order);
              }}
              className="projects-sort-select"
            >
              <option value="updatedAt-desc">Latest Updated</option>
              <option value="updatedAt-asc">Oldest Updated</option>
              <option value="createdAt-desc">Newest Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        <div className="projects-view-toggles">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`projects-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z"/>
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`projects-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            title="List view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </button>
        </div>

        <div className="projects-actions">
          <button
            onClick={onCreateProject}
            className="projects-create-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Project
          </button>
        </div>

        <div className="projects-count">
          {totalCount} project{totalCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
