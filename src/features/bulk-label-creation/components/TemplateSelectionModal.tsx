'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { TemplateService, Template } from '../services/TemplateService';
import { TemplateData } from '../types/bulk-label.types';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void; // Make optional since we don't use it in embedded mode
  onSelectTemplate: (template: TemplateData) => void;
  onCreateTemplate?: () => void; // Option to create new template
  projectId?: string; // Made optional since we now use global templates API
}

const BUILT_IN_TEMPLATES: TemplateData[] = [
  {
    id: 'standard-100x50',
    name: 'Standardowa 100×50mm',
    width: 100,
    height: 50,
    fabricData: { version: '6.0.0', objects: [], background: '#ffffff' },
    isUserTemplate: false,
    category: 'standard'
  },
  {
    id: 'address-label',
    name: 'Etykieta adresowa',
    width: 66.7,
    height: 25.4,
    fabricData: { version: '6.0.0', objects: [], background: '#ffffff' },
    isUserTemplate: false,
    category: 'address'
  },
  {
    id: 'shipping-large',
    name: 'Etykieta przesyłkowa',
    width: 101.6,
    height: 152.4,
    fabricData: { version: '6.0.0', objects: [], background: '#ffffff' },
    isUserTemplate: false,
    category: 'shipping'
  }
];

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onSelectTemplate,
  onCreateTemplate
}) => {
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserTemplates();
    }
  }, [isOpen]);

  const loadUserTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await TemplateService.getTemplates({ limit: 50 });
      setUserTemplates(response.data);
    } catch (error) {
      console.error('Failed to load user templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert API templates to TemplateData format
  const convertToTemplateData = (template: Template): TemplateData => ({
    id: template.id,
    name: template.name,
    width: template.width,
    height: template.height,
    fabricData: template.fabricData,
    thumbnail: template.thumbnail,
    isUserTemplate: !template.isSystem,
    category: template.category.toLowerCase() as TemplateData['category']
  });

  const allTemplates = [
    ...BUILT_IN_TEMPLATES,
    ...userTemplates.map(convertToTemplateData)
  ];

  return (
    <div className="w-full h-full">
      <div className="h-full overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Empty template - start from scratch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              onClick={() => onSelectTemplate({
                id: 'empty',
                name: 'Pusty szablon',
                width: 100,
                height: 50,
                fabricData: { version: '6.0.0', objects: [], background: '#ffffff' },
                isUserTemplate: false,
                category: 'custom'
              })}
            >
                          <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <PlusIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Stwórz od zera
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rozpocznij z pustym projektem
              </p>
            </div>
          </motion.div>

          {/* Create template option */}
          {onCreateTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              onClick={onCreateTemplate}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-200 dark:bg-blue-700 rounded-lg flex items-center justify-center mb-4">
                  <PlusIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Stwórz nowy szablon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zaprojektuj własny szablon do wielokrotnego użytku
                </p>
              </div>
            </motion.div>
          )}

          {/* Built-in and user templates */}
            {allTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-md mb-3 flex items-center justify-center">
                  {template.thumbnail ? (
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {template.width} × {template.height} mm
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {template.name}
                    </h3>
                    {template.isUserTemplate && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        Mój
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {template.width} × {template.height} mm
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
