/**
 * Dedykowany komponent przycisku do tworzenia etykiet
 * Ujednolicony interfejs dla wszystkich miejsc gdzie tworzymy etykiety
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLabelManagement } from '../hooks/useLabelManagement';
import { Label } from '../services/labelManagementService';

interface CreateLabelButtonProps {
  projectId: string;
  variant?: 'primary' | 'secondary' | 'minimal' | 'fab';
  size?: 'sm' | 'md' | 'lg';
  navigateToEditor?: boolean;
  children?: React.ReactNode;
  className?: string;
  onLabelCreated?: (label: Label) => void;
  disabled?: boolean;
}

export const CreateLabelButton: React.FC<CreateLabelButtonProps> = ({
  projectId,
  variant = 'primary',
  size = 'md',
  navigateToEditor = false,
  children,
  className = '',
  onLabelCreated,
  disabled = false,
}) => {
  const labelManager = useLabelManagement({
    projectId,
    onLabelCreated,
  });

  const handleClick = async () => {
    if (disabled || labelManager.isCreating) return;

    if (navigateToEditor) {
      await labelManager.createLabelAndNavigate();
    } else {
      await labelManager.createSimpleLabel();
    }
  };

  // Style variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md',
    minimal: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
    fab: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl rounded-full',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  
  const buttonClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  const defaultContent = (
    <>
      {labelManager.isCreating ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Creating...</span>
        </div>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Label</span>
        </>
      )}
    </>
  );

  if (variant === 'fab') {
    return (
      <motion.button
        onClick={handleClick}
        disabled={disabled || labelManager.isCreating}
        className={buttonClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children || (
          labelManager.isCreating ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || labelManager.isCreating}
      className={buttonClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {children || defaultContent}
    </motion.button>
  );
};
