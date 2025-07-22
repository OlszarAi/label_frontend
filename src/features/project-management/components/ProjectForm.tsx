import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreateProjectRequest, UpdateProjectRequest, Project } from '../types/project.types';

interface ProjectFormProps {
  project?: Project; // If provided, form is in edit mode
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
];

const PRESET_ICONS = [
  '📊', '🎯', '💼', '🚀', '⭐', '🔥', '💡', '🎨',
  '📋', '🏆', '🎪', '🌟', '🎭', '🎮', '🎵', '🎬',
  '📈', '💻', '🔧', '⚡', '🌐', '📱', '🔬', '🚧'
];

export function ProjectForm({ project, onSubmit, onCancel, loading = false }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    icon: project?.icon || '',
    color: project?.color || PRESET_COLORS[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleIconClick = (icon: string) => {
    console.log('handleIconClick called with:', icon);
    setFormData(prev => {
      const newFormData = { ...prev, icon };
      console.log('Setting formData from:', prev, 'to:', newFormData);
      return newFormData;
    });
  };

  const handleNoneClick = () => {
    console.log('handleNoneClick called');
    setFormData(prev => {
      const newFormData = { ...prev, icon: '' };
      console.log('Setting formData from:', prev, 'to:', newFormData);
      return newFormData;
    });
  };

  // Debug: Watch for icon changes
  React.useEffect(() => {
    console.log('FormData icon changed:', formData.icon);
  }, [formData.icon]);

  // Debug: Watch for all formData changes
  React.useEffect(() => {
    console.log('FormData changed:', formData);
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.color) {
      newErrors.color = 'Please select a color';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before submit:', formData);
    
    if (validateForm()) {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon || undefined,
        color: formData.color
      };
      
      console.log('Submitting data:', submitData);
      onSubmit(submitData);
    } else {
      console.log('Form validation failed');
    }
  };

  const isEditMode = !!project;

  return (
    <div className="project-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="project-modal"
      >
        <div className="project-modal-header">
          <h3 className="project-modal-title">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="project-modal-content">
            {/* Project Name */}
            <div className="project-form-group">
              <label htmlFor="name" className="project-form-label">
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`project-form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="project-form-error">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="project-form-group">
              <label htmlFor="description" className="project-form-label">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="project-form-textarea"
                placeholder="Optional project description"
              />
            </div>

            {/* Icon Selection */}
            <div className="project-form-group">
              <label className="project-form-label">
                Icon (Optional)
              </label>
              <div className="project-icon-grid">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNoneClick();
                  }}
                  className={`project-icon-btn none ${!formData.icon ? 'active' : ''}`}
                >
                  None
                </button>
                {PRESET_ICONS.map((icon, index) => (
                  <button
                    key={`icon-${index}-${icon}`}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleIconClick(icon);
                    }}
                    className={`project-icon-btn ${formData.icon === icon ? 'active' : ''}`}
                    title={`Select icon: ${icon}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="project-form-group">
              <label className="project-form-label">
                Color *
              </label>
              <div className="project-color-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`project-color-btn ${formData.color === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {errors.color && (
                <p className="project-form-error">{errors.color}</p>
              )}
            </div>

            {/* Preview */}
            <div className="project-form-group">
              <label className="project-form-label">
                Preview
              </label>
              <div className="project-preview">
                <div className="project-preview-content">
                  {formData.icon ? (
                    <div 
                      className="project-preview-icon"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                  ) : (
                    <div 
                      className="project-preview-icon default"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.name.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                  <div className="project-preview-details">
                    <p className="project-preview-title">
                      {formData.name || 'Project Name'}
                    </p>
                    {formData.description && (
                      <p className="project-preview-description">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="project-modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="project-modal-btn project-modal-btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="project-modal-btn project-modal-btn-primary"
            >
              {loading ? (
                <>
                  <div className="projects-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}