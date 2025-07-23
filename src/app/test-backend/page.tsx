'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BackendStatus {
  connected: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

interface UserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface TestResult {
  test: string;
  success: boolean;
  data?: string | Record<string, unknown>;
  error?: string;
  duration?: number;
}

export default function BackendTestPage() {
  const [status, setStatus] = useState<BackendStatus>({
    connected: false,
    message: 'Sprawdzanie połączenia...'
  });
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Form data for user creation
  const [newUser, setNewUser] = useState<UserData>({
    email: `test${Math.floor(Math.random() * 1000)}@example.com`,
    username: `testuser${Math.floor(Math.random() * 1000)}`,
    password: 'TestPass123!',
    firstName: 'Jan',
    lastName: 'Testowy'
  });

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const generateRandomUser = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    setNewUser({
      email: `test${randomNum}@example.com`,
      username: `testuser${randomNum}`,
      password: 'TestPass123!',
      firstName: 'Jan',
      lastName: 'Testowy'
    });
  };

  const testConnection = useCallback(async () => {
    setLoading(true);
    setStatus({ connected: false, message: 'Testowanie połączenia...' });
    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE_URL}/health/ping`);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: true,
          message: '✅ Backend połączony pomyślnie!',
          data
        });
        addTestResult({
          test: 'Connection Test',
          success: true,
          data,
          duration
        });
      } else {
        const errorData = await response.json();
        setStatus({
          connected: false,
          message: '❌ Backend odpowiedział z błędem',
          error: errorData
        });
        addTestResult({
          test: 'Connection Test',
          success: false,
          error: errorData,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Nie można połączyć się z backend\'em',
        error: errorMsg
      });
      addTestResult({
        test: 'Connection Test',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testHealth = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      setStatus({
        connected: response.ok,
        message: response.ok ? '✅ Health check passed' : '❌ Health check failed',
        data
      });
      
      addTestResult({
        test: 'Health Check',
        success: response.ok,
        data,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Health check failed',
        error: errorMsg
      });
      addTestResult({
        test: 'Health Check',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setStatus({
          connected: true,
          message: '✅ Użytkownik zarejestrowany pomyślnie!',
          data
        });
        addTestResult({
          test: 'User Registration',
          success: true,
          data,
          duration
        });
      } else {
        setStatus({
          connected: false,
          message: '❌ Błąd rejestracji użytkownika',
          error: data
        });
        addTestResult({
          test: 'User Registration',
          success: false,
          error: data,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Błąd połączenia podczas rejestracji',
        error: errorMsg
      });
      addTestResult({
        test: 'User Registration',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    // Check if user is already logged in with valid session
    if (authToken) {
      addTestResult({
        test: 'User Login',
        success: false,
        error: 'Użytkownik jest już zalogowany. Sprawdź sesję lub wyloguj się.',
        duration: 0
      });
      setStatus({
        connected: false,
        message: '⚠️ Już jesteś zalogowany!',
        error: 'Sprawdź status sesji lub wyloguj się przed ponownym logowaniem.'
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: newUser.email,
          password: newUser.password
        })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok && data.data?.token) {
        setAuthToken(data.data.token);
        setCurrentUser(data.data.user);
        setStatus({
          connected: true,
          message: data.data.expiresAt ? 
            `✅ Logowanie pomyślne! Token ważny do: ${new Date(data.data.expiresAt).toLocaleString()}` :
            '✅ Logowanie pomyślne!',
          data
        });
        addTestResult({
          test: 'User Login',
          success: true,
          data: {
            ...data,
            tokenInfo: data.data.expiresAt ? `Token expires: ${new Date(data.data.expiresAt).toLocaleString()}` : 'Token created'
          },
          duration
        });
      } else {
        setStatus({
          connected: false,
          message: '❌ Błąd logowania',
          error: data
        });
        addTestResult({
          test: 'User Login',
          success: false,
          error: data,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Błąd połączenia podczas logowania',
        error: errorMsg
      });
      addTestResult({
        test: 'User Login',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    if (!authToken) {
      setStatus({
        connected: false,
        message: '❌ Brak tokenu autoryzacji',
        error: 'Please login first'
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setStatus({
          connected: true,
          message: `✅ Sesja aktywna! Ważna do: ${new Date(data.data.tokenValidUntil).toLocaleString()}`,
          data
        });
        addTestResult({
          test: 'Session Status Check',
          success: true,
          data: {
            ...data,
            sessionInfo: `Valid until: ${new Date(data.data.tokenValidUntil).toLocaleString()}`
          },
          duration
        });
      } else {
        // Token might be expired, clear it
        if (response.status === 401) {
          setAuthToken(null);
          setCurrentUser(null);
        }
        setStatus({
          connected: false,
          message: '❌ Sesja nieaktywna lub wygasła',
          error: data
        });
        addTestResult({
          test: 'Session Status Check',
          success: false,
          error: data,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Błąd podczas sprawdzania sesji',
        error: errorMsg
      });
      addTestResult({
        test: 'Session Status Check',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    if (!authToken) {
      setStatus({
        connected: false,
        message: '❌ Brak tokenu autoryzacji',
        error: 'Please login first'
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setStatus({
          connected: true,
          message: '✅ Profil pobrany pomyślnie!',
          data
        });
        addTestResult({
          test: 'Get Profile',
          success: true,
          data,
          duration
        });
      } else {
        setStatus({
          connected: false,
          message: '❌ Błąd pobierania profilu',
          error: data
        });
        addTestResult({
          test: 'Get Profile',
          success: false,
          error: data,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Błąd połączenia podczas pobierania profilu',
        error: errorMsg
      });
      addTestResult({
        test: 'Get Profile',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    if (!authToken) {
      setStatus({
        connected: false,
        message: '❌ Brak tokenu autoryzacji',
        error: 'Already logged out'
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setAuthToken(null);
        setCurrentUser(null);
        setStatus({
          connected: true,
          message: '✅ Wylogowanie pomyślne!',
          data
        });
        addTestResult({
          test: 'User Logout',
          success: true,
          data,
          duration
        });
      } else {
        setStatus({
          connected: false,
          message: '❌ Błąd wylogowania',
          error: data
        });
        addTestResult({
          test: 'User Logout',
          success: false,
          error: data,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        message: '❌ Błąd połączenia podczas wylogowania',
        error: errorMsg
      });
      addTestResult({
        test: 'User Logout',
        success: false,
        error: errorMsg,
        duration
      });
    } finally {
      setLoading(false);
    }
  };

  const runFullAuthTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Generate new user for clean test
    generateRandomUser();
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Step 1: Register
      await registerUser();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Login
      await loginUser();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Check Session
      await checkSessionStatus();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Get Profile
      await getUserProfile();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 5: Logout
      await logoutUser();
      
      setStatus({
        connected: true,
        message: '✅ Pełny test autoryzacji zakończony!',
        data: { message: 'All authentication tests completed successfully' }
      });
    } catch (error) {
      setStatus({
        connected: false,
        message: '❌ Błąd podczas pełnego testu autoryzacji',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initTest = async () => {
      await testConnection();
    };
    initTest();
  }, [testConnection]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Backend Connection & Auth Test
            </h1>
            <p className="text-gray-600">
              Kompletny test połączenia i autoryzacji Label Backend Server
            </p>
            {currentUser && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Zalogowany jako: <strong>{currentUser.username}</strong> ({currentUser.email})
                </p>
              </div>
            )}
          </div>

          {/* Status Card */}
          <div className={`p-6 rounded-lg mb-6 ${
            status.connected 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Status połączenia
                </h2>
                <p className={`mt-1 ${
                  status.connected ? 'text-green-700' : 'text-red-700'
                }`}>
                  {status.message}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${
                status.connected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Testowanie...' : 'Test Ping'}
            </button>
            
            <button
              onClick={testHealth}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Testowanie...' : 'Health Check'}
            </button>

            <button
              onClick={checkSessionStatus}
              disabled={loading || !authToken}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Testowanie...' : 'Status Sesji'}
            </button>

            <button
              onClick={runFullAuthTest}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Testowanie...' : 'Pełny Test Auth'}
            </button>
          </div>

          {/* User Management Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👤 Zarządzanie Użytkownikiem
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasło
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <button
                  onClick={generateRandomUser}
                  disabled={loading}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  🎲 Wygeneruj losowe dane
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={registerUser}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  ✅ Zarejestruj użytkownika
                </button>
                
                <button
                  onClick={loginUser}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  🔐 Zaloguj użytkownika
                </button>
                
                <button
                  onClick={getUserProfile}
                  disabled={loading || !authToken}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  👤 Pobierz profil
                </button>
                
                <button
                  onClick={logoutUser}
                  disabled={loading || !authToken}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  🚪 Wyloguj użytkownika
                </button>
                
                {authToken && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Token aktywny:</strong><br />
                      {authToken.substring(0, 30)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Historia testów (ostatnie 10)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.success ? '✅' : '❌'} {result.test}
                      </span>
                      {result.duration && (
                        <span className="text-sm text-gray-600">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    {(result.error || result.data) && (
                      <pre className={`text-xs mt-2 p-2 rounded ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      } overflow-x-auto max-h-32`}>
                        {JSON.stringify(result.error || result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 API Endpoints
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-mono text-blue-600">GET /health/ping</span>
                <span className="text-gray-600">Basic connection test</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-blue-600">GET /health</span>
                <span className="text-gray-600">Full health status</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-green-600">POST /api/auth/register</span>
                <span className="text-gray-600">User registration</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-green-600">POST /api/auth/login</span>
                <span className="text-gray-600">User login</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-purple-600">GET /api/auth/session</span>
                <span className="text-gray-600">Check session status (auth required)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-purple-600">GET /api/auth/profile</span>
                <span className="text-gray-600">Get user profile (auth required)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-red-600">POST /api/auth/logout</span>
                <span className="text-gray-600">User logout (auth required)</span>
              </div>
            </div>
          </div>

          {/* Response Data */}
          {(status.data || status.error) && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Response:</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
                {JSON.stringify(status.data || status.error, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🔧 Instrukcje testowania
            </h3>
            <div className="text-blue-800 space-y-2">
              <p><strong>1. Test podstawowy:</strong> Kliknij &quot;Test Ping&quot; i &quot;Health Check&quot;</p>
              <p><strong>2. Test użytkownika:</strong> Wypełnij formularz i przetestuj rejestrację/logowanie</p>
              <p><strong>3. Zarządzanie sesjami:</strong> Sprawdź status sesji przed kolejnymi logowaniami</p>
              <p><strong>4. Pełny test:</strong> Kliknij &quot;Pełny Test Auth&quot; dla automatycznego testu całego flow</p>
              <p><strong>5. Backend URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{API_BASE_URL}</code></p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Szybki start:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>1. <code>cd label_backend_server</code></p>
                <p>2. <code>docker-compose up -d postgres</code></p>
                <p>3. <code>npm run dev</code></p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Poprawa zarządzania sesjami:</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• Logowanie gdy już jesteś zalogowany pokazuje ostrzeżenie</p>
                <p>• Backend sprawdza czy token już istnieje i go wykorzystuje</p>
                <p>• Używaj &quot;Status Sesji&quot; aby sprawdzić ważność tokenu</p>
                <p>• Stare tokeny są automatycznie usuwane przy nowym logowaniu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
