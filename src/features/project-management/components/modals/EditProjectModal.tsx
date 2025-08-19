'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Project } from '../../types/project.types';
import './EditProjectModal.css';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditProjectData) => Promise<void>;
  project: Project | null;
}

export interface EditProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

const DEFAULT_ICONS = [
  '📦', '🏷️', '📊', '🎨', '📐', '⚙️', '💼', '📋',
  '🔖', '📌', '🎯', '💡', '🚀', '⭐', '🔥', '💎',
  '🛍️', '🏠', '🚗', '📱', '💻', '☕', '🍕', '🎵'
];

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#f43f5e', '#22c55e', '#eab308', '#a855f7',
  '#0ea5e9', '#e11d48', '#059669', '#d97706', '#7c3aed'
];

export function EditProjectModal({ isOpen, onClose, onSubmit, project }: EditProjectModalProps) {
  const [formData, setFormData] = useState<EditProjectData>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
    icon: DEFAULT_ICONS[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Aktualizuj formularz gdy projekt się zmieni
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color || DEFAULT_COLORS[0],
        icon: project.icon || DEFAULT_ICONS[0]
      });
      setError('');
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nazwa projektu jest wymagana');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania projektu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setError('');
    onClose();
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="edit-project-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="edit-project-modal"
          >
            <div className="edit-project-modal-header">
              <h2>Edytuj projekt</h2>
              <p>Zaktualizuj informacje o swoim projekcie</p>
              <button
                className="edit-project-modal-close"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-project-modal-form">
              {error && (
                <div className="edit-project-modal-error">
                  {error}
                </div>
              )}

              <div className="edit-project-form-fields">
                {/* Nazwa projektu */}
                <div className="edit-project-field">
                  <label htmlFor="editProjectName">Nazwa projektu</label>
                  <input
                    type="text"
                    id="editProjectName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Wpisz nazwę projektu..."
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Opis projektu */}
                <div className="edit-project-field">
                  <label htmlFor="editProjectDescription">
                    Opis projektu
                    <span className="field-optional">opcjonalne</span>
                  </label>
                  <textarea
                    id="editProjectDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Opisz swój projekt..."
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                {/* Wybór ikony */}
                <div className="edit-project-field">
                  <label>Ikona projektu</label>
                  <div className="icon-selection">
                    {DEFAULT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        disabled={isLoading}
                        title={`Wybierz ikonę ${icon}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wybór koloru */}
                <div className="edit-project-field">
                  <label>Kolor projektu</label>
                  <div className="color-selection">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        disabled={isLoading}
                        title={`Wybierz kolor ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Podgląd */}
                <div className="edit-project-field">
                  <label>Podgląd</label>
                  <div className="project-preview">
                    <div
                      className="project-preview-icon"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <div className="project-preview-info">
                      <h3>{formData.name || 'Nazwa projektu'}</h3>
                      {formData.description && (
                        <p>{formData.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="edit-project-modal-actions">
                <button
                  type="button"
                  className="edit-project-btn secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="edit-project-btn primary"
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Zapisz zmiany
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
