'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/providers/AuthProvider';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuthContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          onClose();
          setFormData({
            email: '',
            username: '',
            password: '',
            firstName: '',
            lastName: ''
          });
        } else {
          setError(result.error || 'Błąd logowania');
        }
      } else {
        const result = await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined
        });
        if (result.success) {
          setMode('login');
          setError('');
          setFormData(prev => ({ ...prev, password: '' }));
        } else {
          setError(result.error || 'Błąd rejestracji');
        }
      }
    } catch (error) {
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="auth-modal"
          >
            <button className="auth-modal-close" onClick={onClose}>
              ×
            </button>
            
            <div className="auth-modal-header">
              <h2>{mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}</h2>
              <p>
                {mode === 'login' 
                  ? 'Witaj z powrotem! Zaloguj się do swojego konta.' 
                  : 'Rozpocznij swoją przygodę z LabelMaker'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-modal-form">
              {error && (
                <div className="auth-modal-error">
                  {error}
                </div>
              )}

              <div className="auth-modal-fields">
                <div className="auth-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {mode === 'register' && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="username">Nazwa użytkownika</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="auth-fields-row">
                      <div className="auth-field">
                        <label htmlFor="firstName">Imię</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="auth-field">
                        <label htmlFor="lastName">Nazwisko</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="auth-field">
                  <label htmlFor="password">Hasło</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-modal-submit"
                disabled={isLoading}
              >
                {isLoading 
                  ? (mode === 'login' ? 'Logowanie...' : 'Tworzenie konta...') 
                  : (mode === 'login' ? 'Zaloguj się' : 'Utwórz konto')
                }
              </button>
            </form>

            <div className="auth-modal-switch">
              {mode === 'login' ? (
                <>
                  Nie masz konta?{' '}
                  <button type="button" onClick={switchMode} className="auth-switch-btn">
                    Zarejestruj się
                  </button>
                </>
              ) : (
                <>
                  Masz już konto?{' '}
                  <button type="button" onClick={switchMode} className="auth-switch-btn">
                    Zaloguj się
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
