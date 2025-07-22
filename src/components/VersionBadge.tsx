import React from 'react';
import './VersionBadge.css';

const VersionBadge: React.FC = () => {
  return (
    <div className="version-badge">
      <span className="version-text">Pre-Alpha</span>
      <span className="access-text">Early Access</span>
    </div>
  );
};

export default VersionBadge;
