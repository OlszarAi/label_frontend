'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { EditorTool } from '../types/editor.types';
import { TOOLBAR_BUTTONS } from '../constants/editor.constants';

interface EditorToolbarProps {
  selectedTool: EditorTool;
  onToolSelect: (tool: EditorTool) => void;
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onDelete: () => void;
  onClear: () => void;
  hasActiveObject: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onAddText,
  onAddRectangle,
  onAddCircle,
  onDelete,
  onClear,
  hasActiveObject,
}) => {
  const handleToolClick = (tool: EditorTool) => {
    onToolSelect(tool);
    
    // Automatycznie dodaj element po wybraniu narzędzia
    switch (tool) {
      case EditorTool.TEXT:
        onAddText();
        break;
      case EditorTool.RECTANGLE:
        onAddRectangle();
        break;
      case EditorTool.CIRCLE:
        onAddCircle();
        break;
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1 z-10">
      {/* Narzędzia */}
      {TOOLBAR_BUTTONS.map((button) => (
        <button
          key={button.id}
          onClick={() => handleToolClick(button.id)}
          className={`
            p-2 rounded-md transition-colors duration-200 flex items-center justify-center
            ${selectedTool === button.id 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          title={button.label}
        >
          {getIcon(button.icon)}
        </button>
      ))}
      
      {/* Separator */}
      <div className="h-px bg-gray-200 my-1" />
      
      {/* Akcje */}
      <button
        onClick={onDelete}
        disabled={!hasActiveObject}
        className={`
          p-2 rounded-md transition-colors duration-200 flex items-center justify-center
          ${hasActiveObject 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-gray-400 cursor-not-allowed'
          }
        `}
        title="Usuń zaznaczony element"
      >
        <Icons.Trash2 size={18} />
      </button>
      
      <button
        onClick={onClear}
        className="p-2 rounded-md transition-colors duration-200 flex items-center justify-center text-gray-700 hover:bg-gray-100"
        title="Wyczyść canvas"
      >
        <Icons.RotateCcw size={18} />
      </button>
    </div>
  );
};
