'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
  CursorArrowRaysIcon,
  ChatBubbleLeftEllipsisIcon,
  RectangleStackIcon,
  CircleStackIcon,
  QrCodeIcon,
  HashtagIcon,
  PhotoIcon,
  Bars3Icon,
  RectangleGroupIcon,
  PlusIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface ToolbarPanelProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddQRCode: () => void;
  onAddUUID: () => void;
  onAddImage?: () => void;
  onAddLine?: () => void;
  selectedTool?: string;
  onToolSelect?: (tool: string) => void;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  description: string;
  shortcut: string;
  category: 'basic' | 'shapes' | 'data' | 'media';
  color: string;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddQRCode,
  onAddUUID,
  onAddImage,
  onAddLine,
  selectedTool = 'select',
  onToolSelect,
}) => {
  const [activeTab, setActiveTab] = useState('tools');

  const tools: Tool[] = [
    {
      id: 'text',
      name: 'Text',
      icon: ChatBubbleLeftEllipsisIcon,
      action: onAddText,
      description: 'Add text element',
      shortcut: 'T',
      category: 'basic',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: RectangleStackIcon,
      action: onAddRectangle,
      description: 'Add rectangle shape',
      shortcut: 'R',
      category: 'shapes',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: CircleStackIcon,
      action: onAddCircle,
      description: 'Add circle shape',
      shortcut: 'C',
      category: 'shapes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'line',
      name: 'Line',
      icon: Bars3Icon,
      action: onAddLine || (() => {}),
      description: 'Add line element',
      shortcut: 'L',
      category: 'shapes',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'qrcode',
      name: 'QR Code',
      icon: QrCodeIcon,
      action: onAddQRCode,
      description: 'Add QR code',
      shortcut: 'Q',
      category: 'data',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'uuid',
      name: 'UUID',
      icon: HashtagIcon,
      action: onAddUUID,
      description: 'Add UUID text',
      shortcut: 'U',
      category: 'data',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'image',
      name: 'Image',
      icon: PhotoIcon,
      action: onAddImage || (() => {}),
      description: 'Add image',
      shortcut: 'I',
      category: 'media',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const categories = {
    basic: { name: 'Basic', icon: PlusIcon },
    shapes: { name: 'Shapes', icon: RectangleGroupIcon },
    data: { name: 'Data', icon: HashtagIcon },
    media: { name: 'Media', icon: PhotoIcon }
  };

  const ToolButton: React.FC<{ tool: Tool }> = ({ tool }) => (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.button
          onClick={() => {
            tool.action();
            onToolSelect?.(tool.id);
          }}
          className={`w-full p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden
                     ${selectedTool === tool.id 
                       ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' 
                       : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/50 hover:text-white'
                     }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center 
                           group-hover:scale-110 transition-transform flex-shrink-0`}>
              <tool.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium text-sm">{tool.name}</div>
              <div className="text-xs opacity-60 truncate">{tool.description}</div>
            </div>
            <div className="flex-shrink-0">
              <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs opacity-60">
                {tool.shortcut}
              </kbd>
            </div>
          </div>
          
          {/* Hover gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl 
                         opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>
      </Tooltip.Trigger>
      <Tooltip.Content 
        side="right" 
        className="bg-gray-900 text-white px-2 py-1 rounded-lg text-xs border border-gray-700"
        sideOffset={8}
      >
        <div className="flex items-center gap-2">
          <span>{tool.description}</span>
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">{tool.shortcut}</kbd>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  );

  return (
    <Tooltip.Provider>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full panel-glass border-r border-gray-800/50 flex flex-col"
      >
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Header with tabs */}
          <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
            <Tabs.List className="flex rounded-lg bg-gray-800/50 p-1">
              <Tabs.Trigger 
                value="tools"
                className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                         data-[state=active]:bg-blue-600 data-[state=active]:text-white
                         data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
              >
                Tools
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="layers"
                className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                         data-[state=active]:bg-blue-600 data-[state=active]:text-white
                         data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
              >
                Layers
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs.Content value="tools" className="h-full">
              <div className="p-4 space-y-6 overflow-y-auto h-full">
                {/* Selection tool */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selection</h3>
                  <ToolButton 
                    tool={{
                      id: 'select',
                      name: 'Select',
                      icon: CursorArrowRaysIcon,
                      action: () => onToolSelect?.('select'),
                      description: 'Select and move objects',
                      shortcut: 'V',
                      category: 'basic',
                      color: 'from-gray-500 to-gray-600'
                    }}
                  />
                </div>

                {/* Tool categories */}
                {Object.entries(categories).map(([categoryKey, category]) => {
                  const categoryTools = tools.filter(tool => tool.category === categoryKey);
                  if (categoryTools.length === 0) return null;

                  return (
                    <div key={categoryKey} className="space-y-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <category.icon className="w-3 h-3" />
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {categoryTools.map(tool => (
                          <ToolButton key={tool.id} tool={tool} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tabs.Content>

            <Tabs.Content value="layers" className="h-full">
              <div className="p-4">
                <div className="text-center text-gray-400 text-sm">
                  <WrenchScrewdriverIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Layers panel coming soon
                </div>
              </div>
            </Tabs.Content>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Keyboard shortcuts enabled</span>
              </div>
              <div className="text-gray-500">
                Click tools or use hotkeys
              </div>
            </div>
          </div>
        </Tabs.Root>
      </motion.div>
    </Tooltip.Provider>
  );
};
