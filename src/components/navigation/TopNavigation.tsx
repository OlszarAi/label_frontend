'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { ChevronLeft, Home, Folder } from 'lucide-react';

interface TopNavigationProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function TopNavigation({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backHref = '/',
  breadcrumbs 
}: TopNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="top-navigation"
    >
      <div className="top-nav-container">
        <div className="top-nav-left">
          {/* Breadcrumbs / Back Navigation */}
          <div className="nav-breadcrumbs">
            {showBackButton && (
              <button 
                onClick={handleBack}
                className="nav-back-button"
              >
                <ChevronLeft size={16} />
                Wstecz
              </button>
            )}
            
            {breadcrumbs && (
              <div className="breadcrumb-trail">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="breadcrumb-item">
                    {crumb.href ? (
                      <Link href={crumb.href} className="breadcrumb-link">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="breadcrumb-current">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="breadcrumb-separator">/</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick nav icons */}
            <div className="quick-nav-icons">
              <Link href="/" className="quick-nav-icon" title="Strona główna">
                <Home size={16} />
              </Link>
              <Link href="/projects" className="quick-nav-icon" title="Projekty">
                <Folder size={16} />
              </Link>
            </div>
          </div>

          {/* Title Section */}
          {title && (
            <div className="nav-title-section">
              <h1 className="nav-title">{title}</h1>
              {subtitle && <p className="nav-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>

        <div className="top-nav-right">
          <UserMenu />
        </div>
      </div>
    </motion.div>
  );
}
