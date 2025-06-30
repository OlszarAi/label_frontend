'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ChatBubbleLeftEllipsisIcon, RectangleStackIcon, RectangleGroupIcon, QrCodeIcon, HashtagIcon } from '@heroicons/react/24/outline';

interface LeftPanelProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle?: () => void;
  onAddQRCode: () => void;
  onAddUUID: () => void;
}

export const LeftPanel = ({ onAddText, onAddRectangle, onAddCircle, onAddQRCode, onAddUUID }: LeftPanelProps) => {
  const tools = [
    {
      id: 'text',
      name: 'Tekst',
      icon: ChatBubbleLeftEllipsisIcon,
      action: onAddText,
      description: 'Dodaj element tekstowy',
      shortcut: 'T',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'rectangle',
      name: 'Prostokąt',
      icon: RectangleStackIcon,
      action: onAddRectangle,
      description: 'Dodaj prostokąt',
      shortcut: 'R',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'circle',
      name: 'Koło',
      icon: RectangleGroupIcon,
      action: onAddCircle,
      description: 'Dodaj koło',
      shortcut: 'C',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'qrcode',
      name: 'QR Code',
      icon: QrCodeIcon,
      action: onAddQRCode,
      description: 'Dodaj kod QR',
      shortcut: 'Q',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'uuid',
      name: 'UUID',
      icon: HashtagIcon,
      action: onAddUUID,
      description: 'Dodaj tekst UUID',
      shortcut: 'U',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full panel-glass border-r border-gray-800/50 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">Narzędzia</h2>
            <p className="text-xs text-gray-400">Dodaj elementy do etykiety</p>
          </div>
        </motion.div>
      </div>

      {/* Tools */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            onClick={tool.action}
            className="tool-btn w-full group relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 p-3">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                <tool.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-white group-hover:text-blue-300 transition-colors text-sm">
                  {tool.name}
                </div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors truncate">
                  {tool.description}
                </div>
              </div>
              <div className="flex-shrink-0">
                <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs text-gray-300">
                  {tool.shortcut}
                </kbd>
              </div>
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-xs text-gray-400 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Użyj skrótów klawiszowych</span>
          </div>
          <div className="text-gray-500">
            Kliknij narzędzie lub naciśnij klawisz
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
