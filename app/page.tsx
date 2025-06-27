export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          PromptHunter ⚡ Oszczędny
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Zoptymalizowany pod darmowe Twitter API - maksymalnie 95 zapytań/miesiąc
        </p>
      </div>

      {/* API Usage Alert */}
      <div className="alert-warning mb-8">
        <div className="flex items-center">
          <div className="text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="font-semibold">Ważne - Limity API</h3>
            <p>Ta wersja jest zoptymalizowana pod darmowe konto Twitter API (100 zapytań/miesiąc). 
            Maksymalnie 3 profile, aktualizacja co 24h.</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-blue-600">0/95</div>
          <div className="text-sm text-gray-600">Zapytania API</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-green-600">0/3</div>
          <div className="text-sm text-gray-600">Profile</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-600">Prompty</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">⏰</div>
          <div className="text-2xl font-bold text-orange-600">24h</div>
          <div className="text-sm text-gray-600">Następny skan</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold mb-2">Super Oszczędny</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Maksymalnie 3 zapytania na pierwszy skan profilu, potem 1 zapytanie dziennie
          </p>
        </div>
        <div className="card p-6">
          <div className="text-3xl mb-4">📈</div>
          <h3 className="text-lg font-semibold mb-2">Monitor API</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Śledzenie zużycia API w czasie rzeczywistym z alertami
          </p>
        </div>
        <div className="card p-6">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Inteligentne Limity</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Automatyczne zatrzymanie przed przekroczeniem limitu
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-4">Pierwsze kroki - Wersja Oszczędna</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold">Skonfiguruj zmienne środowiskowe</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Skopiuj .env.example do .env.local i wypełnij kluczami Twitter API
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold">Uruchom bazę danych</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Wykonaj: npm run db:push && npm run db:seed
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold">Dodaj maksymalnie 3 profile</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Przejdź do Ustawień i dodaj profile Twitter (limit: 3 profile)
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
            <div>
              <h3 className="font-semibold">Gotowe!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Aplikacja będzie automatycznie skanować profile co 24h, zużywając ~90 zapytań/miesiąc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}