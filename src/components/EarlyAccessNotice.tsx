'use client';

import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import './EarlyAccessNotice.css';

interface EarlyAccessNoticeProps {
  placement?: 'top' | 'inline';
  showDismiss?: boolean;
}

export function EarlyAccessNotice({ placement = 'inline', showDismiss = true }: EarlyAccessNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className={`early-access-notice ${placement}`}>
      <div className="notice-content">
        <InformationCircleIcon className="notice-icon" />
        <span className="notice-text">
          <strong>Pre-Alpha:</strong> Aplikacja w fazie rozwoju - możliwe ograniczenia funkcji
        </span>
        {showDismiss && (
          <button 
            className="notice-dismiss"
            onClick={() => setIsDismissed(true)}
            aria-label="Ukryj powiadomienie"
          >
            <XMarkIcon className="dismiss-icon" />
          </button>
        )}
      </div>
    </div>
  );
}
