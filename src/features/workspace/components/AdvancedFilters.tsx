"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Ruler,
  Tag,
  Palette,
  Filter,
  X,
  RotateCcw
} from 'lucide-react';
import { Label } from '@/features/project-management/types/project.types';
import './advanced-filters.css';

export interface FilterState {
  dateRange: {
    from: string;
    to: string;
  };
  sizeRange: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
  hasBackground: boolean | null;
  hasImages: boolean | null;
  hasText: boolean | null;
  colors: string[];
  tags: string[];
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  labels: Label[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  labels
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Get unique values from labels for filter options
  const filterOptions = React.useMemo(() => {
    const sizes = labels.map(l => ({ width: l.width || 0, height: l.height || 0 }));
    const minWidth = Math.min(...sizes.map(s => s.width));
    const maxWidth = Math.max(...sizes.map(s => s.width));
    const minHeight = Math.min(...sizes.map(s => s.height));
    const maxHeight = Math.max(...sizes.map(s => s.height));

    // Extract colors from label data (this would need to be implemented based on your label structure)
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    // Extract tags (this would need to be implemented based on your label structure)
    const tags = ['urgent', 'draft', 'approved', 'template'];

    return {
      sizeRange: { minWidth, maxWidth, minHeight, maxHeight },
      colors,
      tags
    };
  }, [labels]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      dateRange: { from: '', to: '' },
      sizeRange: {
        minWidth: filterOptions.sizeRange.minWidth,
        maxWidth: filterOptions.sizeRange.maxWidth,
        minHeight: filterOptions.sizeRange.minHeight,
        maxHeight: filterOptions.sizeRange.maxHeight,
      },
      hasBackground: null,
      hasImages: null,
      hasText: null,
      colors: [],
      tags: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="filters-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="filters-panel"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="filters-header">
            <div className="header-content">
              <Filter size={20} />
              <h3>Zaawansowane filtry</h3>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Filters Content */}
          <div className="filters-content">
            {/* Date Range */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Calendar size={16} />
                <span>Zakres dat</span>
              </div>
              <div className="date-inputs">
                <div className="input-group">
                  <label>Od:</label>
                  <input
                    type="date"
                    value={localFilters.dateRange.from}
                    onChange={(e) => updateFilters({
                      dateRange: { ...localFilters.dateRange, from: e.target.value }
                    })}
                    className="date-input"
                  />
                </div>
                <div className="input-group">
                  <label>Do:</label>
                  <input
                    type="date"
                    value={localFilters.dateRange.to}
                    onChange={(e) => updateFilters({
                      dateRange: { ...localFilters.dateRange, to: e.target.value }
                    })}
                    className="date-input"
                  />
                </div>
              </div>
            </div>

            {/* Size Range */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Ruler size={16} />
                <span>Rozmiar etykiety</span>
              </div>
              <div className="size-inputs">
                <div className="size-row">
                  <label>Szerokość:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={localFilters.sizeRange.minWidth}
                      onChange={(e) => updateFilters({
                        sizeRange: { ...localFilters.sizeRange, minWidth: Number(e.target.value) }
                      })}
                      className="size-input"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={localFilters.sizeRange.maxWidth}
                      onChange={(e) => updateFilters({
                        sizeRange: { ...localFilters.sizeRange, maxWidth: Number(e.target.value) }
                      })}
                      className="size-input"
                      placeholder="Max"
                    />
                    <span className="unit">mm</span>
                  </div>
                </div>
                <div className="size-row">
                  <label>Wysokość:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={localFilters.sizeRange.minHeight}
                      onChange={(e) => updateFilters({
                        sizeRange: { ...localFilters.sizeRange, minHeight: Number(e.target.value) }
                      })}
                      className="size-input"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={localFilters.sizeRange.maxHeight}
                      onChange={(e) => updateFilters({
                        sizeRange: { ...localFilters.sizeRange, maxHeight: Number(e.target.value) }
                      })}
                      className="size-input"
                      placeholder="Max"
                    />
                    <span className="unit">mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Type */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Tag size={16} />
                <span>Typ zawartości</span>
              </div>
              <div className="content-filters">
                <label className="checkbox-filter">
                  <input
                    type="checkbox"
                    checked={localFilters.hasBackground === true}
                    onChange={(e) => updateFilters({
                      hasBackground: e.target.checked ? true : null
                    })}
                  />
                  <span>Ma tło</span>
                </label>
                <label className="checkbox-filter">
                  <input
                    type="checkbox"
                    checked={localFilters.hasImages === true}
                    onChange={(e) => updateFilters({
                      hasImages: e.target.checked ? true : null
                    })}
                  />
                  <span>Zawiera obrazy</span>
                </label>
                <label className="checkbox-filter">
                  <input
                    type="checkbox"
                    checked={localFilters.hasText === true}
                    onChange={(e) => updateFilters({
                      hasText: e.target.checked ? true : null
                    })}
                  />
                  <span>Zawiera tekst</span>
                </label>
              </div>
            </div>

            {/* Colors */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Palette size={16} />
                <span>Kolory</span>
              </div>
              <div className="color-filters">
                {filterOptions.colors.map(color => (
                  <button
                    key={color}
                    className={`color-chip ${localFilters.colors.includes(color) ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const newColors = localFilters.colors.includes(color)
                        ? localFilters.colors.filter(c => c !== color)
                        : [...localFilters.colors, color];
                      updateFilters({ colors: newColors });
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Tag size={16} />
                <span>Tagi</span>
              </div>
              <div className="tag-filters">
                {filterOptions.tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-chip ${localFilters.tags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => {
                      const newTags = localFilters.tags.includes(tag)
                        ? localFilters.tags.filter(t => t !== tag)
                        : [...localFilters.tags, tag];
                      updateFilters({ tags: newTags });
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="filters-footer">
            <button 
              className="filter-btn secondary"
              onClick={handleResetFilters}
            >
              <RotateCcw size={16} />
              Resetuj
            </button>
            <button 
              className="filter-btn primary"
              onClick={handleApplyFilters}
            >
              Zastosuj filtry
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
