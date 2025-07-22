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

// Enhanced grid with dynamic columns calculation
const ResponsiveGrid: React.FC<{
  labels: Label[];
  currentLabelId: string | undefined;
  onLabelSelect: (labelId: string) => void;
  scale: number;
  viewMode: ViewMode;
  containerWidth: number;
}> = ({ labels, currentLabelId, onLabelSelect, scale, viewMode, containerWidth }) => {
  
  // Calculate optimal number of columns based on container width and scale
  const getOptimalColumns = useCallback(() => {
    if (viewMode === 'list') return 1;
    
    // Improved base card width calculation with better scaling
    const baseCardWidth = 300; // Base card width in pixels
    const scaledCardWidth = baseCardWidth * scale;
    const minGap = 16; // Gap between columns
    
    // Calculate how many columns can fit with better responsive behavior
    const availableWidth = Math.max(300, containerWidth - 24); // Ensure minimum available width
    const maxColumns = Math.floor((availableWidth + minGap) / (scaledCardWidth + minGap));
    
    // Ensure sensible column limits based on scale
    const minColumns = 1;
    let maxColumnLimit = 5; // Allow up to 5 columns for very small zoom
    
    // Adjust column limits based on zoom level for better UX
    if (scale >= 1.4) {
      maxColumnLimit = 1; // Very large zoom - force single column
    } else if (scale >= 1.0) {
      maxColumnLimit = 2; // Large zoom - max 2 columns
    } else if (scale >= 0.7) {
      maxColumnLimit = 3; // Medium zoom - max 3 columns
    } else if (scale >= 0.5) {
      maxColumnLimit = 4; // Small zoom - max 4 columns
    }
    // Below 0.5 scale allows up to 5 columns
    
    return Math.max(minColumns, Math.min(maxColumnLimit, maxColumns));
  }, [containerWidth, scale, viewMode]);

  const columns = getOptimalColumns();

  // Dynamic grid template (kept for potential future use)
  // const gridClass = `grid gap-4 grid-cols-${columns}`;
  
  // For very dynamic layouts, use inline styles instead of classes
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
  };

  return (
    <div className="max-h-[500px] overflow-y-auto floating-panel-scrollbar">
      <div style={gridStyle} className="p-2">
        <AnimatePresence mode="popLayout">
          {labels.map((label, index) => (
            <motion.div
              key={label.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.02,
                layout: { duration: 0.3 }
              }}
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
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {label.name}
                      </h4>
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
        </AnimatePresence>
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
  const [scale, setScale] = useState(0.6); // Better default zoom scale for thumbnails
  const [containerWidth, setContainerWidth] = useState(480); // Default width
  
  // Ref to measure container width
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive grid
  const measureWidth = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setContainerWidth(width);
    }
  }, []);

  useEffect(() => {
    measureWidth();
    
    // Use ResizeObserver for better performance
    let resizeObserver: ResizeObserver | null = null;
    let resizeHandler: (() => void) | null = null;
    
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        measureWidth();
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    } else if (typeof window !== 'undefined') {
      // Fallback for browsers without ResizeObserver
      resizeHandler = () => measureWidth();
      (window as unknown as { addEventListener: (event: string, handler: () => void) => void }).addEventListener('resize', resizeHandler);
    }
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (resizeHandler && typeof window !== 'undefined') {
        (window as unknown as { removeEventListener: (event: string, handler: () => void) => void }).removeEventListener('resize', resizeHandler);
      }
    };
  }, [measureWidth]);

  const filteredAndSortedLabels = useMemo(() => {
    const filtered = labels.filter(label => {
      const matchesSearch = label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (label.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      return matchesSearch;
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
  }, [labels, searchQuery, sortBy]);

  // Calculate current columns for display
  const getCurrentColumns = () => {
    if (viewMode === 'list') return 1;
    
    const baseCardWidth = 300;
    const scaledCardWidth = baseCardWidth * scale;
    const minGap = 16;
    const availableWidth = Math.max(300, containerWidth - 24);
    const maxColumns = Math.floor((availableWidth + minGap) / (scaledCardWidth + minGap));
    
    // Apply same logic as getOptimalColumns
    let maxColumnLimit = 5;
    if (scale >= 1.4) {
      maxColumnLimit = 1;
    } else if (scale >= 1.0) {
      maxColumnLimit = 2;
    } else if (scale >= 0.7) {
      maxColumnLimit = 3;
    } else if (scale >= 0.5) {
      maxColumnLimit = 4;
    }
    
    return Math.max(1, Math.min(maxColumnLimit, maxColumns));
  };

  if (!isVisible) return null;

  return (
    <FloatingPanel
      id="project-gallery-panel"
      title="Project Gallery"
      defaultPosition={{ x: 820, y: 120 }}
      defaultSize={{ width: 480, height: 700 }}
      minSize={{ width: 400, height: 600 }}
      maxSize={{ width: 1000, height: 900 }}
      onClose={onClose}
      className="backdrop-blur-lg bg-white/95 dark:bg-gray-800/95"
    >
      <div ref={containerRef} className="space-y-4 h-full flex flex-col">
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
                onClick={() => setScale(Math.max(0.3, scale - 0.1))}
                disabled={scale <= 0.3}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                title="Zoom out"
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                disabled={scale >= 2.0}
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
            {viewMode === 'grid' ? `${getCurrentColumns()} col${getCurrentColumns() > 1 ? 's' : ''}` : 'List'} • {Math.round(scale * 100)}%
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
              <ResponsiveGrid
                labels={filteredAndSortedLabels}
                currentLabelId={currentLabel?.id}
                onLabelSelect={onLabelSelect}
                scale={scale}
                viewMode={viewMode}
                containerWidth={containerWidth}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </FloatingPanel>
  );
}; 