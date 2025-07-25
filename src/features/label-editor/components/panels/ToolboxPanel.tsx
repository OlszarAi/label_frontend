'use client';

import React from 'react';
import { 
  Bars3BottomLeftIcon,
  RectangleStackIcon,
  CircleStackIcon,
  QrCodeIcon,
  HashtagIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';

interface ToolboxPanelProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddQRCode: () => void;
  onAddUUID: () => void;
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  isVisible: boolean;
  onClose?: () => void; // Make optional since it's not always used
}

export const ToolboxPanel = ({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddQRCode,
  onAddUUID,
  selectedTool,
  onToolSelect,
  isVisible
}: ToolboxPanelProps) => {
  const tools = [
    {
      id: 'select',
      name: 'Select',
      icon: CursorArrowRaysIcon,
      shortcut: 'V',
      description: 'Select and move objects',
      action: () => onToolSelect('select'),
    },
    {
      id: 'text',
      name: 'Text',
      icon: Bars3BottomLeftIcon,
      shortcut: 'T',
      description: 'Add text element',
      action: onAddText,
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: RectangleStackIcon,
      shortcut: 'R',
      description: 'Add rectangle shape',
      action: onAddRectangle,
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: CircleStackIcon,
      shortcut: 'C',
      description: 'Add circle shape',
      action: onAddCircle,
    },
    {
      id: 'qrcode',
      name: 'QR Code',
      icon: QrCodeIcon,
      shortcut: 'Q',
      description: 'Add QR code',
      action: onAddQRCode,
    },
    {
      id: 'uuid',
      name: 'UUID',
      icon: HashtagIcon,
      shortcut: 'U',
      description: 'Add unique identifier',
      action: onAddUUID,
    },
  ];

  const handleToolClick = (tool: { id: string; action: () => void }) => {
    onToolSelect(tool.id);
    tool.action();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Quick Toolbar */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl px-4 py-3">
        <div className="flex items-center space-x-2">
          {/* Tools */}
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`
                  relative group flex flex-col items-center justify-center
                  w-14 h-14 rounded-xl transition-all duration-300 ease-out
                  hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50' 
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/70 hover:shadow-md'
                  }
                `}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <Icon className="w-6 h-6 transition-all duration-200" />
                
                {/* Shortcut badge */}
                <div className={`
                  absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold
                  flex items-center justify-center transition-all duration-200
                  ${isSelected 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {tool.shortcut}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <div className="font-medium">{tool.description}</div>
                    <div className="text-gray-300 text-[10px] mt-1">Press {tool.shortcut}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl border-2 border-white/70 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 