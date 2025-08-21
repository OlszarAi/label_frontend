'use client';

import React, { useState } from 'react';
// import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BulkLabelDesign, BulkCreationOptions } from '../types/bulk-label.types';

interface QuantitySelectionModalProps {
  design: BulkLabelDesign;
  onConfirm: (options: BulkCreationOptions) => void;
  onBack: () => void;
  isCreating: boolean;
}

const QUICK_QUANTITIES = [1, 5, 10, 25, 50, 100, 250, 500];

export const QuantitySelectionModal: React.FC<QuantitySelectionModalProps> = ({
  design,
  onConfirm,
  onBack,
  isCreating
}) => {
  const [quantity, setQuantity] = useState(10);
  const [baseName, setBaseName] = useState(design.name);
  const [qrPrefix, setQrPrefix] = useState('https://label.app/');
  const [uuidLength, setUuidLength] = useState(8);

  // Check if design has QR objects or UUID objects
  const hasQRObjects = design.fabricData.objects.some((obj: unknown) => {
    return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'qrcode';
  });
  const hasUUIDObjects = design.fabricData.objects.some((obj: unknown) => {
    return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'uuid';
  });

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 10000) {
      setQuantity(num);
    }
  };

  const handleUUIDLengthChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 32) {
      setUuidLength(num);
    }
  };

  const handleConfirm = () => {
    const options: BulkCreationOptions = {
      quantity,
      baseName,
      qrPrefix: hasQRObjects ? qrPrefix : undefined,
      uuidLength: (hasQRObjects || hasUUIDObjects) ? uuidLength : undefined
    };
    onConfirm(options);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Design Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Preview */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                Podgląd wzoru
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 lg:p-6 flex items-center justify-center min-h-[200px]">
                {design.thumbnail ? (
                  <img
                    src={design.thumbnail}
                    alt="Podgląd etykiety"
                    className="max-w-full max-h-40 lg:max-h-48 rounded shadow-md"
                  />
                ) : (
                  <div className="w-40 lg:w-48 h-24 lg:h-32 bg-white dark:bg-gray-700 rounded shadow-md flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Podgląd etykiety</span>
                  </div>
                )}
              </div>
              <div className="mt-3 lg:mt-4 space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Nazwa:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{design.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rozmiar:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {design.width} × {design.height} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Obiekty:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {design.fabricData.objects.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Naming preview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 lg:p-4">
              <h4 className="text-xs lg:text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Przykłady nazw etykiet:
              </h4>
              <div className="space-y-1 text-xs lg:text-sm text-blue-800 dark:text-blue-400">
                <div>• {baseName} 1</div>
                <div>• {baseName} 2</div>
                <div>• {baseName} 3</div>
                <div className="text-blue-600 dark:text-blue-300">• ...</div>
              </div>
            </div>
          </div>

          {/* Right: Options */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                Opcje tworzenia
              </h3>

              {/* Quantity Selection */}
              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ilość etykiet
                  </label>
                  
                  {/* Quick buttons */}
                  <div className="grid grid-cols-4 gap-1.5 lg:gap-2 mb-3">
                    {QUICK_QUANTITIES.map(num => (
                      <button
                        key={num}
                        onClick={() => setQuantity(num)}
                        className={`px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm rounded-md transition-colors ${
                          quantity === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Wpisz ilość..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maksymalnie 10,000 etykiet na raz
                  </p>
                </div>

                {/* Base Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nazwa bazowa
                  </label>
                  <input
                    type="text"
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Nazwa bazowa etykiet..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Każda etykieta będzie miała kolejny numer, np. &quot;{baseName} 1&quot;
                  </p>
                </div>

                {/* QR Code Prefix */}
                {hasQRObjects && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prefiks dla kodów QR
                    </label>
                    <input
                      type="text"
                      value={qrPrefix}
                      onChange={(e) => setQrPrefix(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://label.app/"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Każda etykieta będzie miała unikalny UUID, kody QR będą miały format: prefiks + UUID
                    </p>
                  </div>
                )}

                {/* UUID Length */}
                {(hasQRObjects || hasUUIDObjects) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Długość UUID
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={uuidLength}
                        onChange={(e) => handleUUIDLengthChange(e.target.value)}
                        min="1"
                        max="32"
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">znaków</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Każda etykieta otrzyma unikalny UUID o długości {uuidLength} znaków (1-32)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 lg:p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Podsumowanie
              </h4>
              <div className="space-y-1 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Etykiety do utworzenia:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rozmiar każdej:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {design.width} × {design.height} mm
                  </span>
                </div>
                {(hasQRObjects || hasUUIDObjects) && (
                  <>
                    <div className="flex justify-between">
                      <span>Unikalny UUID:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {uuidLength} znaków
                      </span>
                    </div>
                    {hasQRObjects && qrPrefix && (
                      <div className="flex justify-between">
                        <span>Prefiks QR:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400 truncate ml-2" title={qrPrefix}>
                          {qrPrefix.length > 15 ? qrPrefix.substring(0, 15) + '...' : qrPrefix}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span>System:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Nowa generacja</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
          <button
            onClick={onBack}
            disabled={isCreating}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 order-2 sm:order-1"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Wróć do edytora
          </button>

          <button
            onClick={handleConfirm}
            disabled={isCreating || quantity < 1 || !baseName.trim()}
            className={`w-full sm:w-auto px-6 lg:px-8 py-2 lg:py-3 rounded-lg font-medium transition-colors order-1 sm:order-2 ${
              isCreating || quantity < 1 || !baseName.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Tworzenie...
              </div>
            ) : (
              `Utwórz ${quantity} etykiet`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
