import { NextResponse } from 'next/server';

// Przechowywanie ostatnich skanowań w pamięci
let scanHistory = {};

export async function POST() {
  try {
    // Log rozpoczęcia
    await addLog('scan', 'Skanowanie rozpoczęte', 'Sprawdzanie profili do skanowania...');

    // Pobierz profile do skanowania
    const profilesResponse = await fetch(`${getBaseUrl()}/api/profiles`);
    const profilesData = await profilesResponse.json();
    const profiles = profilesData.profiles || [];

    if (profiles.length === 0) {
      await addLog('warning', 'Brak profili do skanowania', 'Dodaj profile w ustawieniach');
      return NextResponse.json({
        success: false,
        error: 'Brak profili do skanowania. Dodaj profile w ustawieniach.'
      });
    }

    await addLog('info', `Znaleziono ${profiles.length} profili do skanowania`, 
      `Profile: ${profiles.map(p => '@' + p.username).join(', ')}`);

    const scanResults = {
      total_profiles: profiles.length,
      scanned_profiles: 0,
      new_prompts: 0,
      skipped_duplicates: 0,
      api_requests_used: 0
    };

    // Skanuj każdy profil
    for (const profile of profiles) {
      await addLog('scan', `🔍 Skanowanie @${profile.username}`, 'Sprawdzanie ostatniego skanowania...');

      const profileResult = await scanProfile(profile);

      scanResults.scanned_profiles++;
      scanResults.new_prompts += profileResult.new_prompts;
      scanResults.skipped_duplicates += profileResult.skipped_duplicates;
      scanResults.api_requests_used += profileResult.api_requests;

      await addLog('success', 
        `✅ @${profile.username} - ${profileResult.new_prompts} nowych promptów`,
        `API requests: ${profileResult.api_requests}, Duplikaty: ${profileResult.skipped_duplicates}`
      );
    }

    // Log zakończenia
    await addLog('success', 'Skanowanie zakończone pomyślnie!', 
      `Nowe prompty: ${scanResults.new_prompts}, API requests: ${scanResults.api_requests_used}`);

    const scanTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `Skanowanie zakończone! Znaleziono ${scanResults.new_prompts} nowych promptów.`,
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

async function scanProfile(profile) {
  const username = profile.username;
  const now = new Date();

  // Sprawdź czy to pierwsze skanowanie tego profilu
  const lastScan = scanHistory[username];
  const isFirstScan = !lastScan;

  let newPrompts = 0;
  let skippedDuplicates = 0;
  let apiRequests = 0;

  if (isFirstScan) {
    // PIERWSZE SKANOWANIE
    await addLog('info', `📊 Pierwsze skanowanie @${username}`, 'Pobieranie ostatnich tweetów (max 3 requesty)');

    const mockPrompts = generateMockPrompts(username, 'full_scan');
    apiRequests = 3;

    for (const prompt of mockPrompts) {
      const added = await addPromptIfNew(prompt);
      if (added) {
        newPrompts++;
        await addLog('success', `➕ Nowy prompt od @${username}`, prompt.content.substring(0, 100) + '...');
      } else {
        skippedDuplicates++;
        await addLog('warning', `⏭️ Duplikat od @${username}`, 'Prompt już istnieje w bazie');
      }
    }

  } else {
    // AKTUALIZACJA
    const hoursSinceLastScan = (now - new Date(lastScan)) / (1000 * 60 * 60);

    if (hoursSinceLastScan < 23) {
      await addLog('info', `⏰ @${username} skanowany ${Math.round(hoursSinceLastScan)}h temu`, 'Pomijam - zbyt niedawno');
      return { new_prompts: 0, skipped_duplicates: 0, api_requests: 0 };
    }

    await addLog('info', `🔄 Aktualizacja @${username}`, 'Pobieranie tylko nowych tweetów (1 request)');

    const mockPrompts = generateMockPrompts(username, 'update');
    apiRequests = 1;

    for (const prompt of mockPrompts) {
      const added = await addPromptIfNew(prompt);
      if (added) {
        newPrompts++;
        await addLog('success', `➕ Nowy prompt od @${username}`, prompt.content.substring(0, 100) + '...');
      } else {
        skippedDuplicates++;
      }
    }
  }

  // Zapisz czas skanowania
  scanHistory[username] = now.toISOString();

  return {
    new_prompts: newPrompts,
    skipped_duplicates: skippedDuplicates,
    api_requests: apiRequests
  };
}

function generateMockPrompts(username, scanType) {
  const basePrompts = [
    {
      content: `Create a comprehensive guide for ${username}'s industry. Include step-by-step instructions, best practices, and common pitfalls to avoid.`,
      category: 'ChatGPT',
      confidence: 0.91
    },
    {
      content: `Design a modern logo for a tech startup, minimalist style, blue and white colors, clean typography, professional look`,
      category: 'Midjourney',
      confidence: 0.88
    },
    {
      content: `Act as a ${username} expert. Analyze the current market trends and provide actionable insights for the next quarter.`,
      category: 'Claude',
      confidence: 0.85
    }
  ];

  if (scanType === 'full_scan') {
    return basePrompts.map((prompt, index) => ({
      ...prompt,
      username,
      tweet_id: `${username}_${Date.now()}_${index}`,
      tweet_url: `https://twitter.com/${username}/status/${Date.now() + index}`,
      created_at: new Date(Date.now() - (index * 3600000)).toISOString()
    }));
  } else {
    return basePrompts.slice(0, 1).map((prompt, index) => ({
      ...prompt,
      username,
      tweet_id: `${username}_new_${Date.now()}_${index}`,
      tweet_url: `https://twitter.com/${username}/status/${Date.now() + index}`,
      created_at: new Date().toISOString()
    }));
  }
}

async function addPromptIfNew(promptData) {
  try {
    const existingResponse = await fetch(`${getBaseUrl()}/api/prompts`);
    const existingData = await existingResponse.json();
    const existingPrompts = existingData.prompts || [];

    const exists = existingPrompts.some(p => p.tweet_id === promptData.tweet_id);

    if (exists) {
      return false;
    }

    const response = await fetch(`${getBaseUrl()}/api/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    await addLog('error', 'Błąd dodawania promptu', error.message);
    return false;
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
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return 'http://localhost:3000';
}

export async function GET() {
  return NextResponse.json({
    success: true,
    scan_history: scanHistory,
    total_profiles_tracked: Object.keys(scanHistory).length
  });
}