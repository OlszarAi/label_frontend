'use client';

import React, { useState } from 'react';
import './VersionBadge.css';

const VersionBadge: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="version-badge"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="version-text">Pre-Alpha</span>
      <span className="access-text">Early Access</span>
      
      {showTooltip && (
        <div className="version-tooltip">
          <div className="tooltip-header">⚠️ Wczesny dostęp</div>
          <div className="tooltip-content">
            • Ograniczona funkcjonalność<br/>
            • Możliwe błędy i niestabilność<br/>
            • Aktywny rozwój aplikacji<br/>
            • Regularne aktualizacje
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionBadge;
