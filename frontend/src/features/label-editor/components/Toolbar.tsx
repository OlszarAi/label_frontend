'use client';

import { Type, Square, Circle, Minus, Trash2, Copy, Clipboard } from 'lucide-react';
import { CanvasObject } from '../types/editor.types';

interface ToolbarProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddLine: () => void;
  onDeleteSelected: () => void;
  onCopySelected?: () => void;
  onPaste?: () => void;
  selectedObject: CanvasObject | null;
  hasClipboard?: boolean;
}

export const Toolbar = ({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddLine,
  onDeleteSelected,
  onCopySelected,
  onPaste,
  selectedObject,
  hasClipboard
}: ToolbarProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Narzędzia</h3>
      
      <div className="space-y-2">
        <button
          onClick={onAddText}
          className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Type size={16} />
          <span className="text-sm">Dodaj tekst</span>
        </button>

        <button
          onClick={onAddRectangle}
          className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Square size={16} />
          <span className="text-sm">Dodaj prostokąt</span>
        </button>

        <button
          onClick={onAddCircle}
          className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Circle size={16} />
          <span className="text-sm">Dodaj koło</span>
        </button>

        <button
          onClick={onAddLine}
          className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Minus size={16} />
          <span className="text-sm">Dodaj linię</span>
        </button>

        {(selectedObject || hasClipboard) && (
          <div className="pt-2 border-t space-y-2">
            {selectedObject && onCopySelected && (
              <button
                onClick={onCopySelected}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Copy size={16} />
                <span className="text-sm">Kopiuj (Ctrl+C)</span>
              </button>
            )}
            {hasClipboard && onPaste && (
              <button
                onClick={onPaste}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Clipboard size={16} />
                <span className="text-sm">Wklej (Ctrl+V)</span>
              </button>
            )}
            {selectedObject && (
              <button
                onClick={onDeleteSelected}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={16} />
                <span className="text-sm">Usuń zaznaczony</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
