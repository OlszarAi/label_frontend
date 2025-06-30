'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, BookmarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Label {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  width: number;
  height: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
}

interface BottomPanelProps {
  currentLabel: {
    id: string;
    name: string;
    description?: string;
    projectId: string;
  } | null;
  labels: Label[];
  isExpanded: boolean;
  onToggle: () => void;
  onLabelSelect: (labelId: string) => void;
  onCreateLabel: () => void;
  onSave: () => void;
  onLabelNameChange: (name: string) => void;
  onLabelDescriptionChange: (description: string) => void;
  autoSave: boolean;
  onAutoSaveToggle: () => void;
  lastSaved: Date | null;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  currentLabel,
  labels,
  isExpanded,
  onToggle,
  onLabelSelect,
  onCreateLabel,
  onSave,
  onLabelNameChange,
  onLabelDescriptionChange,
  autoSave,
  onAutoSaveToggle,
  lastSaved,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (label.description && label.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Saved just now';
    if (diffInSeconds < 3600) return `Saved ${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `Saved ${Math.floor(diffInSeconds / 3600)}h ago`;
    return `Saved ${date.toLocaleDateString()}`;
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 hover:bg-gray-700 
                   text-white px-4 py-1 rounded-t-lg border border-gray-700 border-b-0 
                   transition-colors duration-200 flex items-center gap-2 text-sm"
      >
        {isExpanded ? (
          <>
            <ChevronDownIcon className="w-4 h-4" />
            Hide Labels
          </>
        ) : (
          <>
            <ChevronUpIcon className="w-4 h-4" />
            Show Labels ({labels.length})
          </>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 280 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-white font-semibold text-lg">Project Labels</h3>
                  
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search labels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg border border-gray-600 
                               focus:border-blue-500 focus:outline-none text-sm w-64"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>

                {/* Save Controls */}
                <div className="flex items-center gap-4">
                  {/* Label Name & Description Editor */}
                  {currentLabel && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentLabel.name}
                        onChange={(e) => onLabelNameChange(e.target.value)}
                        className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 
                                 focus:border-blue-500 focus:outline-none text-sm w-32"
                        placeholder="Label name"
                      />
                      <input
                        type="text"
                        value={currentLabel.description || ''}
                        onChange={(e) => onLabelDescriptionChange(e.target.value)}
                        className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 
                                 focus:border-blue-500 focus:outline-none text-sm w-40"
                        placeholder="Description"
                      />
                    </div>
                  )}

                  {/* Auto-save Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={onAutoSaveToggle}
                        className="rounded border-gray-600 bg-gray-800 text-blue-600 
                                 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                      Auto-save
                    </label>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={onSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                             transition-colors duration-200 flex items-center gap-2 text-sm"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    Save
                  </button>

                  {/* Last Saved */}
                  {lastSaved && (
                    <span className="text-xs text-gray-400">
                      {formatLastSaved(lastSaved)}
                    </span>
                  )}
                </div>
              </div>

              {/* Labels Grid/List */}
              <div className="flex-1 overflow-y-auto">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-auto-fill-200 gap-3">
                    {/* Add New Label Card */}
                    <AddNewLabelCard onClick={onCreateLabel} />
                    
                    {filteredLabels.map((label) => (
                      <LabelCard
                        key={label.id}
                        label={label}
                        isSelected={currentLabel?.id === label.id}
                        onClick={() => onLabelSelect(label.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Add New Label Item */}
                    <AddNewLabelItem onClick={onCreateLabel} />
                    
                    {filteredLabels.map((label) => (
                      <LabelListItem
                        key={label.id}
                        label={label}
                        isSelected={currentLabel?.id === label.id}
                        onClick={() => onLabelSelect(label.id)}
                      />
                    ))}
                  </div>
                )}

                {filteredLabels.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    {searchTerm ? 'No labels found matching your search.' : 'No labels in this project yet.'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Label Card Component for Grid View
const LabelCard: React.FC<{
  label: Label;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    onClick();
    // Reset loading after a short delay (the page navigation will handle the rest)
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <motion.div
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      onClick={handleClick}
      className={`bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer
                 hover:border-gray-600 p-3 relative ${
                   isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-700'
                 } ${isLoading ? 'opacity-75' : ''}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        {label.thumbnail ? (
          <img 
            src={label.thumbnail} 
            alt={label.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500 text-xs">
            {label.width}×{label.height}mm
          </div>
        )}
      </div>

      {/* Label Info */}
      <div className="space-y-1">
        <h4 className="text-white text-sm font-medium truncate">{label.name}</h4>
        {label.description && (
          <p className="text-gray-400 text-xs truncate">{label.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            label.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
            label.status === 'DRAFT' ? 'bg-yellow-900 text-yellow-300' :
            'bg-gray-900 text-gray-400'
          }`}>
            {label.status}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(label.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Label List Item Component for List View
const LabelListItem: React.FC<{
  label: Label;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    onClick();
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: isLoading ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.5)' }}
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer relative ${
        isSelected ? 'border-blue-500 bg-blue-900 bg-opacity-20' : 'border-gray-700'
      } ${isLoading ? 'opacity-75' : ''}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
        {label.thumbnail ? (
          <img 
            src={label.thumbnail} 
            alt={label.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500 text-xs">
            {label.width}×{label.height}
          </div>
        )}
      </div>

      {/* Label Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-white text-sm font-medium truncate">{label.name}</h4>
          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
            label.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
            label.status === 'DRAFT' ? 'bg-yellow-900 text-yellow-300' :
            'bg-gray-900 text-gray-400'
          }`}>
            {label.status}
          </span>
        </div>
        {label.description && (
          <p className="text-gray-400 text-xs truncate mt-1">{label.description}</p>
        )}
      </div>

      {/* Dimensions and Date */}
      <div className="text-right text-xs text-gray-500 flex-shrink-0">
        <div>{label.width}×{label.height}mm</div>
        <div>{new Date(label.updatedAt).toLocaleDateString()}</div>
      </div>
    </motion.div>
  );
};

// Add New Label Card Component for Grid View
const AddNewLabelCard: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleClick = async () => {
    setIsCreating(true);
    try {
      await onClick();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: isCreating ? 1 : 1.02 }}
      whileTap={{ scale: isCreating ? 1 : 0.98 }}
      onClick={handleClick}
      className={`bg-gray-800 border-2 border-dashed rounded-lg p-3 cursor-pointer
                 transition-all duration-200 flex flex-col items-center justify-center min-h-[180px]
                 ${isCreating 
                   ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                   : 'border-gray-600 hover:border-blue-500 hover:bg-gray-750'
                 }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
                      ${isCreating ? 'bg-blue-700' : 'bg-blue-600'}`}>
        {isCreating ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <PlusIcon className="w-6 h-6 text-white" />
        )}
      </div>
      <h4 className="text-white text-sm font-medium mb-1">
        {isCreating ? 'Creating...' : 'Add New Label'}
      </h4>
      <p className="text-gray-400 text-xs text-center">
        {isCreating ? 'Please wait' : 'Create a new label for this project'}
      </p>
    </motion.div>
  );
};

// Add New Label Item Component for List View
const AddNewLabelItem: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleClick = async () => {
    setIsCreating(true);
    try {
      await onClick();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: isCreating ? 'rgba(59, 130, 246, 0.1)' : 'rgba(55, 65, 81, 0.5)' }}
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
                 ${isCreating 
                   ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                   : 'border-gray-600 hover:border-blue-500'
                 }`}
    >
      <div className={`w-12 h-8 rounded flex items-center justify-center flex-shrink-0 transition-colors
                      ${isCreating ? 'bg-blue-700' : 'bg-blue-600'}`}>
        {isCreating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <PlusIcon className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium">
          {isCreating ? 'Creating Label...' : 'Add New Label'}
        </h4>
        <p className="text-gray-400 text-xs">
          {isCreating ? 'Please wait' : 'Create a new label for this project'}
        </p>
      </div>

      <div className="text-right text-xs text-gray-500 flex-shrink-0">
        <div>{isCreating ? 'Working...' : 'Click to create'}</div>
      </div>
    </motion.div>
  );
};
