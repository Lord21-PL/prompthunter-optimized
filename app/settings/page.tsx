export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Ustawienia - Wersja Oszczędna
      </h1>

      {/* API Usage Monitor */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📊 Monitor API Twitter
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
            Oszczędny
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-blue-600">0/95</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Zapytania użyte</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-green-600">95</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Pozostało</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-orange-600">~90</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Szacowane/miesiąc</div>
          </div>
        </div>

        <div className="progress-bar mb-4">
          <div className="progress-fill bg-blue-600" style={{width: '0%'}}></div>
        </div>

        <div className="alert-success">
          <strong>✅ Bezpieczny poziom:</strong> Twoje ustawienia mieszczą się w limicie 95 zapytań/miesiąc
        </div>
      </div>

      {/* Profile Management */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Śledzone Profile 
          <span className="text-sm text-gray-500">(Limit: 3 profile)</span>
        </h2>

        <div className="alert-warning mb-6">
          <strong>⚠️ Ważne:</strong> Każdy profil zużywa ~30 zapytań/miesiąc (1 dziennie). 
          Maksymalnie 3 profile = 90 zapytań + 5 na pierwszy skan.
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Nazwa użytkownika (bez @)"
              className="input flex-1"
            />
            <select className="input w-32">
              <option>Wysoki</option>
              <option>Normalny</option>
              <option>Niski</option>
            </select>
            <button className="btn-primary">
              Dodaj Profil
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Priorytety:</strong>
            <ul className="mt-1 ml-4">
              <li>• <strong>Wysoki:</strong> Skanowanie codziennie (30 zapytań/miesiąc)</li>
              <li>• <strong>Normalny:</strong> Skanowanie co 2 dni (15 zapytań/miesiąc)</li>
              <li>• <strong>Niski:</strong> Skanowanie co 3 dni (10 zapytań/miesiąc)</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Aktywne profile (0/3):</h3>
            <div className="text-gray-500 dark:text-gray-400">
              Brak dodanych profili. Dodaj pierwszy profil powyżej.
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Status API</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span>Twitter API</span>
            <span className="text-yellow-600">Nie skonfigurowane</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span>OpenAI API</span>
            <span className="text-yellow-600">Nie skonfigurowane</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <span>Baza danych</span>
            <span className="text-green-600">Połączona</span>
          </div>
        </div>
      </div>

      {/* Optimized Scan Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Ustawienia Skanowania - Oszczędne</h2>

        <div className="alert-warning mb-6">
          <strong>🔒 Zablokowane ustawienia oszczędne:</strong> Te wartości są zoptymalizowane 
          pod darmowe API i nie mogą być zmieniane.
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Częstotliwość skanowania</label>
            <select className="input" disabled>
              <option>Co 24 godziny (oszczędne)</option>
            </select>
            <div className="text-sm text-gray-500 mt-1">
              Zablokowane: 1 zapytanie na profil dziennie
            </div>
          </div>

          <div>
            <label className="label">Maksymalna liczba profili</label>
            <input type="number" value="3" className="input" disabled />
            <div className="text-sm text-gray-500 mt-1">
              Zablokowane: 3 profile × 30 dni = 90 zapytań/miesiąc
            </div>
          </div>

          <div>
            <label className="label">Zapytania na pierwszy skan</label>
            <input type="number" value="3" className="input" disabled />
            <div className="text-sm text-gray-500 mt-1">
              Zablokowane: Maksymalnie 3 zapytania = ~300 tweetów
            </div>
          </div>

          <div>
            <label className="label">Miesięczny limit API</label>
            <input type="number" value="95" className="input" disabled />
            <div className="text-sm text-gray-500 mt-1">
              Zablokowane: 95 zapytań (5 zapytań bufor na błędy)
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoScan" defaultChecked disabled />
            <label htmlFor="autoScan" className="text-sm">
              Automatyczne skanowanie (zablokowane - zawsze włączone)
            </label>
          </div>

          <div className="pt-4">
            <button className="btn-secondary" disabled>
              Ustawienia Zablokowane (Wersja Oszczędna)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}