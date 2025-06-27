const cron = require('node-cron');
const { TwitterOptimizedClient } = require('../lib/twitterOptimized');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const twitterClient = new TwitterOptimizedClient();

// Skanowanie co 24 godziny o 6:00 rano
cron.schedule('0 6 * * *', async () => {
  console.log('🔍 Rozpoczynam automatyczne skanowanie profili...');

  try {
    // Sprawdź limit API
    const usage = await twitterClient.checkApiUsage();
    console.log(`📊 Zużycie API: ${usage.used}/${usage.limit} (pozostało: ${usage.remaining})`);

    if (usage.remaining < 5) {
      console.log('⚠️ Za mało pozostałych zapytań API - pomijam skanowanie');
      return;
    }

    // Pobierz aktywne profile
    const profiles = await prisma.profile.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' }, // Najpierw wysokie priorytety
        { lastScanAt: 'asc' }  // Potem najdawniej skanowane
      ]
    });

    console.log(`👥 Znaleziono ${profiles.length} aktywnych profili`);

    let scannedCount = 0;
    let totalRequestsUsed = 0;

    for (const profile of profiles) {
      try {
        // Sprawdź czy profil wymaga skanowania na podstawie priorytetu
        const shouldScan = shouldScanProfile(profile);

        if (!shouldScan) {
          console.log(`⏭️ Pomijam profil @${profile.username} (nie wymaga skanowania)`);
          continue;
        }

        // Sprawdź czy mamy wystarczająco zapytań
        const currentUsage = await twitterClient.checkApiUsage();
        if (currentUsage.remaining < 2) {
          console.log('⚠️ Osiągnięto limit API - przerywam skanowanie');
          break;
        }

        console.log(`🔍 Skanuję profil @${profile.username}...`);

        const result = await twitterClient.scanProfileOptimized(
          profile.username, 
          false // Nie pierwszy skan
        );

        console.log(`✅ @${profile.username}: ${result.tweets.length} tweetów, ${result.requestsUsed} zapytań`);

        scannedCount++;
        totalRequestsUsed += result.requestsUsed;

        // Opóźnienie między profilami
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Błąd skanowania @${profile.username}:`, error.message);

        // Zapisz błąd w logach
        await prisma.scanLog.create({
          data: {
            profileId: profile.id,
            status: 'error',
            errorMessage: error.message,
            startedAt: new Date(),
            completedAt: new Date()
          }
        });
      }
    }

    console.log(`🎉 Skanowanie zakończone: ${scannedCount} profili, ${totalRequestsUsed} zapytań`);

  } catch (error) {
    console.error('❌ Błąd automatycznego skanowania:', error);
  }
});

function shouldScanProfile(profile) {
  if (!profile.lastScanAt) return true; // Pierwszy skan

  const now = new Date();
  const lastScan = new Date(profile.lastScanAt);
  const hoursSinceLastScan = (now - lastScan) / (1000 * 60 * 60);

  switch (profile.priority) {
    case 'high':
      return hoursSinceLastScan >= 24; // Codziennie
    case 'normal':
      return hoursSinceLastScan >= 48; // Co 2 dni
    case 'low':
      return hoursSinceLastScan >= 72; // Co 3 dni
    default:
      return hoursSinceLastScan >= 24; // Domyślnie codziennie
  }
}

console.log('⏰ Scheduler uruchomiony - skanowanie codziennie o 6:00');
console.log('🔧 Tryb oszczędny: maksymalnie 3 profile, 1 zapytanie dziennie na profil');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Zamykam scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});