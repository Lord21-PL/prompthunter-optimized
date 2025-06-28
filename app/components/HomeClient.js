'use client';

export default function HomeClient() {
  const handleScanClick = async () => {
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        alert('Skanowanie rozpoczęte! Sprawdź logi w zakładce "Logi Systemu".');
        // Opcjonalnie przekieruj do logów
        // window.location.href = '/logs';
      } else {
        alert('Błąd: ' + (data.error || 'Nie udało się rozpocząć skanowania'));
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      alert('Błąd połączenia');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎯 PromptHunter
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Automatyczne śledzenie i zbieranie AI promptów z X.com
          </p>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Status Aplikacji</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-green-700 font-semibold text-lg">✅ Aplikacja</div>
                <div className="text-sm text-green-600 mt-1">Działa poprawnie</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="text-blue-700 font-semibold text-lg">🗄️ Baza Danych</div>
                <div className="text-sm text-blue-600 mt-1">PostgreSQL połączona</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="text-purple-700 font-semibold text-lg">🔧 Konfiguracja</div>
                <div className="text-sm text-purple-600 mt-1">Gotowa do użycia</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <a 
              href="/settings" 
              className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              ⚙️ Ustawienia
            </a>

            <a 
              href="/prompts" 
              className="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              📝 Znalezione Prompty
            </a>

            <a 
              href="/logs" 
              className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              📋 Logi Systemu
            </a>

            <button 
              onClick={handleScanClick}
              className="bg-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🔍 Skanuj Teraz
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Funkcje PromptHunter:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🐦</span>
              <span className="text-gray-700">Automatyczne śledzenie profili na X.com</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🤖</span>
              <span className="text-gray-700">Inteligentne wykrywanie AI promptów</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📊</span>
              <span className="text-gray-700">Zarządzanie limitami API</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔄</span>
              <span className="text-gray-700">Automatyczne aktualizacje co 24h</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📋</span>
              <span className="text-gray-700">Logi w czasie rzeczywistym</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🧠</span>
              <span className="text-gray-700">Inteligentne skanowanie z pamięcią</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}