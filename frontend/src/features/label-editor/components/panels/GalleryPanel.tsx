'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon,
  TagIcon,
  ClockIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';
import { FloatingPanel } from '../common/FloatingPanel';

interface Label {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  width: number;
  height: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
  createdAt: string;
}

interface GalleryPanelProps {
  currentLabel: {
    id: string;
    name: string;
    description?: string;
    projectId: string;
  } | null;
  labels: Label[];
  onLabelSelect: (labelId: string) => void;
  onCreateLabel: () => void;
  isVisible: boolean;
  onClose: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'updated' | 'created' | 'size';
type FilterBy = 'all' | 'draft' | 'published' | 'archived';

// Thumbnail component with smart scaling
const SmartThumbnail: React.FC<{
  label: Label;
  scale: number;
  isGridView: boolean;
}> = ({ label, scale, isGridView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate thumbnail dimensions maintaining aspect ratio
  const getLabelAspectRatio = () => {
    return label.height / label.width;
  };

  const getThumbnailDimensions = () => {
    const aspectRatio = getLabelAspectRatio();
    
    if (isGridView) {
      const baseWidth = 280 * scale;
      const baseHeight = Math.min(baseWidth * aspectRatio, 200 * scale);
      return { width: baseWidth, height: baseHeight };
    } else {
      const baseWidth = 80 * scale;
      const baseHeight = Math.min(baseWidth * aspectRatio, 60 * scale);
      return { width: baseWidth, height: baseHeight };
    }
  };

  const { width, height } = getThumbnailDimensions();

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600
        ${isGridView ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
        flex items-center justify-center
        group-hover:border-blue-300 dark:group-hover:border-blue-500
        transition-all duration-200
      `}
      style={{ width: `${width}px`, height: `${height}px`, minHeight: isGridView ? '120px' : '40px' }}
    >
      {/* Loading state */}
      {!imageLoaded && !imageError && label.thumbnail && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700"></div>
      )}
      
      {/* Image or fallback */}
      {label.thumbnail && !imageError ? (
        <img 
          src={label.thumbnail} 
          alt={label.name}
          className={`
            w-full h-full object-contain transition-opacity duration-200
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <TagIcon className={`${isGridView ? 'w-12 h-12' : 'w-6 h-6'} mb-1`} />
          {isGridView && (
            <span className="text-xs">No preview</span>
          )}
        </div>
      )}
      
      {/* Overlay with label dimensions */}
      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
        {label.width.toFixed(0)}×{label.height.toFixed(0)}mm
      </div>
    </div>
  );
};

// Virtual scrolling for performance with large lists
const VirtualizedGrid: React.FC<{
  labels: Label[];
  currentLabelId: string | undefined;
  onLabelSelect: (labelId: string) => void;
  scale: number;
  viewMode: ViewMode;
  getStatusColor: (status: string) => string;
}> = ({ labels, currentLabelId, onLabelSelect, scale, viewMode, getStatusColor }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible items based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = viewMode === 'grid' ? (200 * scale + 32) : (80 * scale + 16);
    
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(clientHeight / itemHeight) + 5; // Buffer
    const end = Math.min(start + visibleCount, labels.length);
    
    setVisibleRange({ start, end });
  }, [scale, viewMode, labels.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const visibleLabels = labels.slice(visibleRange.start, visibleRange.end);
  const totalHeight = labels.length * (viewMode === 'grid' ? (200 * scale + 32) : (80 * scale + 16));

  return (
    <div 
      ref={containerRef}
      className="max-h-[500px] overflow-y-auto floating-panel-scrollbar"
      style={{ height: '500px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.start * (viewMode === 'grid' ? (200 * scale + 32) : (80 * scale + 16))}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          <div className={`
            ${viewMode === 'grid' 
              ? `grid gap-4 ${scale > 0.8 ? 'grid-cols-1' : 'grid-cols-2'}`
              : 'space-y-2'
            }
          `}>
            {visibleLabels.map((label, index) => (
              <motion.div
                key={label.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`
                  group relative cursor-pointer transition-all duration-200
                  ${viewMode === 'grid' ? 'p-4' : 'p-3'}
                  border rounded-xl
                  ${currentLabelId === label.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md bg-white dark:bg-gray-800'
                  }
                  hover:scale-[1.02] active:scale-[0.98]
                `}
                onClick={() => onLabelSelect(label.id)}
              >
                {viewMode === 'grid' ? (
                  <div className="space-y-3">
                    {/* Grid View - Enhanced */}
                    <div className="flex justify-center">
                      <SmartThumbnail label={label} scale={scale} isGridView={true} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 pr-2">
                          {label.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(label.status)}`}>
                          {label.status}
                        </span>
                      </div>
                      
                      {label.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {label.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{new Date(label.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* List View - Compact */}
                    <SmartThumbnail label={label} scale={scale} isGridView={false} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {label.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(label.status)}`}>
                          {label.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                          <ClockIcon className="w-3 h-3" />
                          <span>{new Date(label.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GalleryPanel: React.FC<GalleryPanelProps> = ({
  currentLabel,
  labels,
  onLabelSelect,
  onCreateLabel,
  isVisible,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [scale, setScale] = useState(0.8); // Zoom scale for thumbnails

  const filteredAndSortedLabels = useMemo(() => {
    const filtered = labels.filter(label => {
      const matchesSearch = label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (label.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesFilter = filterBy === 'all' || label.status.toLowerCase() === filterBy;
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          return (b.width * b.height) - (a.width * a.height);
        default:
          return 0;
      }
    });

    return filtered;
  }, [labels, searchQuery, sortBy, filterBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'DRAFT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <FloatingPanel
      id="project-gallery-panel"
      title="Project Gallery"
      defaultPosition={{ x: 820, y: 120 }}
      defaultSize={{ width: 480, height: 700 }}
      minSize={{ width: 400, height: 600 }}
      maxSize={{ width: 800, height: 900 }}
      onClose={onClose}
      className="backdrop-blur-lg bg-white/95 dark:bg-gray-800/95"
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between shrink-0">
          <motion.button
            onClick={onCreateLabel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-lg"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Label</span>
          </motion.button>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                disabled={scale <= 0.5}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                title="Zoom out"
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                disabled={scale >= 1.5}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                title="Zoom in"
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? (
                <ListBulletIcon className="w-4 h-4" />
              ) : (
                <Squares2X2Icon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs shrink-0">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>

        {/* Stats */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1 shrink-0 flex items-center justify-between">
          <span>{filteredAndSortedLabels.length} label{filteredAndSortedLabels.length !== 1 ? 's' : ''} found</span>
          <span className="text-blue-600 dark:text-blue-400">
            {viewMode === 'grid' ? 'Grid' : 'List'} • {Math.round(scale * 100)}% zoom
          </span>
        </div>

        {/* Labels List */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {filteredAndSortedLabels.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-gray-500 dark:text-gray-400"
              >
                <FolderIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">No labels found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              <VirtualizedGrid
                labels={filteredAndSortedLabels}
                currentLabelId={currentLabel?.id}
                onLabelSelect={onLabelSelect}
                scale={scale}
                viewMode={viewMode}
                getStatusColor={getStatusColor}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </FloatingPanel>
  );
}; 