import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '../types/project.types';

interface SearchSuggestion {
  type: 'dimension' | 'name' | 'format' | 'recent';
  value: string;
  label: string;
  count?: number;
}

interface AdvancedSearchProps {
  labels: Label[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onFiltersApply: (filters: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  format?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  hasDescription?: boolean;
}

export function AdvancedSearch({ 
  labels, 
  searchTerm, 
  onSearchChange, 
  onFiltersApply,
  className = ''
}: AdvancedSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Generate search suggestions based on current input and available labels
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      // Show popular dimensions and recent searches when no input
      const dimensionSuggestions = getPopularDimensions();
      const recentSuggestions = recentSearches.slice(0, 3).map(search => ({
        type: 'recent' as const,
        value: search,
        label: search
      }));
      
      setSuggestions([...recentSuggestions, ...dimensionSuggestions]);
      return;
    }

    const newSuggestions: SearchSuggestion[] = [];
    const term = searchTerm.toLowerCase();

    // Name matches
    const nameMatches = labels
      .filter(label => label.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map(label => ({
        type: 'name' as const,
        value: label.name,
        label: `${label.name} (${label.width}×${label.height}mm)`,
        count: 1
      }));

    // Dimension matches (e.g., "100" suggests "100mm width/height")
    const numberMatch = term.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1]);
      const dimensionMatches = labels
        .filter(label => label.width === number || label.height === number)
        .slice(0, 2)
        .map(label => ({
          type: 'dimension' as const,
          value: `${label.width}×${label.height}`,
          label: `${label.width} × ${label.height} mm`,
          count: labels.filter(l => l.width === label.width && l.height === label.height).length
        }));
      
      newSuggestions.push(...dimensionMatches);
    }

    // Format suggestions
    if (['square', 'landscape', 'portrait', 'banner'].some(format => format.includes(term))) {
      const formatSuggestions = getFormatSuggestions(term);
      newSuggestions.push(...formatSuggestions);
    }

    newSuggestions.push(...nameMatches);
    setSuggestions(newSuggestions.slice(0, 8));
  }, [searchTerm, labels, recentSearches]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPopularDimensions = (): SearchSuggestion[] => {
    const dimensionCounts = new Map<string, number>();
    
    labels.forEach(label => {
      const key = `${label.width}×${label.height}`;
      dimensionCounts.set(key, (dimensionCounts.get(key) || 0) + 1);
    });

    return Array.from(dimensionCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([dimension, count]) => ({
        type: 'dimension',
        value: dimension,
        label: `${dimension} mm`,
        count
      }));
  };

  const getFormatSuggestions = (term: string): SearchSuggestion[] => {
    const formats = ['square', 'landscape', 'portrait', 'banner'];
    return formats
      .filter(format => format.includes(term))
      .map(format => ({
        type: 'format',
        value: format,
        label: `${format.charAt(0).toUpperCase()}${format.slice(1)} labels`,
        count: labels.filter(label => {
          const ratio = label.width / label.height;
          switch (format) {
            case 'square': return ratio >= 0.8 && ratio <= 1.2;
            case 'landscape': return ratio > 1.2 && ratio <= 3;
            case 'portrait': return ratio < 0.8 && ratio >= 0.3;
            case 'banner': return ratio > 3 || ratio < 0.3;
            default: return false;
          }
        }).length
      }));
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSearchChange(suggestion.value);
    addToRecentSearches(suggestion.value);
    setShowSuggestions(false);
  };

  const addToRecentSearches = (search: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== search);
      return [search, ...filtered].slice(0, 5);
    });
  };

  const handleAdvancedFiltersApply = () => {
    onFiltersApply(filters);
    setShowAdvancedFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersApply({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== null);
    }
    return value !== undefined && value !== null;
  });

  return (
    <div className={`advanced-search ${className}`}>
      {/* Main Search Input */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          
          <input
            type="text"
            placeholder="Search by name, dimensions (e.g., 100×50), or format..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="search-input-advanced"
          />
          
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="search-clear"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`advanced-filters-toggle ${hasActiveFilters ? 'has-filters' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
          </svg>
          Filters
          {hasActiveFilters && <span className="filter-indicator" />}
        </button>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="search-suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.type}-${suggestion.value}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`suggestion-item suggestion-${suggestion.type}`}
              >
                <div className="suggestion-icon">
                  {suggestion.type === 'name' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  )}
                  {suggestion.type === 'dimension' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <path d="M9 3v18M3 9h18"/>
                    </svg>
                  )}
                  {suggestion.type === 'format' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  )}
                  {suggestion.type === 'recent' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  )}
                </div>
                
                <div className="suggestion-content">
                  <span className="suggestion-label">{suggestion.label}</span>
                  {suggestion.count && (
                    <span className="suggestion-count">{suggestion.count} label{suggestion.count !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="advanced-filters-panel"
          >
            <div className="filters-content">
              <h3>Advanced Filters</h3>
              
              {/* Dimension Filters */}
              <div className="filter-group">
                <h4>Dimensions (mm)</h4>
                <div className="dimension-filters">
                  <div className="dimension-row">
                    <label>Width:</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.dimensions?.minWidth || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          minWidth: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      }))}
                      className="dimension-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.dimensions?.maxWidth || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          maxWidth: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      }))}
                      className="dimension-input"
                    />
                  </div>
                  <div className="dimension-row">
                    <label>Height:</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.dimensions?.minHeight || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          minHeight: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      }))}
                      className="dimension-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.dimensions?.maxHeight || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          maxHeight: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      }))}
                      className="dimension-input"
                    />
                  </div>
                </div>
              </div>

              {/* Format Filters */}
              <div className="filter-group">
                <h4>Label Format</h4>
                <div className="format-checkboxes">
                  {['square', 'landscape', 'portrait', 'banner'].map(format => (
                    <label key={format} className="format-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.format?.includes(format) || false}
                        onChange={(e) => {
                          const currentFormats = filters.format || [];
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              format: [...currentFormats, format]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              format: currentFormats.filter(f => f !== format)
                            }));
                          }
                        }}
                      />
                      <span className="checkbox-label">
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div className="filter-group">
                <h4>Other</h4>
                <label className="format-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.hasDescription || false}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasDescription: e.target.checked || undefined
                    }))}
                  />
                  <span className="checkbox-label">Has description</span>
                </label>
              </div>

              {/* Filter Actions */}
              <div className="filter-actions">
                <button onClick={clearFilters} className="filter-btn filter-btn-clear">
                  Clear All
                </button>
                <button onClick={handleAdvancedFiltersApply} className="filter-btn filter-btn-apply">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="suggestions-backdrop"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
