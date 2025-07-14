'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

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

interface LabelsPanelProps {
  currentLabel: {
    id: string;
    name: string;
    description?: string;
    projectId: string;
  } | null;
  labels: Label[];
  onLabelSelect: (labelId: string) => void;
  onCreateLabel: () => void;
  onDuplicateLabel?: (labelId: string) => void;
  onDeleteLabel?: (labelId: string) => void;
  onExportLabel?: (labelId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'updated' | 'created' | 'size';
type FilterBy = 'all' | 'draft' | 'published' | 'archived';

export const LabelsPanel: React.FC<LabelsPanelProps> = ({
  currentLabel,
  labels,
  onLabelSelect,
  onCreateLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [isCreating, setIsCreating] = useState(false);

  const filteredAndSortedLabels = useMemo(() => {
    const filtered = labels.filter(label => {
      // Search filter
      const matchesSearch = label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (label.description && label.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesFilter = filterBy === 'all' || label.status.toLowerCase() === filterBy;
      
      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'size':
          return (b.width * b.height) - (a.width * a.height);
        default:
          return 0;
      }
    });

    return filtered;
  }, [labels, searchTerm, sortBy, filterBy]);

  const handleCreateLabel = async () => {
    setIsCreating(true);
    try {
      await onCreateLabel();
    } finally {
      setIsCreating(false);
    }
  };

  const LabelCard: React.FC<{ label: Label; isSelected: boolean }> = ({ label, isSelected }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
      if (isSelected) return;
      setIsLoading(true);
      try {
        onLabelSelect(label.id);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    return (
      <motion.div
        onClick={handleClick}
        className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                   ${isSelected 
                     ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/20' 
                     : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-700/50'
                   }
                   ${isLoading ? 'opacity-75' : ''}`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        layout
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Thumbnail */}
        <div className="aspect-video bg-gray-700/50 rounded-lg mb-3 overflow-hidden relative">
          {label.thumbnail ? (
            <img 
              src={label.thumbnail} 
              alt={label.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <BookmarkIcon className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                <div className="text-xs text-gray-500">{label.width}×{label.height}mm</div>
              </div>
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              label.status === 'PUBLISHED' ? 'bg-green-900/80 text-green-300 border border-green-500/30' :
              label.status === 'DRAFT' ? 'bg-yellow-900/80 text-yellow-300 border border-yellow-500/30' :
              'bg-gray-900/80 text-gray-400 border border-gray-500/30'
            }`}>
              {label.status}
            </span>
          </div>
        </div>

        {/* Label info */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm truncate group-hover:text-blue-300 transition-colors">
            {label.name}
          </h4>
          {label.description && (
            <p className="text-gray-400 text-xs line-clamp-2">{label.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(label.updatedAt).toLocaleDateString()}</span>
            <span>{label.width}×{label.height}</span>
          </div>
        </div>

        {/* Actions menu (shows on hover) */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-6 h-6 rounded-md bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white
                           flex items-center justify-center transition-colors">
            <EllipsisVerticalIcon className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    );
  };

  const CreateNewCard = () => (
    <motion.div
      onClick={handleCreateLabel}
      className={`relative p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                 min-h-[180px] flex flex-col items-center justify-center group
                 ${isCreating 
                   ? 'border-blue-500 bg-blue-900/20' 
                   : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/30'
                 }`}
      whileHover={{ scale: isCreating ? 1 : 1.02 }}
      whileTap={{ scale: isCreating ? 1 : 0.98 }}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
                      ${isCreating ? 'bg-blue-700' : 'bg-blue-600 group-hover:bg-blue-700'}`}>
        {isCreating ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <PlusIcon className="w-6 h-6 text-white" />
        )}
      </div>
      <h4 className="text-white font-medium text-sm mb-1">
        {isCreating ? 'Creating...' : 'New Label'}
      </h4>
      <p className="text-gray-400 text-xs text-center">
        {isCreating ? 'Please wait' : 'Create a new label'}
      </p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full panel-glass border-l border-gray-800/50 flex flex-col w-80"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <BookmarkIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">Labels</h2>
            <p className="text-xs text-gray-400">{labels.length} total labels</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search labels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm
                     focus:border-blue-500 focus:outline-none placeholder-gray-400"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View mode */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-sm transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filter and sort */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-white text-xs"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-white text-xs"
          >
            <option value="updated">Updated</option>
            <option value="name">Name</option>
            <option value="created">Created</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-3">
            <CreateNewCard />
            <AnimatePresence>
              {filteredAndSortedLabels.map((label) => (
                <LabelCard
                  key={label.id}
                  label={label}
                  isSelected={currentLabel?.id === label.id}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredAndSortedLabels.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <BookmarkIcon className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'No labels found matching your search.' : 'No labels in this project yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
