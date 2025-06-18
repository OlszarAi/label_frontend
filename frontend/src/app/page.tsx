'use client';

import { useAuthContext } from '../providers/AuthProvider';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with auth status */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏷️ Label Frontend
              </h1>
              <p className="text-gray-600 mt-2">
                Zaawansowany edytor etykiet z automatyczną autoryzacją
              </p>
            </div>
            
            {isAuthenticated && user ? (
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium">
                      Witaj, {user.username}! 👋
                    </p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Wyloguj
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Zaloguj się
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Label Editor Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Edytor Etykiet
              </h2>
              <p className="text-gray-600 mb-4">
                Zaawansowany edytor do tworzenia i edycji etykiet
              </p>
              <Link
                href="/editor"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
              >
                Otwórz Edytor
              </Link>
            </div>
          </div>

          {/* Backend Test Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🧪</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Test Backend
              </h2>
              <p className="text-gray-600 mb-4">
                Testowanie połączenia i autoryzacji z backendem
              </p>
              <Link
                href="/test-backend"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
              >
                Test Backend
              </Link>
            </div>
          </div>

          {/* Auth Demo Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Demo Autoryzacji
              </h2>
              <p className="text-gray-600 mb-4">
                Sprawdź automatyczną autoryzację w akcji
              </p>
              <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
              >
                Demo Login
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Status Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Status Autoryzacji
          </h2>
          
          {isAuthenticated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p className="text-green-900 font-medium">
                    Automatycznie Zalogowano
                  </p>
                  <p className="text-green-800 text-sm mt-1">
                    Token został znaleziony w localStorage i został pomyślnie zweryfikowany z backendem.
                  </p>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Użytkownik:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Rola:</strong> {user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
                <div>
                  <p className="text-yellow-900 font-medium">
                    Nie Zalogowano
                  </p>
                  <p className="text-yellow-800 text-sm mt-1">
                    Nie znaleziono ważnego tokenu autoryzacji. Zaloguj się aby uzyskać dostęp do wszystkich funkcji.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Funkcje Automatycznej Autoryzacji
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="text-blue-600 text-lg mr-3">🔄</div>
                <div>
                  <p className="font-medium text-gray-900">Auto-login</p>
                  <p className="text-sm text-gray-600">
                    Automatyczne logowanie przy odświeżeniu strony
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-600 text-lg mr-3">💾</div>
                <div>
                  <p className="font-medium text-gray-900">Persistent Storage</p>
                  <p className="text-sm text-gray-600">
                    Token zapisywany w localStorage
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="text-blue-600 text-lg mr-3">🛡️</div>
                <div>
                  <p className="font-medium text-gray-900">Token Validation</p>
                  <p className="text-sm text-gray-600">
                    Weryfikacja tokenu z backendem przy starcie
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-600 text-lg mr-3">🌐</div>
                <div>
                  <p className="font-medium text-gray-900">Global State</p>
                  <p className="text-sm text-gray-600">
                    Globalny stan autoryzacji w całej aplikacji
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
