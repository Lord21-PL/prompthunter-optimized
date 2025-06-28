'use client';

import { useState, useEffect } from 'react';

export default function SettingsClient() {
  const [config, setConfig] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchProfiles();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const addProfile = async () => {
    if (!newProfile.trim() || adding) return;

    setAdding(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newProfile.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setNewProfile('');
        fetchProfiles();
        alert('Profil dodany pomyślnie!');
      } else {
        alert('Błąd: ' + (data.error || 'Nie udało się dodać profilu'));
      }
    } catch (error) {
      console.error('Error adding profile:', error);
      alert('Błąd połączenia');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie ustawień...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">⚙️ Ustawienia PromptHunter</h1>

          {/* Status API */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">📊 Status API</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg border-2 $${config?.twitter_configured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`font-semibold text-lg $${config?.twitter_configured ? 'text-green-800' : 'text-red-800'}`}>
                  Twitter API
                </div>
                <div className={`text-sm $${config?.twitter_configured ? 'text-green-600' : 'text-red-600'}`}>
                  {config?.twitter_configured ? '✅ Skonfigurowane' : '❌ Nie skonfigurowane'}
                </div>
              </div>
              <div className={`p-6 rounded-lg border-2 $${config?.openai_configured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`font-semibold text-lg $${config?.openai_configured ? 'text-green-800' : 'text-red-800'}`}>
                  OpenAI API
                </div>
                <div className={`text-sm $${config?.openai_configured ? 'text-green-600' : 'text-red-600'}`}>
                  {config?.openai_configured ? '✅ Skonfigurowane' : '❌ Nie skonfigurowane'}
                </div>
              </div>
            </div>
          </div>

          {/* Limity API */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">📈 Limity API</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miesięczny limit zapytań Twitter
                </label>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {config?.used_requests || 0} / {config?.monthly_limit || 95}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `$${Math.min(((config?.used_requests || 0) / (config?.monthly_limit || 95)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Śledzone Profile */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">👥 Śledzone Profile</h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                placeholder="Nazwa użytkownika (np. elonmusk)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addProfile()}
                disabled={adding}
              />
              <button
                onClick={addProfile}
                disabled={adding || !newProfile.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {adding ? 'Dodawanie...' : 'Dodaj Profil'}
              </button>
            </div>

            <div className="space-y-3">
              {profiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👤</div>
                  <p className="text-lg">Brak śledzonych profili</p>
                  <p className="text-sm">Dodaj pierwszy profil powyżej</p>
                </div>
              ) : (
                profiles.map((profile, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-semibold text-lg text-gray-800">@{profile.username}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        Dodano: {new Date(profile.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                      Prompty: {profile.prompts_count || 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <a 
              href="/" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              ← Powrót do strony głównej
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}