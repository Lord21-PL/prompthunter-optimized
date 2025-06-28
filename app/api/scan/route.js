import { NextResponse } from 'next/server';
import { TwitterClient } from '../../../lib/twitter';
import { OpenAIAnalyzer } from '../../../lib/openai';

// Przechowywanie ostatnich skanowań w pamięci
let scanHistory = {};

export async function POST() {
  try {
    // Sprawdź API keys
    const twitterToken = process.env.TWITTER_BEARER_TOKEN;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!twitterToken) {
      await addLog('error', 'Brak Twitter Bearer Token', 'Ustaw TWITTER_BEARER_TOKEN w zmiennych środowiskowych');
      return NextResponse.json({
        success: false,
        error: 'Brak Twitter Bearer Token. Ustaw TWITTER_BEARER_TOKEN w ustawieniach Railway.'
      });
    }

    if (!openaiKey) {
      await addLog('error', 'Brak OpenAI API Key', 'Ustaw OPENAI_API_KEY w zmiennych środowiskowych');
      return NextResponse.json({
        success: false,
        error: 'Brak OpenAI API Key. Ustaw OPENAI_API_KEY w ustawieniach Railway.'
      });
    }

    // Log rozpoczęcia
    await addLog('scan', 'Skanowanie rozpoczęte', 'Inicjalizacja Twitter API i OpenAI...');

    // Inicjalizuj klientów
    const twitter = new TwitterClient(twitterToken);
    const openai = new OpenAIAnalyzer(openaiKey);

    // Pobierz profile do skanowania
    let profiles = [];
    try {
      const profilesResponse = await fetch(`${getBaseUrl()}/api/profiles`);
      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        profiles = profilesData.profiles || [];
      }
    } catch (error) {
      await addLog('warning', 'Nie można pobrać profili', 'Używam domyślnego profilu');
    }

    // Fallback do domyślnego profilu
    if (profiles.length === 0) {
      profiles = [{ username: 'miroburn' }];
      await addLog('info', 'Używam domyślnego profilu', 'Profile: @miroburn');
    }

    await addLog('info', `Znaleziono ${profiles.length} profili do skanowania`, 
      `Profile: ${profiles.map(p => '@' + p.username).join(', ')}`);

    const scanResults = {
      total_profiles: profiles.length,
      scanned_profiles: 0,
      new_prompts: 0,
      skipped_duplicates: 0,
      api_requests_used: 0,
      twitter_requests: 0,
      openai_requests: 0,
      tweets_analyzed: 0
    };

    // Skanuj każdy profil
    for (const profile of profiles) {
      await addLog('scan', `🔍 Skanowanie @${profile.username}`, 'Pobieranie danych użytkownika...');

      const profileResult = await scanProfileDeep(twitter, openai, profile);

      scanResults.scanned_profiles++;
      scanResults.new_prompts += profileResult.new_prompts;
      scanResults.skipped_duplicates += profileResult.skipped_duplicates;
      scanResults.twitter_requests += profileResult.twitter_requests;
      scanResults.openai_requests += profileResult.openai_requests;
      scanResults.tweets_analyzed += profileResult.tweets_analyzed;
      scanResults.api_requests_used += profileResult.twitter_requests + profileResult.openai_requests;

      await addLog('success', 
        `✅ @${profile.username} - ${profileResult.new_prompts} nowych promptów`,
        `Tweety: ${profileResult.tweets_analyzed}, Twitter: ${profileResult.twitter_requests} req, OpenAI: ${profileResult.openai_requests} req, Duplikaty: ${profileResult.skipped_duplicates}`
      );
    }

    // Log zakończenia
    await addLog('success', 'Skanowanie zakończone pomyślnie!', 
      `Nowe prompty: ${scanResults.new_prompts}, Tweety przeanalizowane: ${scanResults.tweets_analyzed}, Twitter API: ${scanResults.twitter_requests}, OpenAI API: ${scanResults.openai_requests}`);

    const scanTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `Skanowanie zakończone! Znaleziono ${scanResults.new_prompts} nowych promptów z ${scanResults.tweets_analyzed} tweetów.`,
      results: scanResults,
      scan_time: scanTime
    });

  } catch (error) {
    await addLog('error', 'Błąd podczas skanowania', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function scanProfileDeep(twitter, openai, profile) {
  const username = profile.username;
  const now = new Date();

  let newPrompts = 0;
  let skippedDuplicates = 0;
  let twitterRequests = 0;
  let openaiRequests = 0;
  let tweetsAnalyzed = 0;

  try {
    // 1. Pobierz dane użytkownika
    await addLog('api', `📡 Pobieranie danych @${username}`, 'Twitter API: GET /users/by/username');
    const user = await twitter.getUserByUsername(username);
    twitterRequests++;

    if (!user) {
      await addLog('warning', `❌ Użytkownik @${username} nie znaleziony`, 'Sprawdź czy nazwa użytkownika jest poprawna');
      return { new_prompts: 0, skipped_duplicates: 0, twitter_requests: twitterRequests, openai_requests: 0, tweets_analyzed: 0 };
    }

    await addLog('success', `✅ Znaleziono @${username}`, `ID: ${user.id}, Followers: ${user.public_metrics?.followers_count || 0}`);

    // 2. Sprawdź czy to pierwsze skanowanie
    const lastScan = scanHistory[username];
    const isFirstScan = !lastScan;

    let tweetsToAnalyze = [];

    if (isFirstScan) {
      // PIERWSZE SKANOWANIE - pobierz DUŻO tweetów (do 1000!)
      await addLog('info', `📊 Pierwsze skanowanie @${username}`, 'Pobieranie ostatnich 1000 tweetów w wielu requestach...');

      const result = await twitter.getUserTweetsDeep(user.id, {
        totalTweets: 1000,        // ← ZWIĘKSZONE: 1000 tweetów!
        excludeReplies: true,
        excludeRetweets: true
      });

      twitterRequests += result.meta.requests_used;
      tweetsToAnalyze = result.tweets || [];

      await addLog('info', `📥 Pobrano ${tweetsToAnalyze.length} tweetów w ${result.meta.requests_used} requestach`, 
        `Najstarszy: ${tweetsToAnalyze[tweetsToAnalyze.length - 1]?.created_at || 'brak'}`);

    } else {
      // AKTUALIZACJA - pobierz tylko nowe tweety
      const hoursSinceLastScan = (now - new Date(lastScan.timestamp)) / (1000 * 60 * 60);

      if (hoursSinceLastScan < 23) {
        await addLog('info', `⏰ @${username} skanowany ${Math.round(hoursSinceLastScan)}h temu`, 'Pomijam - zbyt niedawno');
        return { new_prompts: 0, skipped_duplicates: 0, twitter_requests: twitterRequests, openai_requests: 0, tweets_analyzed: 0 };
      }

      await addLog('info', `🔄 Aktualizacja @${username}`, `Pobieranie nowych tweetów od ID: ${lastScan.lastTweetId}`);

      const result = await twitter.getUserTweetsDeep(user.id, {
        totalTweets: 200,         // ← ZWIĘKSZONE: 200 nowych tweetów
        sinceId: lastScan.lastTweetId,
        excludeReplies: true,
        excludeRetweets: true
      });

      twitterRequests += result.meta.requests_used;
      tweetsToAnalyze = result.tweets || [];

      await addLog('info', `📥 Pobrano ${tweetsToAnalyze.length} nowych tweetów w ${result.meta.requests_used} requestach`, 'Od ostatniego skanowania');
    }

    if (tweetsToAnalyze.length === 0) {
      await addLog('info', `📭 Brak nowych tweetów od @${username}`, 'Nic do analizy');
      return { new_prompts: 0, skipped_duplicates: 0, twitter_requests: twitterRequests, openai_requests: 0, tweets_analyzed: 0 };
    }

    // 3. Analizuj tweety przez OpenAI
    await addLog('scan', `🤖 Analizowanie ${tweetsToAnalyze.length} tweetów`, 'OpenAI sprawdza czy zawierają prompty...');

    for (const tweet of tweetsToAnalyze) {
      // Pomiń bardzo krótkie tweety
      if (tweet.text.length < 20) {
        continue;
      }

      tweetsAnalyzed++;

      await addLog('api', `🧠 Analizuję tweet ${tweet.id} (${tweetsAnalyzed}/${tweetsToAnalyze.length})`, 
        tweet.text.substring(0, 100) + '...');

      const analysis = await openai.analyzePrompt(tweet.text);
      openaiRequests++;

      if (analysis.isPrompt && analysis.confidence >= 0.7) {
        // To prawdopodobnie prompt!
        const promptData = {
          content: tweet.text,
          category: analysis.category,
          confidence: analysis.confidence,
          username: username,
          tweet_id: tweet.id,
          tweet_url: `https://twitter.com/${username}/status/${tweet.id}`,
          created_at: tweet.created_at,
          reasoning: analysis.reasoning
        };

        const added = await addPromptIfNew(promptData);
        if (added === true) {
          newPrompts++;
          await addLog('success', `➕ Znaleziono prompt! (${Math.round(analysis.confidence * 100)}%)`, 
            `${analysis.category}: ${tweet.text.substring(0, 100)}...`);
        } else if (added === false) {
          skippedDuplicates++;
          await addLog('warning', `⏭️ Duplikat promptu`, 'Tweet już w bazie danych');
        } else {
          await addLog('error', `❌ Błąd zapisywania promptu`, added);
        }
      } else {
        await addLog('info', `⏭️ Tweet nie jest promptem (${Math.round(analysis.confidence * 100)}%)`, 
          analysis.reasoning || 'Niska pewność');
      }
    }

    // 4. Zapisz informacje o skanowaniu
    scanHistory[username] = {
      timestamp: now.toISOString(),
      lastTweetId: tweetsToAnalyze[0]?.id || null,
      tweetsAnalyzed: tweetsAnalyzed,
      totalTweets: tweetsToAnalyze.length
    };

    return {
      new_prompts: newPrompts,
      skipped_duplicates: skippedDuplicates,
      twitter_requests: twitterRequests,
      openai_requests: openaiRequests,
      tweets_analyzed: tweetsAnalyzed
    };

  } catch (error) {
    await addLog('error', `❌ Błąd skanowania @${username}`, error.message);
    return {
      new_prompts: 0,
      skipped_duplicates: 0,
      twitter_requests: twitterRequests,
      openai_requests: openaiRequests,
      tweets_analyzed: tweetsAnalyzed
    };
  }
}

async function addPromptIfNew(promptData) {
  try {
    const existingResponse = await fetch(`${getBaseUrl()}/api/prompts`);

    if (!existingResponse.ok) {
      return `API prompts nie odpowiada: ${existingResponse.status}`;
    }

    const existingData = await existingResponse.json();
    const existingPrompts = existingData.prompts || [];

    const exists = existingPrompts.some(p => p.tweet_id === promptData.tweet_id);

    if (exists) {
      return false; // Duplikat
    }

    const response = await fetch(`${getBaseUrl()}/api/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    });

    if (!response.ok) {
      return `Błąd POST: ${response.status}`;
    }

    const result = await response.json();
    return result.success === true;

  } catch (error) {
    return `Exception: ${error.message}`;
  }
}

async function addLog(type, message, details = null) {
  try {
    await fetch(`${getBaseUrl()}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, message, details })
    });
  } catch (error) {
    console.error('Error adding log:', error);
  }
}

function getBaseUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function GET() {
  return NextResponse.json({
    success: true,
    scan_history: scanHistory,
    total_profiles_tracked: Object.keys(scanHistory).length
  });
}