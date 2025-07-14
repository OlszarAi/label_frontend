'use client';

import React from 'react';
import { ArrowLeft, Save, Eye, Share2, Settings } from 'lucide-react';

interface EditorHeaderProps {
  currentLabel: {
    id: string;
    name: string;
    description?: string;
    projectId: string;
  } | null;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  onSettings: () => void;
  isSaving: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  currentLabel,
  onBack,
  onSave,
  onPreview,
  onShare,
  onSettings,
  isSaving,
}) => {
  return (
    <header className="editor-header">
      <div className="editor-header-left">
        <button 
          onClick={onBack}
          className="header-btn header-btn-back"
          title="Back to project"
        >
          <ArrowLeft size={16} />
        </button>
        
        <div className="header-label-info">
          <h1 className="header-label-name">
            {currentLabel?.name || 'Untitled Label'}
          </h1>
          {currentLabel?.description && (
            <div className="header-label-description">
              {currentLabel.description}
            </div>
          )}
        </div>
      </div>

      <div className="editor-header-right">
        <button 
          onClick={onSave}
          className="header-btn header-btn-save"
          disabled={isSaving}
          title="Save label (Ctrl+S)"
        >
          <Save size={16} />
          {isSaving ? <span>Saving...</span> : <span>Save</span>}
        </button>
        
        <button 
          onClick={onPreview}
          className="header-btn header-btn-preview"
          title="Preview mode"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
        
        <button 
          onClick={onShare}
          className="header-btn header-btn-share"
          title="Share label"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
        
        <button 
          onClick={onSettings}
          className="header-btn header-btn-settings"
          title="Toggle labels panel"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
