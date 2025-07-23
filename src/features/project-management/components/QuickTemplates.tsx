import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'standard' | 'shipping' | 'address' | 'custom';
  description?: string;
  previewColor?: string;
}

interface QuickTemplatesProps {
  onCreateFromTemplate: (template: LabelTemplate) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Predefined templates based on common label sizes
const LABEL_TEMPLATES: LabelTemplate[] = [
  // Standard Address Labels
  { id: 'avery-5160', name: 'Avery 5160', width: 66.7, height: 25.4, category: 'address', description: '1" × 2⅝" Address Labels' },
  { id: 'avery-5161', name: 'Avery 5161', width: 101.6, height: 33.9, category: 'address', description: '1⅓" × 4" Address Labels' },
  { id: 'avery-5162', name: 'Avery 5162', width: 101.6, height: 33.9, category: 'address', description: '1⅓" × 4" Address Labels' },
  
  // Shipping Labels
  { id: 'shipping-standard', name: 'Standard Shipping', width: 101.6, height: 152.4, category: 'shipping', description: '4" × 6" Shipping Label' },
  { id: 'shipping-large', name: 'Large Shipping', width: 203.2, height: 279.4, category: 'shipping', description: '8" × 11" Large Shipping' },
  
  // Standard Labels
  { id: 'round-small', name: 'Small Round', width: 19, height: 19, category: 'standard', description: '¾" Round Labels' },
  { id: 'round-medium', name: 'Medium Round', width: 32, height: 32, category: 'standard', description: '1¼" Round Labels' },
  { id: 'square-small', name: 'Small Square', width: 25.4, height: 25.4, category: 'standard', description: '1" × 1" Square' },
  { id: 'rectangle-wide', name: 'Wide Rectangle', width: 88.9, height: 25.4, category: 'standard', description: '3½" × 1" Rectangle' },
  
  // Custom/Popular formats
  { id: 'business-card', name: 'Business Card Size', width: 89, height: 51, category: 'custom', description: '3.5" × 2" Business Card' },
  { id: 'name-tag', name: 'Name Tag', width: 76.2, height: 50.8, category: 'custom', description: '3" × 2" Name Tag' },
  { id: 'wine-bottle', name: 'Wine Bottle', width: 88.9, height: 127, category: 'custom', description: '3.5" × 5" Wine Label' },
  { id: 'jar-label', name: 'Jar Label', width: 63.5, height: 88.9, category: 'custom', description: '2.5" × 3.5" Jar Label' }
];

const CATEGORY_COLORS = {
  standard: '#3b82f6',
  shipping: '#059669',
  address: '#8b5cf6',
  custom: '#f59e0b'
};

const CATEGORY_NAMES = {
  standard: 'Standard Labels',
  shipping: 'Shipping Labels', 
  address: 'Address Labels',
  custom: 'Custom Formats'
};

export function QuickTemplates({ onCreateFromTemplate, onClose, isOpen }: QuickTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    width: '',
    height: '',
    description: ''
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const filteredTemplates = selectedCategory === 'all' 
    ? LABEL_TEMPLATES 
    : LABEL_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleCreateCustom = () => {
    if (customTemplate.name && customTemplate.width && customTemplate.height) {
      const template: LabelTemplate = {
        id: `custom-${Date.now()}`,
        name: customTemplate.name,
        width: parseFloat(customTemplate.width),
        height: parseFloat(customTemplate.height),
        category: 'custom',
        description: customTemplate.description || `${customTemplate.width} × ${customTemplate.height} mm`
      };
      onCreateFromTemplate(template);
      setCustomTemplate({ name: '', width: '', height: '', description: '' });
      setShowCustomForm(false);
    }
  };

  const getTemplatePreview = (template: LabelTemplate) => {
    const maxSize = 60;
    const ratio = template.width / template.height;
    let width, height;
    
    if (ratio > 1) {
      width = Math.min(maxSize, template.width * 0.5);
      height = width / ratio;
    } else {
      height = Math.min(maxSize, template.height * 0.5);
      width = height * ratio;
    }
    
    return { width, height };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="templates-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="templates-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="templates-header">
              <div className="templates-title">
                <h2>Choose Label Template</h2>
                <p>Start with a pre-made template or create your own</p>
              </div>
              <button onClick={onClose} className="templates-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="templates-content">
              {/* Category Filter */}
              <div className="templates-categories">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                >
                  All Templates
                </button>
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                    style={{ 
                      '--category-color': CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]
                    } as React.CSSProperties}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="templates-grid">
                {filteredTemplates.map((template) => {
                  const preview = getTemplatePreview(template);
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="template-card"
                      onClick={() => onCreateFromTemplate(template)}
                    >
                      <div className="template-preview">
                        <div
                          className="template-shape"
                          style={{
                            width: `${preview.width}px`,
                            height: `${preview.height}px`,
                            backgroundColor: CATEGORY_COLORS[template.category]
                          }}
                        />
                        <div 
                          className="template-category-badge"
                          style={{ backgroundColor: CATEGORY_COLORS[template.category] }}
                        >
                          {template.category}
                        </div>
                      </div>
                      <div className="template-info">
                        <h3>{template.name}</h3>
                        <p className="template-dimensions">
                          {template.width} × {template.height} mm
                        </p>
                        {template.description && (
                          <p className="template-description">{template.description}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Custom Template Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="template-card custom-template-card"
                  onClick={() => setShowCustomForm(true)}
                >
                  <div className="template-preview">
                    <div className="custom-template-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                  </div>
                  <div className="template-info">
                    <h3>Custom Size</h3>
                    <p className="template-description">Create your own template</p>
                  </div>
                </motion.div>
              </div>

              {/* Custom Template Form */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="custom-form"
                  >
                    <h3>Create Custom Template</h3>
                    <div className="custom-form-grid">
                      <div className="form-field">
                        <label>Template Name</label>
                        <input
                          type="text"
                          value={customTemplate.name}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My Custom Label"
                        />
                      </div>
                      <div className="form-field">
                        <label>Width (mm)</label>
                        <input
                          type="number"
                          value={customTemplate.width}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="100"
                          min="1"
                          step="0.1"
                        />
                      </div>
                      <div className="form-field">
                        <label>Height (mm)</label>
                        <input
                          type="number"
                          value={customTemplate.height}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="50"
                          min="1"
                          step="0.1"
                        />
                      </div>
                      <div className="form-field form-field-full">
                        <label>Description (optional)</label>
                        <input
                          type="text"
                          value={customTemplate.description}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of this template"
                        />
                      </div>
                    </div>
                    <div className="custom-form-actions">
                      <button
                        onClick={() => setShowCustomForm(false)}
                        className="form-btn form-btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateCustom}
                        className="form-btn form-btn-primary"
                        disabled={!customTemplate.name || !customTemplate.width || !customTemplate.height}
                      >
                        Create Template
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="templates-footer">
              <p className="templates-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Templates are based on common label manufacturer specifications
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
