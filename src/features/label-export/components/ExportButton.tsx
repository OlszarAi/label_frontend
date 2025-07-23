'use client';

import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useExport } from '../hooks/useExport';
import { ExportOptions } from '../types/export.types';
import { DEFAULT_EXPORT_OPTIONS } from '../constants/exportConstants';

interface ExportButtonProps {
  labelIds?: string[];
  projectId: string;
  options?: ExportOptions;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  icon?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  labelIds,
  projectId,
  options = DEFAULT_EXPORT_OPTIONS,
  variant = 'primary',
  size = 'md',
  text,
  icon = true,
  disabled = false,
  className = '',
  onClick
}) => {
  const { isExporting, exportLabels, exportProjectLabels } = useExport();

  const handleExport = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (labelIds && labelIds.length > 0) {
      await exportLabels(labelIds, projectId, options);
    } else {
      await exportProjectLabels(projectId, options);
    }
  };

  // Style variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md',
    minimal: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const defaultText = labelIds && labelIds.length > 0 
    ? `Eksportuj etykiety (${labelIds.length})`
    : 'Eksportuj wszystkie etykiety';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg
        transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {icon && (
        <ArrowDownTrayIcon 
          className={`${iconSizes[size]} ${isExporting ? 'animate-bounce' : ''}`} 
        />
      )}
      
      <span>
        {isExporting 
          ? 'Eksportowanie...' 
          : text || defaultText
        }
      </span>

      {isExporting && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </motion.button>
  );
};
