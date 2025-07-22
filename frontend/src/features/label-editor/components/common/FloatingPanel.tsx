'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  MinusIcon, 
  Bars3Icon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

interface FloatingPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  isCollapsible?: boolean;
  isResizable?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  headerActions?: React.ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  id,
  title,
  children,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 300, height: 400 },
  minSize = { width: 250, height: 200 },
  maxSize = { width: 800, height: 600 },
  isCollapsible = true,
  isResizable = true,
  onClose,
  className = '',
  headerActions,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [isMounted, setIsMounted] = useState(false);

  // Load saved position and size from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(`panel-${id}`);
      if (savedData) {
        try {
          const { position: savedPosition, size: savedSize, isCollapsed: savedCollapsed } = JSON.parse(savedData);
          if (savedPosition) setPosition(savedPosition);
          if (savedSize) setSize(savedSize);
          if (typeof savedCollapsed === 'boolean') setIsCollapsed(savedCollapsed);
        } catch (error) {
          console.warn(`Failed to load saved panel data for ${id}:`, error);
        }
      }
      setIsMounted(true);
    }
  }, [id]);

  // Save position and size to localStorage
  const savePanelState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const panelData = {
        position,
        size,
        isCollapsed,
        lastUpdated: Date.now()
      };
      localStorage.setItem(`panel-${id}`, JSON.stringify(panelData));
    }
  }, [id, position, size, isCollapsed]);

  // Save state when position, size, or collapsed state changes
  useEffect(() => {
    if (isMounted) {
      const timeoutId = setTimeout(savePanelState, 500); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [position, size, isCollapsed, isMounted, savePanelState]);

  // Reset panel position with Ctrl+Alt+R
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setPosition(defaultPosition);
        setSize(defaultSize);
        setIsCollapsed(false);
        setIsMaximized(false);
        // Clear saved state
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`panel-${id}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [id, defaultPosition, defaultSize]);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  // Handle window resize and mounting
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    setIsMounted(true);
    updateWindowSize();

    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized || !isMounted) return;
    
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: Math.max(0, Math.min(windowSize.width - size.width, dragRef.current.startPosX + deltaX)),
        y: Math.max(0, Math.min(windowSize.height - 60, dragRef.current.startPosY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, size, isMaximized, windowSize, isMounted]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized || isCollapsed || !isMounted) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;
      
      const newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startWidth + deltaX));
      const newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startHeight + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, minSize, maxSize, isMaximized, isCollapsed, isMounted]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  const panelSize = isMaximized 
    ? { width: '100vw', height: '100vh' }
    : { width: size.width, height: isCollapsed ? 'auto' : size.height };

  const panelPosition = isMaximized 
    ? { top: 0, left: 0 }
    : { top: position.y, left: position.x };

  return (
    <motion.div
      ref={panelRef}
      style={{
        ...panelPosition,
        ...panelSize,
        zIndex: isDragging || isResizing ? 1000 : 100,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-2xl backdrop-blur-sm
        ${isDragging || isResizing ? 'shadow-3xl ring-2 ring-blue-500' : ''}
        ${isMaximized ? 'rounded-none' : ''}
        ${className}
      `}
    >
      {/* Panel Header */}
      <div 
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700
          bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800
          ${isMaximized ? 'rounded-none' : 'rounded-t-lg'}
          cursor-move select-none
        `}
      >
        <div className="flex items-center space-x-2">
          <Bars3Icon className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          {headerActions}
          
          {isCollapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <MinusIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleToggleMaximize}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <ArrowsPointingInIcon className="w-4 h-4" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Close"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div 
              className="p-4 overflow-auto floating-panel-scrollbar" 
              style={{ maxHeight: isMaximized ? 'calc(100vh - 60px)' : size.height - 60 }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize Handle */}
      {isResizable && !isMaximized && !isCollapsed && (
        <div 
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded-sm group-hover:bg-blue-500 transition-colors"></div>
        </div>
      )}
    </motion.div>
  );
}; 