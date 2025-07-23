import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '../types/project.types';

interface LabelSizeComparatorProps {
  labels: Label[];
  isOpen: boolean;
  onClose: () => void;
}

interface ComparisonLabel extends Label {
  color: string;
  visible: boolean;
}

const COMPARISON_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export function LabelSizeComparator({ labels, isOpen, onClose }: LabelSizeComparatorProps) {
  const [comparisonLabels, setComparisonLabels] = useState<ComparisonLabel[]>([]);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);

  // Initialize comparison labels when opening
  React.useEffect(() => {
    if (isOpen && labels.length > 0) {
      const initialLabels = labels.slice(0, 8).map((label, index) => ({
        ...label,
        color: COMPARISON_COLORS[index],
        visible: index < 4 // Show first 4 by default
      }));
      setComparisonLabels(initialLabels);
    }
  }, [isOpen, labels]);

  const toggleLabelVisibility = (labelId: string) => {
    setComparisonLabels(prev => 
      prev.map(label => 
        label.id === labelId 
          ? { ...label, visible: !label.visible }
          : label
      )
    );
  };

  const visibleLabels = comparisonLabels.filter(label => label.visible);
  
  // Calculate canvas size based on largest label
  const maxWidth = Math.max(...visibleLabels.map(l => l.width), 100);
  const maxHeight = Math.max(...visibleLabels.map(l => l.height), 100);
  
  const canvasWidth = Math.min(600, maxWidth * scale * 2);
  const canvasHeight = Math.min(400, maxHeight * scale * 2);

  // Convert mm to pixels (roughly 3.78 pixels per mm at 96 DPI)
  const mmToPixels = (mm: number) => mm * 3.78 * scale;

  const getFormattedDimensions = (width: number, height: number) => {
    return `${width} × ${height} mm`;
  };

  const getArea = (width: number, height: number) => {
    return (width * height).toLocaleString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="size-comparator-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="size-comparator-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="comparator-header">
              <div className="comparator-title">
                <h2>Label Size Comparison</h2>
                <p>Compare dimensions and proportions of your labels</p>
              </div>
              <button onClick={onClose} className="comparator-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="comparator-content">
              {/* Controls */}
              <div className="comparator-controls">
                <div className="control-group">
                  <label>Scale: {(scale * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="scale-slider"
                  />
                </div>
                
                <div className="control-group">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`control-btn ${showGrid ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <path d="M9 3v18M3 9h18"/>
                    </svg>
                    Grid
                  </button>
                  
                  <button
                    onClick={() => setShowRuler(!showRuler)}
                    className={`control-btn ${showRuler ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 12h18m-9-9v18"/>
                    </svg>
                    Ruler
                  </button>
                </div>
              </div>

              <div className="comparator-main">
                {/* Label Selection */}
                <div className="label-selection">
                  <h3>Select Labels to Compare</h3>
                  <div className="label-list">
                    {comparisonLabels.map((label) => (
                      <div
                        key={label.id}
                        className={`label-item ${label.visible ? 'visible' : ''}`}
                        onClick={() => toggleLabelVisibility(label.id)}
                      >
                        <div 
                          className="label-color-indicator"
                          style={{ backgroundColor: label.color }}
                        />
                        <div className="label-info">
                          <span className="label-name">{label.name}</span>
                          <span className="label-dims">
                            {getFormattedDimensions(label.width, label.height)}
                          </span>
                        </div>
                        <div className="label-checkbox">
                          <input
                            type="checkbox"
                            checked={label.visible}
                            onChange={() => toggleLabelVisibility(label.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparison Canvas */}
                <div className="comparison-canvas-container">
                  <svg
                    className="comparison-canvas"
                    width={canvasWidth}
                    height={canvasHeight}
                    viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                  >
                    {/* Background Grid */}
                    {showGrid && (
                      <defs>
                        <pattern
                          id="grid"
                          width={mmToPixels(10)}
                          height={mmToPixels(10)}
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d={`M ${mmToPixels(10)} 0 L 0 0 0 ${mmToPixels(10)}`}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                          />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </defs>
                    )}

                    {/* Ruler */}
                    {showRuler && (
                      <g className="ruler">
                        {/* Horizontal ruler */}
                        <line
                          x1="0"
                          y1="20"
                          x2={canvasWidth}
                          y2="20"
                          stroke="rgba(59, 130, 246, 0.6)"
                          strokeWidth="2"
                        />
                        {Array.from({ length: Math.floor(canvasWidth / mmToPixels(10)) }).map((_, i) => (
                          <g key={`h-${i}`}>
                            <line
                              x1={mmToPixels(10 * i)}
                              y1="15"
                              x2={mmToPixels(10 * i)}
                              y2="25"
                              stroke="rgba(59, 130, 246, 0.6)"
                              strokeWidth="1"
                            />
                            <text
                              x={mmToPixels(10 * i)}
                              y="12"
                              fill="rgba(59, 130, 246, 0.8)"
                              fontSize="10"
                              textAnchor="middle"
                            >
                              {i * 10}
                            </text>
                          </g>
                        ))}

                        {/* Vertical ruler */}
                        <line
                          x1="20"
                          y1="0"
                          x2="20"
                          y2={canvasHeight}
                          stroke="rgba(59, 130, 246, 0.6)"
                          strokeWidth="2"
                        />
                        {Array.from({ length: Math.floor(canvasHeight / mmToPixels(10)) }).map((_, i) => (
                          <g key={`v-${i}`}>
                            <line
                              x1="15"
                              y1={mmToPixels(10 * i)}
                              x2="25"
                              y2={mmToPixels(10 * i)}
                              stroke="rgba(59, 130, 246, 0.6)"
                              strokeWidth="1"
                            />
                            <text
                              x="12"
                              y={mmToPixels(10 * i) + 3}
                              fill="rgba(59, 130, 246, 0.8)"
                              fontSize="10"
                              textAnchor="middle"
                              transform={`rotate(-90, 12, ${mmToPixels(10 * i) + 3})`}
                            >
                              {i * 10}
                            </text>
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Label Rectangles */}
                    <g className="labels" transform="translate(50, 50)">
                      {visibleLabels.map((label, index) => {
                        const width = mmToPixels(label.width);
                        const height = mmToPixels(label.height);
                        const x = index * 20; // Slight offset for visibility
                        const y = index * 15;

                        return (
                          <g key={label.id}>
                            {/* Label Rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={`${label.color}40`}
                              stroke={label.color}
                              strokeWidth="2"
                              rx="4"
                            />
                            
                            {/* Label Name */}
                            <text
                              x={x + width / 2}
                              y={y + height / 2}
                              fill={label.color}
                              fontSize="12"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {label.name}
                            </text>

                            {/* Dimensions */}
                            <text
                              x={x + width / 2}
                              y={y + height + 15}
                              fill="rgba(255,255,255,0.7)"
                              fontSize="10"
                              textAnchor="middle"
                            >
                              {getFormattedDimensions(label.width, label.height)}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              </div>

              {/* Comparison Stats */}
              {visibleLabels.length > 1 && (
                <div className="comparison-stats">
                  <h3>Comparison Statistics</h3>
                  <div className="stats-grid">
                    {visibleLabels.map((label) => (
                      <div key={label.id} className="stat-card">
                        <div 
                          className="stat-color"
                          style={{ backgroundColor: label.color }}
                        />
                        <div className="stat-info">
                          <h4>{label.name}</h4>
                          <div className="stat-details">
                            <span>Size: {getFormattedDimensions(label.width, label.height)}</span>
                            <span>Area: {getArea(label.width, label.height)} mm²</span>
                            <span>Ratio: {(label.width / label.height).toFixed(2)}:1</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
