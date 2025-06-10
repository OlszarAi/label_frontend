'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ChatBubbleLeftEllipsisIcon, RectangleStackIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';

interface LeftPanelProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle?: () => void;
}

export const LeftPanel = ({ onAddText, onAddRectangle, onAddCircle }: LeftPanelProps) => {
  const tools = [
    {
      id: 'text',
      name: 'Text',
      icon: ChatBubbleLeftEllipsisIcon,
      action: onAddText,
      description: 'Add text element'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: RectangleStackIcon,
      action: onAddRectangle,
      description: 'Add rectangle shape'
    },
    ...(onAddCircle ? [{
      id: 'circle',
      name: 'Circle',
      icon: RectangleGroupIcon,
      action: onAddCircle,
      description: 'Add circle shape'
    }] : [])
  ];

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Objects
        </h2>
      </div>

      {/* Tools */}
      <div className="flex-1 p-4 space-y-2">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={tool.action}
            className="w-full p-4 rounded-lg btn-secondary text-white text-sm font-medium 
                     flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tool.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <div className="text-left">
              <div className="font-medium">{tool.name}</div>
              <div className="text-xs text-gray-400">{tool.description}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          Click on tools to add objects to your label
        </div>
      </div>
    </div>
  );
};
