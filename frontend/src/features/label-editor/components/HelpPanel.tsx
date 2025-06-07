'use client';

import React from 'react';
import { X } from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Skróty klawiszowe</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Ogólne</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Usuń zaznaczony obiekt</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Delete</kbd>
              </div>
              <div className="flex justify-between">
                <span>Kopiuj zaznaczony</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+C</kbd>
              </div>
              <div className="flex justify-between">
                <span>Wklej</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+V</kbd>
              </div>
              <div className="flex justify-between">
                <span>Duplikuj (kopiuj+wklej)</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+D</kbd>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Widok</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Przybliż/oddal</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+Scroll</kbd>
              </div>
              <div className="flex justify-between">
                <span>Przesuń widok</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Środkowy myszy</kbd>
              </div>
              <div className="flex justify-between">
                <span>Przesuń widok</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Alt+Lewy myszy</kbd>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Edycja tekstu</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Edytuj treść i rozmiar</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Panel właściwości</kbd>
              </div>
              <div className="flex justify-between">
                <span>Skaluj wizualnie</span>
                <kbd className="bg-gray-100 px-2 py-1 rounded">Przeciągnij rogi</kbd>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Warstwy</h3>
            <div className="space-y-1 text-sm">
              <div>Użyj przycisków w panelu właściwości:</div>
              <div className="ml-2 space-y-1">
                <div>• Na wierzch - przenieś na górną warstwę</div>
                <div>• Na spód - przenieś na dolną warstwę</div>
                <div>• W górę - przenieś o jedną warstwę w górę</div>
                <div>• W dół - przenieś o jedną warstwę w dół</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          Tip: Wszystkie obiekty można edytować w panelu właściwości po prawej stronie. 
          Tekst można edytować w sekcji "Tekst" w panelu właściwości.
        </div>
      </div>
    </div>
  );
};
