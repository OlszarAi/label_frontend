'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import './UserMenu.css';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSubscriptionDisplay = () => {
    if (!user) return '';
    
    switch (user.subscriptionType) {
      case 'STARTER':
        return 'Starter';
      case 'PROFESSIONAL':
        return 'Professional';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const getSubscriptionColor = () => {
    if (!user) return '';
    
    switch (user.subscriptionType) {
      case 'STARTER':
        return 'starter';
      case 'PROFESSIONAL':
        return 'professional';
      case 'ENTERPRISE':
        return 'enterprise';
      default:
        return 'free';
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {user.firstName ? user.firstName[0] : user.username[0]}
        </div>
        <div className="user-info">
          <span className="user-name">
            {user.firstName || user.username}
          </span>
          <span className={`user-subscription subscription-${getSubscriptionColor()}`}>
            {getSubscriptionDisplay()}
          </span>
        </div>
        <svg
          className={`user-menu-arrow ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="user-menu-dropdown"
          >
            <div className="user-menu-header">
              <div className="user-avatar-large">
                {user.firstName ? user.firstName[0] : user.username[0]}
              </div>
              <div className="user-details">
                <div className="user-name-large">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.username
                  }
                </div>
                <div className="user-email">{user.email}</div>
                <div className={`user-subscription-badge subscription-${getSubscriptionColor()}`}>
                  {getSubscriptionDisplay()}
                </div>
              </div>
            </div>

            <div className="user-menu-divider" />

            <div className="user-menu-items">
              <Link href="/" className="user-menu-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2.5 6.5L8 1L13.5 6.5V13C13.5 13.2761 13.2761 13.5 13 13.5H10C9.72386 13.5 9.5 13.2761 9.5 13V10.5C9.5 10.2239 9.27614 10 9 10H7C6.72386 10 6.5 10.2239 6.5 10.5V13C6.5 13.2761 6.27614 13.5 6 13.5H3C2.72386 13.5 2.5 13.2761 2.5 13V6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                Strona główna
              </Link>

              <Link href="/profile" className="user-menu-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 10C3.58172 10 0 13.5817 0 18H16C16 13.5817 12.4183 10 8 10Z"
                    fill="currentColor"
                  />
                </svg>
                Profil
              </Link>

              <Link href="/projects" className="user-menu-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 2C1.44772 2 1 2.44772 1 3V13C1 13.5523 1.44772 14 2 14H14C14.5523 14 15 13.5523 15 13V3C15 2.44772 14.5523 2 14 2H2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M1 6H15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M5 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M11 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Projekty
              </Link>

              <Link href="/editor" className="user-menu-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"
                    fill="currentColor"
                  />
                  <path
                    d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                Edytor
              </Link>
            </div>

            <div className="user-menu-divider" />

            <button className="user-menu-item logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 2H2C1.44772 2 1 2.44772 1 3V13C1 13.5523 1.44772 14 2 14H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 11L15 8L11 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 8H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Wyloguj się
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
