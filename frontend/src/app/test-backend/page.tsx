'use client';

import { useState, useEffect } from 'react';

interface BackendStatus {
  connected: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function BackendTestPage() {
  const [status, setStatus] = useState<BackendStatus>({
    connected: false,
    message: 'Sprawdzanie połączenia...'
  });
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus({ connected: false, message: 'Testowanie połączenia...' });

    try {
      const response = await fetch('http://localhost:3001/health/ping');
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: true,
          message: '✅ Backend połączony pomyślnie!',
          data
        });
      } else {
        const errorData = await response.json();
        setStatus({
          connected: false,
          message: '❌ Backend odpowiedział z błędem',
          error: errorData
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        message: '❌ Nie można połączyć się z backend\'em',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      
      setStatus({
        connected: response.ok,
        message: response.ok ? '✅ Health check passed' : '❌ Health check failed',
        data
      });
    } catch (error) {
      setStatus({
        connected: false,
        message: '❌ Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Backend Connection Test
            </h1>
            <p className="text-gray-600">
              Test połączenia między frontend\'em a backend\'em Label Server
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          </div>

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
              🔧 Instrukcje
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>1. Upewnij się, że backend działa na porcie 3001</p>
              <p>2. Sprawdź czy PostgreSQL jest uruchomiony</p>
              <p>3. Jeśli widzisz błędy CORS, sprawdź konfigurację backend\'u</p>
              <p>4. Backend URL: <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3001</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
