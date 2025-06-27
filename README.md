# PromptHunter ⚡ Oszczędny

**Zoptymalizowana wersja pod darmowe Twitter API (100 zapytań/miesiąc)**

## 🎯 Kluczowe optymalizacje

### Limity API:
- ✅ **Maksymalnie 3 profile** (zamiast nieograniczonych)
- ✅ **3 zapytania na pierwszy skan** (zamiast 10+)
- ✅ **1 zapytanie dziennie na aktualizację** (zamiast co 6h)
- ✅ **95 zapytań miesięcznie** (5 zapytań bufor na błędy)
- ✅ **Automatyczne zatrzymanie** przed przekroczeniem limitu

### Inteligentne funkcje:
- 📊 **Monitor API w czasie rzeczywistym**
- ⚠️ **Alerty przed przekroczeniem limitu**
- 🎯 **Priorytetyzacja profili** (wysokie/normalne/niskie)
- 📈 **Szacowanie miesięcznego zużycia**
- 🔒 **Zablokowane ustawienia** (nie można przypadkowo przekroczyć)

## 🚀 Szybki start

### 1. Instalacja
```bash
npm install
cp .env.example .env.local
# Wypełnij .env.local swoimi kluczami Twitter API
```

### 2. Baza danych
```bash
npm run db:push
npm run db:seed
```

### 3. Uruchomienie
```bash
npm run dev
```

### 4. Dodaj profile (maksymalnie 3)
- Idź do Ustawień
- Dodaj maksymalnie 3 profile Twitter
- Ustaw priorytety (wysokie/normalne/niskie)

## 📊 Matematyka API

### Scenariusz 1: 3 profile wysokiego priorytetu
- Pierwszy skan: 3 × 3 zapytania = **9 zapytań**
- Aktualizacje: 3 × 30 dni = **90 zapytań**
- **RAZEM: 99 zapytań/miesiąc** ✅

### Scenariusz 2: Mix priorytetów (zalecane)
- 2 profile wysokie (codziennie): 60 zapytań
- 1 profil normalny (co 2 dni): 15 zapytań  
- Pierwszy skan: 9 zapytań
- **RAZEM: 84 zapytania/miesiąc** ✅

### Scenariusz 3: Maksymalne oszczędzanie
- 1 profil wysoki: 30 zapytań
- 2 profile niskie (co 3 dni): 20 zapytań
- Pierwszy skan: 9 zapytań
- **RAZEM: 59 zapytań/miesiąc** ✅

## ⚙️ Konfiguracja .env.local

```bash
# Twitter API - WYMAGANE
TWITTER_API_KEY="your-key"
TWITTER_API_SECRET="your-secret"
TWITTER_ACCESS_TOKEN="your-token"
TWITTER_ACCESS_SECRET="your-token-secret"

# OpenAI API
OPENAI_API_KEY="sk-your-key"

# Optymalizacja (NIE ZMIENIAJ!)
TWITTER_MONTHLY_LIMIT=95
TWITTER_FIRST_SCAN_REQUESTS=3
TWITTER_MAX_PROFILES=3
TWITTER_UPDATE_INTERVAL_HOURS=24
```

## 🔧 Funkcje bezpieczeństwa

### Automatyczne zabezpieczenia:
- ❌ **Blokada dodawania 4+ profili**
- ❌ **Blokada skanowania przy <5 pozostałych zapytań**
- ❌ **Blokada zmiany krytycznych ustawień**
- ✅ **Automatyczne zatrzymanie przy limicie**
- ✅ **Alerty w czasie rzeczywistym**

### Dashboard bezpieczeństwa:
- 📊 Licznik zapytań API (aktualizowany na żywo)
- 📈 Szacowanie miesięcznego zużycia
- ⚠️ Ostrzeżenia przed przekroczeniem
- 🎯 Rekomendacje optymalizacji

## 🚀 Wdrożenie na Railway

```bash
# 1. Wyślij kod na GitHub
git add .
git commit -m "PromptHunter Optimized"
git push

# 2. Railway
# - New Project → Deploy from GitHub
# - Dodaj PostgreSQL
# - Skonfiguruj zmienne środowiskowe
# - Deploy!
```

## 📈 Monitoring

### Sprawdź zużycie API:
```bash
curl http://localhost:3000/api/usage
```

### Logi skanowania:
```bash
# W Railway dashboard → View Logs
# Lub lokalnie w konsoli
```

## ⚠️ Ważne ostrzeżenia

1. **NIE zmieniaj limitów** w .env - są zoptymalizowane
2. **Maksymalnie 3 profile** - więcej = przekroczenie limitu
3. **Sprawdzaj dashboard** - monitor API w czasie rzeczywistym
4. **Pierwszy skan kosztuje 3 zapytania** - planuj mądrze
5. **Bufor 5 zapytań** - na błędy i testy

## 🆚 Porównanie wersji

| Funkcja | Standardowa | Oszczędna |
|---------|-------------|-----------|
| Profile | Nieograniczone | **3 maksymalnie** |
| Pierwszy skan | 10+ zapytań | **3 zapytania** |
| Aktualizacje | Co 6h | **Co 24h** |
| Miesięczne zużycie | 300+ zapytań | **~90 zapytań** |
| Monitoring API | Podstawowe | **Zaawansowane** |
| Zabezpieczenia | Brak | **Pełne** |

## 💡 Wskazówki optymalizacji

1. **Zacznij od 1 profilu** - przetestuj przez tydzień
2. **Wybieraj aktywne konta** - więcej promptów na zapytanie
3. **Używaj priorytetów** - wysokie tylko dla najważniejszych
4. **Sprawdzaj dashboard** - codziennie przez pierwszy tydzień
5. **Planuj z wyprzedzeniem** - 95 zapytań to niewiele

## 🎯 Cel: Maksymalnie 90 zapytań/miesiąc

Ta wersja jest zaprojektowana tak, żeby **nigdy nie przekroczyć 95 zapytań miesięcznie** przy normalnym użytkowaniu 3 profili.

**Bezpieczne, oszczędne, inteligentne!** ⚡

---

## 📞 Wsparcie

Jeśli przekraczasz limity lub masz problemy:
1. Sprawdź dashboard API usage
2. Zmniejsz liczbę profili
3. Zmień priorytety na niższe
4. Sprawdź logi błędów

**Pamiętaj: Lepiej mieć 2 dobrze działające profile niż 5 które przekraczają limit!** 🎯