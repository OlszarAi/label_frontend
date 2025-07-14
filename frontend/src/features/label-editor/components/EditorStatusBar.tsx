'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  ServerIcon,
  CpuChipIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface EditorStatusBarProps {
  isConnected: boolean;
  lastSaved?: Date | null;
  autoSave: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  zoom: number;
  objectCount: number;
  canvasSize: { width: number; height: number };
  onToggleAutoSave: () => void;
  onSave: () => void;
  onToggleGrid?: () => void;
  showGrid?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  lastSaved,
  autoSave,
  isSaving,
  hasUnsavedChanges,
  zoom,
  objectCount,
  canvasSize,
  onToggleAutoSave,
  onSave,
  onToggleGrid,
  showGrid = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [ping, setPing] = useState<number | null>(null);

  // Simulate connection monitoring
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('/api/health/ping', { 
          method: 'HEAD',
          cache: 'no-cache' 
        });
        
        if (response.ok) {
          const endTime = Date.now();
          setPing(endTime - startTime);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
          setPing(null);
        }
      } catch {
        setConnectionStatus('disconnected');
        setPing(null);
      }
    };

    // Check immediately
    checkConnection();

    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'reconnecting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return CheckCircleIcon;
      case 'disconnected': return ExclamationTriangleIcon;
      case 'reconnecting': return ClockIcon;
      default: return WifiIcon;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-8 panel-glass border-t border-gray-800/50 flex items-center justify-between px-4 text-xs text-gray-400 relative z-10"
    >
      {/* Left Section - Connection & Server Status */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {React.createElement(getConnectionIcon(), { 
            className: `w-3 h-3 ${getConnectionColor()} ${connectionStatus === 'reconnecting' ? 'animate-pulse' : ''}` 
          })}
          <span className={getConnectionColor()}>
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
            {connectionStatus === 'reconnecting' && 'Reconnecting...'}
          </span>
          {ping !== null && connectionStatus === 'connected' && (
            <span className="text-gray-500">({ping}ms)</span>
          )}
        </div>

        {/* Server Status */}
        <div className="flex items-center gap-1.5">
          <ServerIcon className="w-3 h-3 text-blue-400" />
          <span>Server Ready</span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        {/* Canvas Info */}
        <div className="flex items-center gap-1.5">
          <CpuChipIcon className="w-3 h-3 text-purple-400" />
          <span>{canvasSize.width}×{canvasSize.height}mm</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>{objectCount} objects</span>
        </div>

        <div className="flex items-center gap-1.5">
          <EyeIcon className="w-3 h-3 text-cyan-400" />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Center Section - Save Status */}
      <div className="flex items-center gap-4">
        {/* Save Status */}
        {isSaving && (
          <div className="flex items-center gap-1.5 text-blue-400">
            <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        
        {!isSaving && hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 text-yellow-400">
            <ClockIcon className="w-3 h-3" />
            <span>Unsaved changes</span>
          </div>
        )}

        {!isSaving && !hasUnsavedChanges && lastSaved && (
          <div className="flex items-center gap-1.5 text-green-400">
            <CloudArrowUpIcon className="w-3 h-3" />
            <span>Saved {formatLastSaved(lastSaved)}</span>
          </div>
        )}

        {/* Auto-save indicator */}
        {autoSave && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">Auto-save ON</span>
          </div>
        )}
      </div>

      {/* Right Section - Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Grid Toggle */}
        {onToggleGrid && (
          <button
            onClick={onToggleGrid}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showGrid 
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>Grid</span>
          </button>
        )}

        {/* Auto-save Toggle */}
        <button
          onClick={onToggleAutoSave}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            autoSave 
              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <span>Auto-save</span>
          <span className={`text-xs ${autoSave ? 'text-green-300' : 'text-gray-500'}`}>
            {autoSave ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Manual Save */}
        {!autoSave && hasUnsavedChanges && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            <CloudArrowUpIcon className="w-3 h-3" />
            <span>Save</span>
          </button>
        )}

        {/* Performance indicator */}
        <div className="flex items-center gap-1.5 text-gray-500">
          <div className="w-1 h-1 bg-green-400 rounded-full" />
          <div className="w-1 h-1 bg-green-400 rounded-full" />
          <div className="w-1 h-1 bg-yellow-400 rounded-full" />
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="ml-1">Performance</span>
        </div>
      </div>
    </motion.div>
  );
};
