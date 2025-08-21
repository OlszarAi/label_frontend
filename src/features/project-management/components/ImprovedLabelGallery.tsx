'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartImage } from '../../../components/ui/SmartImage';
import { Label } from '../types/project.types';
import { QuickTemplates } from './QuickTemplates';
import { CreateLabelButton } from '@/features/label-management';
import '../styles/improved-gallery.css';

// Types for our enhanced gallery
interface GalleryFilters {
  search: string;
  sortBy: 'name' | 'size' | 'date' | 'dimensions';
  sortOrder: 'asc' | 'desc';
  viewDensity: 'compact' | 'comfortable' | 'spacious';
}

interface ImprovedLabelGalleryProps {
  labels: Label[];
  projectId: string;
  onEditLabel: (label: Label) => void;
  onDeleteLabel: (labelId: string) => void;
  onCreateFromTemplate?: (template: { width: number; height: number; name: string }) => void;
  onBulkAction?: (action: string, labelIds: string[]) => void;
  onLabelCreated?: () => void;
  loading?: boolean;
}

// Helper functions
const getLabelArea = (label: Label): number => {
  return label.width * label.height;
};

const formatDimensions = (width: number, height: number) => {
  return `${width}mm × ${height}mm`;
};

export function ImprovedLabelGallery({
  labels,
  projectId,
  onEditLabel,
  onDeleteLabel,
  onCreateFromTemplate,
  onBulkAction,
  onLabelCreated,
  loading = false
}: ImprovedLabelGalleryProps) {
  const [filters, setFilters] = useState<GalleryFilters>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    viewDensity: 'comfortable'
  });
  
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const [previewLabel, setPreviewLabel] = useState<Label | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Filter and sort labels
  const filteredLabels = useMemo(() => {
    const filtered = labels.filter(label => {
      // Search filter
      const matchesSearch = !filters.search || 
        label.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        label.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        label.description?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSearch;
    });

    // Sort labels
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = getLabelArea(a) - getLabelArea(b);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'dimensions':
          comparison = (a.width + a.height) - (b.width + b.height);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [labels, filters]);

  // Bulk selection handlers
  const toggleLabelSelection = (labelId: string) => {
    const newSelection = new Set(selectedLabels);
    if (newSelection.has(labelId)) {
      newSelection.delete(labelId);
    } else {
      newSelection.add(labelId);
    }
    setSelectedLabels(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const clearSelection = () => {
    setSelectedLabels(new Set());
    setShowBulkActions(false);
  };

  const handleBulkAction = (action: string) => {
    if (action === 'delete') {
      setShowBulkDeleteConfirm(true);
    } else if (onBulkAction && selectedLabels.size > 0) {
      onBulkAction(action, Array.from(selectedLabels));
      clearSelection();
    }
  };

  const confirmBulkDelete = () => {
    if (onBulkAction && selectedLabels.size > 0) {
      onBulkAction('delete', Array.from(selectedLabels));
      clearSelection();
    }
    setShowBulkDeleteConfirm(false);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteConfirm(false);
  };

  // Grid style based on density
  const getGridStyle = () => {
    const densityMap = {
      compact: 'repeat(auto-fill, minmax(250px, 1fr))',
      comfortable: 'repeat(auto-fill, minmax(320px, 1fr))',
      spacious: 'repeat(auto-fill, minmax(400px, 1fr))'
    };
    
    return {
      display: 'grid',
      gridTemplateColumns: densityMap[filters.viewDensity],
      gap: filters.viewDensity === 'compact' ? '1.5rem' : 
           filters.viewDensity === 'comfortable' ? '2rem' : '2.5rem',
      padding: '1rem 0',
      gridAutoRows: 'min-content'
    };
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="loading-card">
              <div className="loading-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="improved-label-gallery">
      {/* Enhanced Filters */}
      <div className="gallery-filters">
        <div className="filters-row">
          {/* Search */}
          <div className="search-enhanced">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Szukaj etykiet po nazwie lub opisie..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="search-input"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="search-clear"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="search-results">
              {filteredLabels.length} z {labels.length} etykiet
            </div>
          </div>

          {/* Sort Options */}
          <div className="sort-options">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as 'name' | 'size' | 'date' | 'dimensions', 
                  sortOrder: sortOrder as 'asc' | 'desc'
                }));
              }}
              className="sort-select"
            >
              <option value="date-desc">Ostatnio zaktualizowane</option>
              <option value="date-asc">Najstarsze zaktualizowane</option>
              <option value="name-asc">Nazwa A-Z</option>
              <option value="name-desc">Nazwa Z-A</option>
              <option value="size-desc">Największe najpierw</option>
              <option value="size-asc">Najmniejsze najpierw</option>
            </select>
          </div>
        </div>

        {/* View Options */}
        <div className="view-options">
          <div className="density-controls">
            <span className="density-label">Gęstość:</span>
            {(['compact', 'comfortable', 'spacious'] as const).map(density => (
              <button
                key={density}
                onClick={() => setFilters(prev => ({ ...prev, viewDensity: density }))}
                className={`density-btn ${filters.viewDensity === density ? 'active' : ''}`}
              >
                {density === 'compact' ? 'Kompaktowy' : density === 'comfortable' ? 'Wygodny' : 'Przestronny'}
              </button>
            ))}
          </div>

          <div className="view-toggles">
            <CreateLabelButton
              projectId={projectId}
              variant="secondary"
              size="md"
              onLabelCreated={onLabelCreated}
              className="create-label-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nowa etykieta
            </CreateLabelButton>

            {onCreateFromTemplate && (
              <button
                onClick={() => setShowTemplates(true)}
                className="template-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M9 3v18M3 9h18"/>
                </svg>
                Szablony
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar - Simple positioning */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="bulk-actions-bar"
          >
            <div className="bulk-info">
              <span>{selectedLabels.size} etykiet{selectedLabels.size !== 1 ? 'a' : 'ę'} zaznaczono</span>
              <button onClick={clearSelection} className="clear-selection">
                Wyczyść
              </button>
            </div>
            <div className="bulk-actions">
              <button onClick={() => handleBulkAction('duplicate')} className="bulk-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Duplikuj
              </button>
              <button onClick={() => handleBulkAction('export')} className="bulk-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Eksportuj
              </button>
              <button 
                onClick={() => handleBulkAction('delete')} 
                className="bulk-btn bulk-btn-danger"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
                Usuń
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Grid */}
      {filteredLabels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
          </div>
          <h3>Nie znaleziono etykiet</h3>
          <p>Spróbuj dostosować kryteria wyszukiwania lub filtrowania</p>
          <CreateLabelButton
            projectId={projectId}
            variant="primary"
            size="md"
            onLabelCreated={onLabelCreated}
            className="create-first-btn"
          >
            Utwórz swoją pierwszą etykietę
          </CreateLabelButton>
        </div>
      ) : (
        <motion.div
          style={getGridStyle()}
          className="labels-grid"
          layout
        >
          {filteredLabels.map((label, index) => (
            <LabelCard
              key={label.id}
              label={label}
              isSelected={selectedLabels.has(label.id)}
              onEdit={() => onEditLabel(label)}
              onDelete={() => onDeleteLabel(label.id)}
              onSelect={() => toggleLabelSelection(label.id)}
              onPreview={() => setPreviewLabel(label)}
              index={index}
            />
          ))}
        </motion.div>
      )}

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewLabel && (
          <QuickPreviewModal
            label={previewLabel}
            onClose={() => setPreviewLabel(null)}
            onEdit={() => {
              onEditLabel(previewLabel);
              setPreviewLabel(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quick Templates Modal */}
      {onCreateFromTemplate && (
        <QuickTemplates
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onCreateFromTemplate={(template) => {
            onCreateFromTemplate(template);
            setShowTemplates(false);
          }}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bulk-delete-modal-overlay"
            onClick={cancelBulkDelete}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bulk-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bulk-delete-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="bulk-delete-title">Potwierdź usunięcie</h3>
              <p className="bulk-delete-message">
                Czy na pewno chcesz usunąć {selectedLabels.size} etykiet{selectedLabels.size !== 1 ? 'y' : 'ę'}? Ta akcja nie może zostać cofnięta.
              </p>
              <div className="bulk-delete-actions">
                <button 
                  onClick={cancelBulkDelete}
                  className="bulk-delete-btn-cancel"
                >
                  Anuluj
                </button>
                <button 
                  onClick={confirmBulkDelete}
                  className="bulk-delete-btn-delete"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual Label Card Component
interface LabelCardProps {
  label: Label;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onPreview: () => void;
  index: number;
}

function LabelCard({
  label,
  isSelected,
  onEdit,
  onDelete,
  onSelect,
  onPreview,
  index
}: LabelCardProps) {
  // Calculate better aspect ratio for display
  const getCardStyle = () => {
    const ratio = label.width / label.height;
    
    // Determine card height based on label proportions
    let cardHeight = '320px'; // default
    
    if (ratio > 2.5) {
      // Very wide labels - shorter cards
      cardHeight = '280px';
    } else if (ratio < 0.5) {
      // Very tall labels - taller cards
      cardHeight = '400px';
    } else if (ratio >= 0.8 && ratio <= 1.2) {
      // Square-ish labels
      cardHeight = '320px';
    }
    
    return {
      height: cardHeight,
      display: 'flex',
      flexDirection: 'column' as const
    };
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={`enhanced-label-card ${isSelected ? 'selected' : ''}`}
      style={{
        ...getCardStyle(),
        outline: isSelected ? '3px solid #007bff' : 'none',
        borderRadius: isSelected ? '8px' : 'initial'
      }}
      onClick={onSelect}
    >
      {/* Selection Badge - Visual only */}
      {isSelected && (
        <div className="card-selection-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <circle cx="12" cy="12" r="12" fill="#007bff"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card-quick-actions">
        <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="quick-action" title="Quick preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="quick-action quick-action-primary" title="Edit in Editor">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="quick-action quick-action-danger" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3,6 5,6 21,6"/>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          </svg>
        </button>
      </div>

      {/* Image/Preview */}
      <div className="card-image">
        {label.thumbnail ? (
          <SmartImage
            src={label.thumbnail}
            alt={label.name}
            fill
            className="label-thumbnail"
          />
        ) : (
          <div className="label-placeholder">
            <div className="placeholder-content">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <div className="placeholder-dimensions">
                {formatDimensions(label.width, label.height)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="card-info">
        <div className="card-header">
          <h3 className="card-title" title={label.name}>{label.name}</h3>
        </div>

        <div className="card-meta">
          <span className="dimensions">{formatDimensions(label.width, label.height)}</span>
          <span className="version">v{label.version}</span>
        </div>

        {label.description && (
          <p className="card-description" title={label.description}>
            {label.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Quick Preview Modal Component
interface QuickPreviewModalProps {
  label: Label;
  onClose: () => void;
  onEdit: () => void;
}

function QuickPreviewModal({ label, onClose, onEdit }: QuickPreviewModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="preview-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="preview-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-header">
          <div className="preview-title">
            <h2>{label.name}</h2>
          </div>
          <div className="preview-actions">
            <button onClick={onEdit} className="preview-btn preview-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit Label
            </button>
            <button onClick={onClose} className="preview-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="preview-content">
          <div className="preview-image-container">
            {label.thumbnail ? (
              <SmartImage
                src={label.thumbnail}
                alt={label.name}
                width={600}
                height={400}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <p>No preview available</p>
              </div>
            )}
          </div>

          <div className="preview-details">
            <div className="detail-group">
              <h4>Dimensions</h4>
              <p>{formatDimensions(label.width, label.height)}</p>
              <p className="detail-sub">Area: {getLabelArea(label).toLocaleString()} mm²</p>
              <p className="detail-sub">Aspect ratio: {(label.width / label.height).toFixed(2)}:1</p>
            </div>

            {label.description && (
              <div className="detail-group">
                <h4>Description</h4>
                <p>{label.description}</p>
              </div>
            )}

            <div className="detail-group">
              <h4>Metadata</h4>
              <p>Version: {label.version}</p>
              <p>Created: {new Date(label.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(label.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ImprovedLabelGallery;
