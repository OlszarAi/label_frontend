'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      bg-gray-900 dark:bg-gray-900 rounded-lg shadow-xl p-6 mx-4 max-w-lg w-full max-h-[90vh] overflow-y-auto
      ${className}
    `}>
      {children}
    </div>
  );
};
