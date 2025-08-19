'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { Project } from '../../types/project.types';
import './DeleteProjectModal.css';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: Project | null;
}

export function DeleteProjectModal({ isOpen, onClose, onConfirm, project }: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!project) return;
    
    if (confirmText !== project.name) {
      setError('Nazwa projektu nie jest zgodna');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas usuwania projektu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    setError('');
    onClose();
  };

  if (!project) return null;

  const labelCount = project._count?.labels || 0;
  const isConfirmValid = confirmText === project.name;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="delete-project-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="delete-project-modal"
          >
            <div className="delete-project-modal-header">
              <div className="delete-warning-icon">
                <AlertTriangle size={32} />
              </div>
              <h2>Usuń projekt</h2>
              <p>Ta akcja jest nieodwracalna</p>
              <button
                className="delete-project-modal-close"
                onClick={handleClose}
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="delete-project-modal-content">
              {error && (
                <div className="delete-project-modal-error">
                  {error}
                </div>
              )}

              <div className="delete-project-info">
                <div className="project-to-delete">
                  <div
                    className="project-to-delete-icon"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  >
                    {project.icon || project.name[0].toUpperCase()}
                  </div>
                  <div className="project-to-delete-details">
                    <h3>{project.name}</h3>
                    <p>{labelCount} etykiet{labelCount !== 1 ? 'y' : 'a'}</p>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="delete-warning">
                  <div className="warning-content">
                    <h4>⚠️ Ostrzeżenie</h4>
                    <ul>
                      <li>Wszystkie etykiety w tym projekcie zostaną usunięte</li>
                      <li>Wszystkie dane projektu zostaną trwale utracone</li>
                      <li>Ta akcja nie może zostać cofnięta</li>
                    </ul>
                  </div>
                </div>

                <div className="delete-confirmation">
                  <label htmlFor="confirmProjectName">
                    Aby potwierdzić, wpisz nazwę projektu: <strong>{project.name}</strong>
                  </label>
                  <input
                    type="text"
                    id="confirmProjectName"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      setError('');
                    }}
                    placeholder={`Wpisz "${project.name}"`}
                    disabled={isDeleting}
                    className={confirmText && !isConfirmValid ? 'error' : ''}
                  />
                  {confirmText && !isConfirmValid && (
                    <div className="confirmation-error">
                      Nazwa nie jest zgodna
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="delete-project-modal-actions">
              <button
                type="button"
                className="delete-project-btn secondary"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Anuluj
              </button>
              <button
                type="button"
                className="delete-project-btn danger"
                onClick={handleConfirm}
                disabled={isDeleting || !isConfirmValid}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Usuń projekt
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
