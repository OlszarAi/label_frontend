'use client';

import { useAuthContext } from '../../providers/AuthProvider';
import { useState } from 'react';

export default function LoginPage() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sprawdzanie autoryzacji...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Witaj, {user.username}!
              </h1>
              <p className="text-gray-600">
                Automatycznie zalogowano na podstawie zapisanego tokenu
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                ✅ Dane użytkownika:
              </h2>
              <div className="space-y-2 text-green-800">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Rola:</strong> {user.role}</p>
                {user.firstName && <p><strong>Imię:</strong> {user.firstName}</p>}
                {user.lastName && <p><strong>Nazwisko:</strong> {user.lastName}</p>}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                🚪 Wyloguj się
              </button>
              
              <button
                onClick={() => window.location.href = '/test-backend'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                🧪 Test Backend
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Logowanie
            </h1>
            <p className="text-gray-600">
              Zaloguj się do aplikacji Label
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="twoj@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Twoje hasło"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nie masz konta?{' '}
              <button
                onClick={() => window.location.href = '/test-backend'}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Przejdź do testu rejestracji
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">
              💡 Automatyczna autoryzacja
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Token jest automatycznie sprawdzany przy załadowaniu strony</li>
              <li>• Jeśli token jest ważny, zostaniesz automatycznie zalogowany</li>
              <li>• Token jest przechowywany w localStorage</li>
              <li>• Sesja jest sprawdzana z backendem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
