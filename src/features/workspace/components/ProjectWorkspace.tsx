"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Grid3X3, 
  List, 
    Plus,
  Download,
  MoreHorizontal,
  FolderOpen,
  Tags,
  Clock,
  Maximize2,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Menu
} from 'lucide-react';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { useAuthContext } from '@/providers/AuthProvider';
import { Label } from '@/features/project-management/types/project.types';
import { BulkExportModal } from './BulkExportModal';
import { BulkLabelCreationModal } from '@/features/bulk-label-creation';
import { useOptimizedProject, useOptimizedProjectLabels } from '@/services/optimizedWorkspace.service';
import { OptimizedThumbnail } from '@/components/ui/OptimizedThumbnail';
import './workspace.css';

interface WorkspaceProps {
  projectId: string;
  onMobileMenuToggle?: () => void;
}

type ViewMode = 'grid' | 'list' | 'masonry';
type SortBy = 'name' | 'created' | 'updated' | 'size';

export const ProjectWorkspace: React.FC<WorkspaceProps> = ({ projectId, onMobileMenuToggle }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { deleteLabel } = useProjects();
  
  // Only fetch data when authenticated
  const shouldFetch = isAuthenticated && !authLoading;
  
  // Use optimized hooks for data fetching
  const {
    data: currentProject,
    loading: projectLoading,
    error: projectError
  } = useOptimizedProject(projectId, shouldFetch);

  const {
    data: labels,
    loading: labelsLoading,
    error: labelsError,
    refresh: refreshLabels
  } = useOptimizedProjectLabels(projectId, shouldFetch);

  const isLoading = projectLoading || labelsLoading;
  const error = projectError || labelsError;
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const [previewLabel, setPreviewLabel] = useState<Label | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkCreationModal, setShowBulkCreationModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLabels, setDeletingLabels] = useState(false);

  // Filter and sort labels - MOVED HERE TO COMPLY WITH HOOKS RULES
  const filteredAndSortedLabels = useMemo(() => {
    if (!labels) return [];
    
    const filtered = labels.filter(label => 
      label.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'size':
          const aSize = (a.width || 0) * (a.height || 0);
          const bSize = (b.width || 0) * (b.height || 0);
          return bSize - aSize;
        default:
          return 0;
      }
    });

    return filtered;
  }, [labels, searchQuery, sortBy]);

  // Helper functions - MOVED HERE TO COMPLY WITH HOOKS RULES
  const clearSelection = () => setSelectedLabels(new Set());

  const selectAllLabels = useCallback(() => {
    const allLabelIds = new Set(filteredAndSortedLabels.map(label => label.id));
    setSelectedLabels(allLabelIds);
  }, [filteredAndSortedLabels]);

  const handleBulkDelete = useCallback(() => {
    if (selectedLabels.size > 0) {
      setShowDeleteConfirm(true);
    }
  }, [selectedLabels]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedLabels.size === 0) return;

    setDeletingLabels(true);
    
    try {
      const labelIds = Array.from(selectedLabels);
      const deletePromises = labelIds.map(labelId => deleteLabel(labelId));
      const results = await Promise.all(deletePromises);
      
      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error('Some labels failed to delete:', failedDeletions);
        // You might want to show a toast notification here
      } else {
        console.log(`✅ Successfully deleted ${labelIds.length} labels`);
        // Clear selection after successful deletion
        clearSelection();
        // Refresh labels to update the UI
        refreshLabels();
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
    } finally {
      setDeletingLabels(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedLabels, deleteLabel, refreshLabels]);

  const handleBulkCreationSuccess = useCallback((createdLabels: unknown[]) => {
    setShowBulkCreationModal(false);
    refreshLabels(); // Refresh labels list to show new ones
    console.log(`✅ Successfully created ${createdLabels.length} labels`);
  }, [refreshLabels]);

  // Keyboard shortcuts - MOVED HERE TO COMPLY WITH HOOKS RULES
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        selectAllLabels();
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
      // Delete key to delete selected labels
      if (e.key === 'Delete' && selectedLabels.size > 0) {
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectAllLabels, selectedLabels, handleBulkDelete]);

  // Simplified debug logging - only when data changes
  if (labels && labels.length > 0) {
    console.log(`✅ ProjectWorkspace loaded ${labels.length} labels for project ${currentProject?.name}`);
  }

  // Show authentication error if needed
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="workspace-content">
        <div className="workspace-header">
          <div className="workspace-header-content">
            <div className="workspace-title">
              <h1>Authentication Required</h1>
              <p>Please log in to access your workspace</p>
            </div>
          </div>
        </div>
        <div className="auth-error-container">
          <div className="auth-error">
            <h3>🔒 Please Log In</h3>
            <p>You need to be authenticated to view projects and labels.</p>
            <button 
              onClick={() => router.push('/login')}
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="workspace-content">
        <div className="workspace-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if authentication-related error
  if (error === 'AUTHENTICATION_REQUIRED') {
    return (
      <div className="workspace-content">
        <div className="workspace-header">
          <div className="workspace-header-content">
            <div className="workspace-title">
              <h1>Session Expired</h1>
              <p>Your session has expired. Please log in again.</p>
            </div>
          </div>
        </div>
        <div className="auth-error-container">
          <div className="auth-error">
            <h3>🔒 Session Expired</h3>
            <p>Your authentication token has expired. Please log in again.</p>
            <button 
              onClick={() => {
                // Clear any cached data and redirect to login
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                router.push('/login');
              }}
              className="btn btn-primary"
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBulkExport = () => {
    setShowExportModal(true);
  };

  const cancelBulkDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleLabelClick = (label: Label) => {
    // Click toggles selection
    toggleLabelSelection(label.id);
  };

  const toggleLabelSelection = (labelId: string) => {
    const newSelected = new Set(selectedLabels);
    if (newSelected.has(labelId)) {
      newSelected.delete(labelId);
    } else {
      newSelected.add(labelId);
    }
    setSelectedLabels(newSelected);
  };

  const getLabelDimensions = (label: Label) => {
    const width = label.width || 100;
    const height = label.height || 100;
    return { width, height, ratio: width / height };
  };

  const renderLabelCard = (label: Label, index: number) => {
    const { width, height, ratio } = getLabelDimensions(label);
    const isSelected = selectedLabels.has(label.id);
    
    // Calculate display size for masonry layout
    const baseWidth = 200;
    const displayWidth = viewMode === 'masonry' ? Math.min(baseWidth, Math.max(150, baseWidth * Math.min(ratio, 2))) : baseWidth;
    const displayHeight = viewMode === 'masonry' ? displayWidth / ratio : 120;

    return (
      <motion.div
        key={label.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={`workspace-label-card ${viewMode} ${isSelected ? 'selected' : ''}`}
        style={{
          width: viewMode === 'list' ? '100%' : `${displayWidth}px`,
          height: viewMode === 'list' ? 'auto' : `${displayHeight + 80}px`,
          outline: isSelected ? '3px solid #007bff' : 'none',
          borderRadius: isSelected ? '8px' : 'initial'
        }}
        onClick={() => handleLabelClick(label)}
      >
        {/* Selection Indicator - Visual only */}
        {isSelected && (
          <div className="label-selection-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <circle cx="12" cy="12" r="12" fill="#007bff"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        )}

        {/* Label Preview */}
        <div 
          className="label-preview"
          style={{ height: viewMode === 'list' ? '60px' : `${displayHeight}px` }}
        >
          <OptimizedThumbnail
            labelId={label.id}
            thumbnailUrl={label.thumbnail}
            size={viewMode === 'list' ? 'sm' : 'md'}
            alt={label.name}
            className="label-thumbnail"
            generateOnError={false}
            labelWidth={width}
            labelHeight={height}
            maxWidth={viewMode === 'list' ? 80 : displayWidth}
            maxHeight={viewMode === 'list' ? 60 : displayHeight}
            maintainAspectRatio={true}
            fallback={
              <div className="label-placeholder">
                <Tags size={24} />
                <span>{width} × {height}</span>
              </div>
            }
          />
          
          {/* Quick Actions Overlay */}
          <div className="label-overlay">
            <button 
              className="overlay-btn"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewLabel(label);
              }}
              title="Podgląd"
            >
              <Eye size={16} />
            </button>
            <button 
              className="overlay-btn overlay-btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/editor/${label.id}?projectId=${projectId}`);
              }}
              title="Edytuj w edytorze"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        {/* Label Info */}
        <div className="label-info">
          <div className="label-header">
            <h3 className="label-name" title={label.name}>
              {label.name || 'Bez nazwy'}
            </h3>
            <button 
              className="label-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Show context menu
              }}
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          
          <div className="label-meta">
            <span className="label-dimensions">{width} × {height}mm</span>
            <span className="label-date">
              <Clock size={12} />
              {new Date(label.updatedAt || label.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="project-workspace">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-header-left">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={onMobileMenuToggle}
            title="Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="workspace-breadcrumb">
            <button 
              onClick={() => router.push('/workspace')}
              className="breadcrumb-btn"
            >
              <FolderOpen size={16} />
              Projekty
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{currentProject?.name}</span>
          </div>
          
          <div className="workspace-stats">
            <span className="stat">
              {filteredAndSortedLabels.length} etykiet
            </span>
            {selectedLabels.size > 0 && (
              <>
                <span className="stat selected">
                  {selectedLabels.size} zaznaczonych
                </span>
                <button 
                  className="select-all-btn"
                  onClick={selectAllLabels}
                  title="Zaznacz wszystkie (Ctrl+A)"
                >
                  Zaznacz wszystkie ({filteredAndSortedLabels.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="workspace-header-right">
          {selectedLabels.size > 0 ? (
            <div className="bulk-actions">
              <button className="action-btn secondary">
                <Copy size={16} />
                Duplikuj ({selectedLabels.size})
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleBulkExport}
              >
                <Download size={16} />
                Eksportuj
              </button>
              <button 
                className="action-btn danger"
                onClick={handleBulkDelete}
                disabled={deletingLabels}
              >
                <Trash2 size={16} />
                {deletingLabels ? 'Usuwanie...' : 'Usuń'}
              </button>
              <button 
                className="action-btn ghost"
                onClick={clearSelection}
              >
                Anuluj
              </button>
            </div>
          ) : (
            <div className="workspace-actions">
              <button 
                className="action-btn primary"
                onClick={() => router.push(`/editor/new?projectId=${projectId}`)}
              >
                <Plus size={16} />
                Nowa etykieta
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => setShowBulkCreationModal(true)}
              >
                <Grid3X3 size={16} />
                Utwórz masowo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Controls */}
      <div className="workspace-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Szukaj etykiet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-section">
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="sort-select"
            >
              <option value="updated">Ostatnio aktualizowane</option>
              <option value="created">Najnowsze</option>
              <option value="name">Nazwa A-Z</option>
              <option value="size">Rozmiar</option>
            </select>
          </div>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Siatka"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
              onClick={() => setViewMode('masonry')}
              title="Masonry"
            >
              <Maximize2 size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>



      {/* Labels Grid */}
      <div className="workspace-content">
        {isLoading ? (
          <div className="workspace-loading">
            <div className="loading-spinner"></div>
            <span>Ładowanie etykiet...</span>
          </div>
        ) : filteredAndSortedLabels.length === 0 ? (
          <div className="workspace-empty">
            <Tags size={48} />
            <h3>Brak etykiet</h3>
            <p>
              {searchQuery 
                ? `Nie znaleziono etykiet dla "${searchQuery}"`
                : 'Rozpocznij tworzenie etykiet dla tego projektu'
              }
            </p>
            {!searchQuery && (
              <button 
                className="action-btn primary"
                onClick={() => router.push(`/editor/new?projectId=${projectId}`)}
              >
                <Plus size={16} />
                Utwórz pierwszą etykietę
              </button>
            )}
          </div>
        ) : (
          <div className={`labels-container ${viewMode}`}>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedLabels.map((label, index) => 
                renderLabelCard(label, index)
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="preview-modal-overlay"
            onClick={() => setPreviewLabel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-header">
                <h3>{previewLabel.name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setPreviewLabel(null)}
                >
                  ×
                </button>
              </div>
              <div className="preview-content">
                <div className="preview-image-section">
                  {previewLabel.thumbnail ? (
                    <NextImage
                      src={previewLabel.thumbnail} 
                      alt={previewLabel.name}
                      className="preview-image"
                      width={400}
                      height={300}
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <Tags size={48} />
                      <span>Brak podglądu</span>
                    </div>
                  )}
                </div>
                <div className="preview-details">
                  <div className="detail-section">
                    <h4>Szczegóły etykiety</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{previewLabel.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Wymiary:</span>
                        <span className="detail-value">{previewLabel.width || 0} × {previewLabel.height || 0} mm</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Powierzchnia:</span>
                        <span className="detail-value">{((previewLabel.width || 0) * (previewLabel.height || 0)).toLocaleString()} mm²</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Proporcje:</span>
                        <span className="detail-value">{((previewLabel.width || 0) / (previewLabel.height || 0)).toFixed(2)}:1</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Wersja:</span>
                        <span className="detail-value">v{previewLabel.version}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Utworzono:</span>
                        <span className="detail-value">{new Date(previewLabel.createdAt).toLocaleString('pl-PL')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Zaktualizowano:</span>
                        <span className="detail-value">{new Date(previewLabel.updatedAt || previewLabel.createdAt).toLocaleString('pl-PL')}</span>
                      </div>
                      {previewLabel.description && (
                        <div className="detail-item full-width">
                          <span className="detail-label">Opis:</span>
                          <span className="detail-value">{previewLabel.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="preview-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    setPreviewLabel(null);
                    router.push(`/editor/${previewLabel.id}?projectId=${projectId}`);
                  }}
                >
                  <Edit3 size={16} />
                  Edytuj
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Export Modal */}
      <BulkExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        labelIds={Array.from(selectedLabels)}
        projectId={projectId}
        projectName={currentProject?.name}
      />

      {/* Bulk Label Creation Modal */}
      <BulkLabelCreationModal
        isOpen={showBulkCreationModal}
        onClose={() => setShowBulkCreationModal(false)}
        projectId={projectId}
        onSuccess={handleBulkCreationSuccess}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="delete-modal-overlay"
            onClick={cancelBulkDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-content">
                <div className="delete-modal-icon">
                  <Trash2 size={32} />
                </div>
                <h3 className="delete-modal-title">Usuń etykiety</h3>
                <p className="delete-modal-message">
                  Czy na pewno chcesz usunąć {selectedLabels.size} etykiet{selectedLabels.size === 1 ? 'ę' : selectedLabels.size > 4 ? '' : 'y'}? 
                  <br />
                  <strong>Tej operacji nie można cofnąć.</strong>
                </p>
                <div className="delete-modal-actions">
                  <button
                    onClick={cancelBulkDelete}
                    className="delete-modal-btn-cancel"
                    disabled={deletingLabels}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="delete-modal-btn-delete"
                    disabled={deletingLabels}
                  >
                    {deletingLabels ? 'Usuwanie...' : 'Usuń'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
