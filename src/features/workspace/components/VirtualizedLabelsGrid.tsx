"use client";
import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FixedSizeGrid as Grid, FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Label } from '@/features/project-management/types/project.types';

interface VirtualizedLabelsGridProps {
  labels: Label[];
  viewMode: 'grid' | 'list' | 'masonry';
  selectedLabels: Set<string>;
  onLabelClick: (label: Label) => void;
  onLabelSelect: (labelId: string) => void;
  renderLabelCard: (label: Label, index: number) => React.ReactNode;
}

interface GridItemData {
  labels: Label[];
  selectedLabels: Set<string>;
  onLabelClick: (label: Label) => void;
  onLabelSelect: (labelId: string) => void;
  renderLabelCard: (label: Label, index: number) => React.ReactNode;
  columnsPerRow?: number;
}

export const VirtualizedLabelsGrid: React.FC<VirtualizedLabelsGridProps> = ({
  labels,
  viewMode,
  selectedLabels,
  onLabelClick,
  onLabelSelect,
  renderLabelCard
}) => {
  const itemData = useMemo(() => ({
    labels,
    selectedLabels,
    onLabelClick,
    onLabelSelect,
    renderLabelCard
  }), [labels, selectedLabels, onLabelClick, onLabelSelect, renderLabelCard]);

  // Grid item renderer
  const GridItem = useCallback(({ columnIndex, rowIndex, style, data }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    data: GridItemData;
  }) => {
    const index = rowIndex * (data.columnsPerRow || 1) + columnIndex;
    const label = data.labels[index];
    
    if (!label) return null;

    return (
      <div style={style}>
        <div style={{ padding: '0.75rem' }}>
          {data.renderLabelCard(label, index)}
        </div>
      </div>
    );
  }, []);

  // List item renderer
  const ListItem = useCallback(({ index, style, data }: {
    index: number;
    style: React.CSSProperties;
    data: GridItemData;
  }) => {
    const label = data.labels[index];
    
    return (
      <div style={style}>
        <div style={{ padding: '0.5rem 0' }}>
          {data.renderLabelCard(label, index)}
        </div>
      </div>
    );
  }, []);

  // Calculate grid dimensions
  const getGridDimensions = (width: number) => {
    const itemWidth = viewMode === 'grid' ? 240 : 200;
    const itemHeight = viewMode === 'grid' ? 200 : 160;
    const columnsPerRow = Math.floor(width / itemWidth);
    const rowCount = Math.ceil(labels.length / columnsPerRow);
    
    return {
      itemWidth,
      itemHeight,
      columnsPerRow,
      rowCount
    };
  };

  if (labels.length === 0) {
    return null;
  }

  // Use regular rendering for small collections to avoid virtualization overhead
  if (labels.length < 50) {
    return (
      <div className={`labels-container ${viewMode}`}>
        {labels.map((label, index) => (
          <motion.div
            key={label.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
          >
            {renderLabelCard(label, index)}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="virtualized-labels-container">
      <AutoSizer>
        {({ height, width }) => {
          if (viewMode === 'list') {
            // Use FixedSizeList for list view
            return (
              <List
                height={height}
                width={width}
                itemCount={labels.length}
                itemSize={80} // Height of each list item
                itemData={{ ...itemData }}
                className="virtualized-list"
              >
                {ListItem}
              </List>
            );
          } else {
            // Use FixedSizeGrid for grid/masonry view
            const { itemWidth, itemHeight, columnsPerRow, rowCount } = getGridDimensions(width);
            
            return (
              <Grid
                height={height}
                width={width}
                columnCount={columnsPerRow}
                rowCount={rowCount}
                columnWidth={itemWidth}
                rowHeight={itemHeight}
                itemData={{ ...itemData, columnsPerRow }}
                className="virtualized-grid"
              >
                {GridItem}
              </Grid>
            );
          }
        }}
      </AutoSizer>
    </div>
  );
};

// CSS-in-JS styles for the virtualized container
const containerStyles = `
.virtualized-labels-container {
  flex: 1;
  min-height: 400px;
  width: 100%;
}

.virtualized-grid {
  outline: none !important;
}

.virtualized-list {
  outline: none !important;
}

/* Scrollbar styling for the virtualized components */
.virtualized-grid::-webkit-scrollbar,
.virtualized-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.virtualized-grid::-webkit-scrollbar-track,
.virtualized-list::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 4px;
}

.virtualized-grid::-webkit-scrollbar-thumb,
.virtualized-list::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  transition: background 0.2s;
}

.virtualized-grid::-webkit-scrollbar-thumb:hover,
.virtualized-list::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('virtualized-labels-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'virtualized-labels-styles';
  styleElement.textContent = containerStyles;
  document.head.appendChild(styleElement);
}
