'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EditorPreferences } from '../types/editor.types';
import { validateUUIDLength } from '../utils/uuid';
import { BoltIcon, BoltSlashIcon } from '@heroicons/react/24/outline';

interface PreferencesProps {
  preferences: EditorPreferences;
  onPreferencesUpdate: (preferences: EditorPreferences) => void;
  autoSave?: boolean;
  onAutoSaveToggle?: () => void;
}

export const Preferences = ({ 
  preferences, 
  onPreferencesUpdate, 
  autoSave = true, 
  onAutoSaveToggle 
}: PreferencesProps) => {
  const [localValues, setLocalValues] = useState({
    uuidLength: preferences.uuid.uuidLength.toString(),
    qrPrefix: preferences.uuid.qrPrefix,
  });

  const updateValue = (key: keyof typeof localValues, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
    
    const newPreferences = { ...preferences };
    
    switch (key) {
      case 'uuidLength':
        const length = parseInt(value);
        if (!isNaN(length)) {
          newPreferences.uuid.uuidLength = validateUUIDLength(length);
        }
        break;
      case 'qrPrefix':
        newPreferences.uuid.qrPrefix = value; // Allow any string for URLs
        break;
    }
    
    onPreferencesUpdate(newPreferences);
  };

  // Update local values when preferences change externally
  React.useEffect(() => {
    setLocalValues({
      uuidLength: preferences.uuid.uuidLength.toString(),
      qrPrefix: preferences.uuid.qrPrefix,
    });
  }, [preferences]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Autosave Settings Section */}
      {onAutoSaveToggle && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-gray-300">Editor Settings</h4>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-3">
              {autoSave ? (
                <BoltIcon className="w-5 h-5 text-green-400" />
              ) : (
                <BoltSlashIcon className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="text-sm font-medium text-white">Auto-save</div>
                <div className="text-xs text-gray-400">
                  {autoSave 
                    ? 'Changes are saved automatically every 2 seconds' 
                    : 'Save changes manually using Ctrl+S or Save button'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={onAutoSaveToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${autoSave ? 'bg-green-600' : 'bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${autoSave ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="font-medium text-gray-400 mb-1">Performance Note:</div>
            Auto-save reduces the risk of losing work but may cause more frequent backend requests. 
            Disable if you experience performance issues or prefer manual control.
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-xs font-medium text-gray-300">UUID Settings</h4>
        
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            UUID Length
          </label>
          <input
            type="number"
            value={localValues.uuidLength}
            onChange={(e) => updateValue('uuidLength', e.target.value)}
            min="1"
            max="32"
            className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                     text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 input-dark"
          />
          <div className="text-xs text-gray-500 mt-1">
            Number of characters in UUID (1-32)
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-2">
            QR Code Prefix
          </label>
          <input
            type="text"
            value={localValues.qrPrefix}
            onChange={(e) => updateValue('qrPrefix', e.target.value)}
            placeholder="e.g., https://example.com/"
            className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 
                     text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 input-dark"
          />
          <div className="text-xs text-gray-500 mt-1">
            Prefix added to UUID in QR codes (e.g., URL)
          </div>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-2">
            <div className="text-gray-300 font-medium">Preview:</div>
            <div>
              <div className="flex justify-between items-center">
                <span>UUID Display:</span>
                <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                  {'x'.repeat(preferences.uuid.uuidLength)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-start">
                <span>QR Code Content:</span>
                <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded max-w-32 break-all">
                  {preferences.uuid.qrPrefix}{'x'.repeat(preferences.uuid.uuidLength)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
