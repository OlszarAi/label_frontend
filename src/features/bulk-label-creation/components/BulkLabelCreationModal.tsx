'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BulkLabelEditor } from './BulkLabelEditor';
import { QuantitySelectionModal } from './QuantitySelectionModal';
import { TemplateSelectionModal } from './TemplateSelectionModal';
import { BulkLabelDesign, BulkCreationStep, BulkCreationOptions, TemplateData } from '../types/bulk-label.types';
import { useBulkLabelCreation } from '../hooks/useBulkLabelCreation';

interface BulkLabelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: (createdLabels: Array<{id: string; name: string; uuid?: string}>) => void;
}

export const BulkLabelCreationModal: React.FC<BulkLabelCreationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<BulkCreationStep>('template');
  const [labelDesign, setLabelDesign] = useState<BulkLabelDesign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  
  const { createBulkLabels, isCreating } = useBulkLabelCreation({
    projectId,
    onSuccess: (labels) => {
      setCurrentStep('completed');
      onSuccess?.(labels);
    },
    onError: (error) => {
      console.error('Bulk creation error:', error);
      // Handle error (show toast, etc.)
    }
  });

  const handleDesignComplete = (design: BulkLabelDesign) => {
    setLabelDesign(design);
    setCurrentStep('quantity');
  };

  const handleQuantityConfirm = async (options: BulkCreationOptions) => {
    if (!labelDesign) return;
    
    setCurrentStep('generating');
    
    await createBulkLabels({
      design: labelDesign,
      options
    });
  };

  const handleTemplateSelect = (template: TemplateData) => {
    setSelectedTemplate(template);
    setCurrentStep('design');
  };

  const handleCreateTemplate = () => {
    // Set empty template for creating new one
    setSelectedTemplate({
      id: 'new-template',
      name: 'Nowy szablon',
      width: 100,
      height: 100, // Changed from 50 to 100 to match DEFAULT_DIMENSIONS
      fabricData: { version: '6.0.0', objects: [], background: '#ffffff' },
      isUserTemplate: false,
      category: 'custom'
    });
    setCurrentStep('design');
  };

  const handleClose = () => {
    setCurrentStep('template');
    setLabelDesign(null);
    setSelectedTemplate(null);
    onClose();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'template':
        return 'Wybierz szablon';
      case 'design':
        return 'Zaprojektuj etykietę';
      case 'quantity':
        return 'Określ ilość';
      case 'generating':
        return 'Tworzenie etykiet...';
      case 'completed':
        return 'Gotowe!';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'template':
        return 'Rozpocznij od gotowego szablonu lub stwórz własny design';
      case 'design':
        return 'Stwórz wzór etykiety używając dostępnych narzędzi';
      case 'quantity':
        return 'Wybierz ile etykiet chcesz utworzyć na podstawie tego wzoru';
      case 'generating':
        return 'Generujemy etykiety z unikalnymi identyfikatorami...';
      case 'completed':
        return 'Etykiety zostały pomyślnie utworzone!';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {getStepTitle()}
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getStepDescription()}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {(['template', 'design', 'quantity', 'generating', 'completed'] as BulkCreationStep[]).map((step, index) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentStep === step
                          ? 'bg-blue-600'
                          : index <= (['template', 'design', 'quantity', 'generating', 'completed'] as BulkCreationStep[]).indexOf(currentStep)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {currentStep === 'template' && (
                  <motion.div
                    key="template"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-full"
                  >
                    <div className="p-4 lg:p-6">
                      <TemplateSelectionModal
                        isOpen={true}
                        onClose={handleClose}
                        onSelectTemplate={handleTemplateSelect}
                        onCreateTemplate={handleCreateTemplate}
                        projectId={projectId}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 'design' && (
                  <motion.div
                    key="design"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-full"
                  >
                    <BulkLabelEditor
                      onDesignComplete={handleDesignComplete}
                      onCancel={() => setCurrentStep('template')}
                      initialTemplate={selectedTemplate}
                    />
                  </motion.div>
                )}

                {currentStep === 'quantity' && labelDesign && (
                  <motion.div
                    key="quantity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-full"
                  >
                    <QuantitySelectionModal
                      design={labelDesign}
                      onConfirm={handleQuantityConfirm}
                      onBack={() => setCurrentStep('design')}
                      isCreating={isCreating}
                    />
                  </motion.div>
                )}

                {currentStep === 'generating' && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center min-h-[300px]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        Tworzenie etykiet w toku...
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'completed' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center min-h-[300px]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                        Etykiety zostały pomyślnie utworzone!
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Zamknij
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
