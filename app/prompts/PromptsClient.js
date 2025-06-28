'use client';

import { useState, useEffect } from 'react';

export default function PromptsClient() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllPrompts = async () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie prompty?')) {
      try {
        const response = await fetch('/api/prompts', { method: 'DELETE' });
        if (response.ok) {
          setPrompts([]);
          alert('Wszystkie prompty zostały usunięte!');
        }
      } catch (error) {
        console.error('Error clearing prompts:', error);
      }
    }
  };

  const getFilteredPrompts = () => {
    let filtered = prompts;

    // Filtruj po kategorii
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === filter.toLowerCase());
    }

    // Sortuj
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'confidence':
        return filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
      case 'username':
        return filtered.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
      default:
        return filtered;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'chatgpt': return '🤖';
      case 'claude': return '🧠';
      case 'midjourney': return '🎨';
      case 'dalle': return '🖼️';
      case 'stable diffusion': return '🌟';
      default: return '📝';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'chatgpt': return 'bg-green-100 text-green-800 border-green-200';
      case 'claude': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'midjourney': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dalle': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'stable diffusion': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPrompts = getFilteredPrompts();
  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie promptów...</p>
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
              <h1 className="text-4xl font-bold text-gray-900">📝 Znalezione Prompty</h1>
              <p className="text-gray-600 mt-2">
                Łącznie: {prompts.length} promptów
                {filteredPrompts.length !== prompts.length && (
                  <span className="ml-2 text-blue-600">
                    (wyświetlane: {filteredPrompts.length})
                  </span>
                )}
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={clearAllPrompts}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🗑️ Wyczyść Wszystkie
              </button>
              <a 
                href="/" 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                ← Strona Główna
              </a>
            </div>
          </div>

          {/* Statystyki */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {prompts.length}
                </div>
                <div className="text-sm text-gray-600">Wszystkie prompty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Kategorie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(prompts.map(p => p.username).filter(Boolean))].length}
                </div>
                <div className="text-sm text-gray-600">Profile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {prompts.filter(p => (p.confidence || 0) >= 0.9).length}
                </div>
                <div className="text-sm text-gray-600">Wysokiej jakości</div>
              </div>
            </div>
          </div>

          {/* Filtry */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Kategoria:</label>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sortuj:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="oldest">Najstarsze</option>
                  <option value="confidence">Pewność</option>
                  <option value="username">Użytkownik</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista promptów */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 Lista promptów ({filteredPrompts.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredPrompts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg">
                    {prompts.length === 0 ? 'Brak promptów' : 'Brak promptów w tej kategorii'}
                  </p>
                  <p className="text-sm">
                    {prompts.length === 0 ? 'Uruchom skanowanie aby znaleźć prompty' : 'Zmień filtr aby zobaczyć inne prompty'}
                  </p>
                </div>
              ) : (
                filteredPrompts.map((prompt, index) => (
                  <div key={prompt.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border $${getCategoryColor(prompt.category)}`}>
                          {getCategoryIcon(prompt.category)} {prompt.category || 'Nieznana'}
                        </span>
                        {prompt.confidence && (
                          <span className={`text-sm font-medium $${getConfidenceColor(prompt.confidence)}`}>
                            {Math.round(prompt.confidence * 100)}% pewności
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prompt.created_at && new Date(prompt.created_at).toLocaleString('pl-PL')}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed">{prompt.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {prompt.username && (
                          <span className="flex items-center">
                            <span className="mr-1">👤</span>
                            @{prompt.username}
                          </span>
                        )}
                        {prompt.tweet_url && (
                          <a 
                            href={prompt.tweet_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <span className="mr-1">🐦</span>
                            Zobacz tweet
                          </a>
                        )}
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(prompt.content)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span className="mr-1">📋</span>
                        Kopiuj
                      </button>
                    </div>
                  </div>
                ))
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
              href="/logs" 
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              📋 Logi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}