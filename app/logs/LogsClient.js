'use client';

import { useState, useEffect } from 'react';

export default function LogsClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchLogs();

    // Auto-refresh co 2 sekundy jeśli włączony
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLogs();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.logs || []);

      // Sprawdź czy trwa skanowanie
      const recentLogs = data.logs?.slice(0, 5) || [];
      const isScanning = recentLogs.some(log => 
        log.message.includes('Skanowanie rozpoczęte') && 
        !recentLogs.some(l => l.message.includes('Skanowanie zakończone') && l.timestamp > log.timestamp)
      );
      setScanning(isScanning);

    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' });
      if (response.ok) {
        setLogs([]);
        alert('Logi wyczyszczone!');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const startScan = async () => {
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        alert('Skanowanie rozpoczęte! Obserwuj logi poniżej.');
        setAutoRefresh(true);
      } else {
        alert('Błąd: ' + (data.error || 'Nie udało się rozpocząć skanowania'));
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      alert('Błąd połączenia');
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'info': return '📝';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'scan': return '🔍';
      case 'api': return '🌐';
      default: return '📄';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'scan': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'api': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie logów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📋 Logi Systemu</h1>
              <p className="text-gray-600 mt-2">
                {scanning && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mr-3">
                    <span className="animate-pulse mr-2">🔍</span>
                    Trwa skanowanie...
                  </span>
                )}
                Łącznie: {logs.length} wpisów
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={startScan}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                🔍 Skanuj Teraz
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors $${
                  autoRefresh 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {autoRefresh ? '⏸️ Zatrzymaj' : '▶️ Auto-odśwież'}
              </button>
              <button
                onClick={clearLogs}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🗑️ Wyczyść
              </button>
              <a 
                href="/" 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                ← Strona Główna
              </a>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {logs.filter(l => l.type === 'scan').length}
                </div>
                <div className="text-sm text-gray-600">Skanowania</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {logs.filter(l => l.type === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Sukcesy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {logs.filter(l => l.type === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Ostrzeżenia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.type === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Błędy</div>
              </div>
            </div>
          </div>

          {/* Logi */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">📄 Historia logów</h2>
                {autoRefresh && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="animate-pulse mr-2">🔄</span>
                    Auto-odświeżanie co 2s
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg">Brak logów</p>
                  <p className="text-sm">Uruchom skanowanie aby zobaczyć logi</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border $${getLogColor(log.type)} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-lg">{getLogIcon(log.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium">{log.message}</p>
                            {log.details && (
                              <p className="text-sm opacity-75 mt-1">{log.details}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs opacity-60 ml-4 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('pl-PL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8 space-x-4">
            <a 
              href="/settings" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ⚙️ Ustawienia
            </a>
            <a 
              href="/prompts" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              📝 Prompty
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}