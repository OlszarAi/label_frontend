'use client';

import { useState, useRef } from 'react';
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
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: '#ef4444'
  });
  const [password, setPassword] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const { login, register } = useAuthContext();

  // Funkcja sprawdzająca siłę hasła
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: '', color: '#ef4444' });
      return;
    }

    let score = 0;
    let feedback = '';
    let color = '#ef4444';

    // Sprawdzenia
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (isLongEnough) score += 1;
    if (hasLower) score += 1;
    if (hasUpper) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecial) score += 1;

    // Ustal feedback i kolor
    if (score <= 2) {
      feedback = 'Słabe hasło - dozwolone, ale zalecamy wzmocnienie';
      color = '#ef4444';
    } else if (score === 3) {
      feedback = 'Średnie hasło';
      color = '#f59e0b';
    } else if (score === 4) {
      feedback = 'Silne hasło';
      color = '#10b981';
    } else {
      feedback = 'Bardzo silne hasło';
      color = '#059669';
    }

    setPasswordStrength({ score, feedback, color });
  };

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

    const confirmPassword = confirmPasswordRef.current?.value || '';

    try {
      if (mode === 'login') {
        const result = await login(formData.email, password);
        if (result.success) {
          onClose();
          setFormData({
            email: '',
            username: '',
            firstName: '',
            lastName: ''
          });
          setPassword('');
        } else {
          setError(result.error || 'Błąd logowania');
        }
      } else {
        // Sprawdź czy hasła się zgadzają
        if (password !== confirmPassword) {
          setError('Hasła nie są identyczne');
          setIsLoading(false);
          return;
        }

        // Sprawdź minimalną długość hasła (ale pozwól na słabe hasła)
        if (password.length < 6) {
          setError('Hasło musi mieć co najmniej 6 znaków');
          setIsLoading(false);
          return;
        }

        const result = await register({
          email: formData.email,
          username: formData.username,
          password: password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined
        });
        if (result.success) {
          onClose();
          setFormData({
            email: '',
            username: '',
            firstName: '',
            lastName: ''
          });
          setPassword('');
          if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
          setPasswordStrength({ score: 0, feedback: '', color: '#ef4444' });
        } else {
          setError(result.error || 'Błąd rejestracji');
        }
      }
    } catch {
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setPasswordStrength({ score: 0, feedback: '', color: '#ef4444' });
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
  };

  const handleClose = () => {
    setError('');
    setPassword('');
    setPasswordStrength({ score: 0, feedback: '', color: '#ef4444' });
    setFormData({
      email: '',
      username: '',
      firstName: '',
      lastName: ''
    });
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="auth-modal"
          >
            <button className="auth-modal-close" onClick={handleClose}>
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
                        <small className="field-optional">opcjonalne</small>
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
                        <small className="field-optional">opcjonalne</small>
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
                    ref={passwordRef}
                    required
                    disabled={isLoading}
                    minLength={mode === 'register' ? 6 : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (mode === 'register') {
                        checkPasswordStrength(e.target.value);
                      }
                    }}
                  />
                  {mode === 'register' && password && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill" 
                          style={{ 
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                      <div 
                        className="password-strength-text"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.feedback}
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="auth-field">
                    <label htmlFor="confirmPassword">Potwierdź hasło</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      ref={confirmPasswordRef}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="auth-modal-submit"
                disabled={isLoading}
              >
                {isLoading 
                  ? (mode === 'login' ? 'Logowanie...' : 'Rejestrowanie...') 
                  : (mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się')
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
