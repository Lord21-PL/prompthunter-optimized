const { TwitterApi } = require('twitter-api-v2');

class TwitterOptimizedClient {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Limity API - OSZCZĘDNE USTAWIENIA
    this.limits = {
      MONTHLY_LIMIT: parseInt(process.env.TWITTER_MONTHLY_LIMIT) || 95,
      FIRST_SCAN_REQUESTS: parseInt(process.env.TWITTER_FIRST_SCAN_REQUESTS) || 3,
      MAX_TWEETS_PER_REQUEST: parseInt(process.env.TWITTER_MAX_TWEETS_PER_REQUEST) || 100,
      MAX_PROFILES: parseInt(process.env.TWITTER_MAX_PROFILES) || 3,
      UPDATE_INTERVAL_HOURS: parseInt(process.env.TWITTER_UPDATE_INTERVAL_HOURS) || 24,
      ENABLE_AUTO_SCAN: process.env.TWITTER_ENABLE_AUTO_SCAN === 'true'
    };
  }

  async checkApiUsage() {
    const { prisma } = require('./prisma');

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const usage = await prisma.apiUsage.findFirst({
      where: { month: currentMonth }
    });

    return {
      used: usage?.requestsUsed || 0,
      limit: this.limits.MONTHLY_LIMIT,
      remaining: this.limits.MONTHLY_LIMIT - (usage?.requestsUsed || 0),
      canMakeRequest: (usage?.requestsUsed || 0) < this.limits.MONTHLY_LIMIT
    };
  }

  async incrementApiUsage(requestsUsed = 1) {
    const { prisma } = require('./prisma');

    const currentMonth = new Date().toISOString().slice(0, 7);

    await prisma.apiUsage.upsert({
      where: { month: currentMonth },
      update: {
        requestsUsed: { increment: requestsUsed },
        lastUsedAt: new Date()
      },
      create: {
        month: currentMonth,
        requestsUsed: requestsUsed,
        lastUsedAt: new Date()
      }
    });
  }

  async scanProfileOptimized(username, isFirstScan = false) {
    const usage = await this.checkApiUsage();

    if (!usage.canMakeRequest) {
      throw new Error(`Przekroczono miesięczny limit API (${usage.limit} zapytań)`);
    }

    const { prisma } = require('./prisma');

    try {
      // Pobierz informacje o profilu
      const user = await this.client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description', 'profile_image_url']
      });

      await this.incrementApiUsage(1);

      if (!user.data) {
        throw new Error(`Profil @${username} nie został znaleziony`);
      }

      // Zapisz/zaktualizuj profil
      const profile = await prisma.profile.upsert({
        where: { username },
        update: {
          displayName: user.data.name,
          avatarUrl: user.data.profile_image_url,
          lastScanAt: new Date()
        },
        create: {
          username,
          displayName: user.data.name,
          avatarUrl: user.data.profile_image_url,
          isActive: true,
          lastScanAt: new Date()
        }
      });

      let tweets = [];
      let requestsUsed = 1; // Już użyliśmy 1 zapytanie na profil

      if (isFirstScan) {
        // PIERWSZY SKAN - maksymalnie 3 zapytania
        tweets = await this.getInitialTweets(user.data.id, username);
        requestsUsed += Math.min(this.limits.FIRST_SCAN_REQUESTS, 3);
      } else {
        // AKTUALIZACJA - tylko 1 zapytanie
        const lastTweet = await prisma.tweet.findFirst({
          where: { authorId: username },
          orderBy: { createdAt: 'desc' }
        });

        tweets = await this.getNewTweets(user.data.id, username, lastTweet?.id);
        requestsUsed += 1;
      }

      // Sprawdź czy nie przekroczymy limitu
      const newUsage = await this.checkApiUsage();
      if (newUsage.used + requestsUsed > this.limits.MONTHLY_LIMIT) {
        throw new Error(`Skanowanie przekroczyłoby miesięczny limit API`);
      }

      await this.incrementApiUsage(requestsUsed - 1); // -1 bo już zliczyliśmy profil

      return {
        profile,
        tweets,
        requestsUsed,
        remainingRequests: newUsage.remaining - requestsUsed
      };

    } catch (error) {
      console.error(`Błąd skanowania profilu @${username}:`, error);
      throw error;
    }
  }

  async getInitialTweets(userId, username) {
    const tweets = [];
    let nextToken = null;
    let requestCount = 0;
    const maxRequests = this.limits.FIRST_SCAN_REQUESTS;

    while (requestCount < maxRequests) {
      try {
        const response = await this.client.v2.userTimeline(userId, {
          max_results: this.limits.MAX_TWEETS_PER_REQUEST,
          'tweet.fields': ['created_at', 'public_metrics', 'context_annotations'],
          pagination_token: nextToken
        });

        if (response.data) {
          for (const tweet of response.data) {
            tweets.push({
              id: tweet.id,
              content: tweet.text,
              authorId: username,
              createdAt: new Date(tweet.created_at),
              url: `https://twitter.com/${username}/status/${tweet.id}`
            });
          }
        }

        nextToken = response.meta?.next_token;
        requestCount++;

        if (!nextToken || tweets.length >= 300) break;

        // Opóźnienie między zapytaniami
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Błąd pobierania tweetów:', error);
        break;
      }
    }

    return tweets;
  }

  async getNewTweets(userId, username, sinceId = null) {
    try {
      const options = {
        max_results: this.limits.MAX_TWEETS_PER_REQUEST,
        'tweet.fields': ['created_at', 'public_metrics', 'context_annotations']
      };

      if (sinceId) {
        options.since_id = sinceId;
      }

      const response = await this.client.v2.userTimeline(userId, options);

      const tweets = [];
      if (response.data) {
        for (const tweet of response.data) {
          tweets.push({
            id: tweet.id,
            content: tweet.text,
            authorId: username,
            createdAt: new Date(tweet.created_at),
            url: `https://twitter.com/${username}/status/${tweet.id}`
          });
        }
      }

      return tweets;
    } catch (error) {
      console.error('Błąd pobierania nowych tweetów:', error);
      return [];
    }
  }

  async getMonthlyStats() {
    const { prisma } = require('./prisma');

    const currentMonth = new Date().toISOString().slice(0, 7);

    const usage = await prisma.apiUsage.findFirst({
      where: { month: currentMonth }
    });

    const profileCount = await prisma.profile.count({
      where: { isActive: true }
    });

    const estimatedMonthlyUsage = profileCount * 30; // 1 zapytanie dziennie na profil

    return {
      currentUsage: usage?.requestsUsed || 0,
      monthlyLimit: this.limits.MONTHLY_LIMIT,
      remaining: this.limits.MONTHLY_LIMIT - (usage?.requestsUsed || 0),
      activeProfiles: profileCount,
      estimatedMonthlyUsage,
      isOverLimit: estimatedMonthlyUsage > this.limits.MONTHLY_LIMIT,
      recommendedProfiles: Math.floor(this.limits.MONTHLY_LIMIT / 30),
      lastUsed: usage?.lastUsedAt
    };
  }
}

module.exports = { TwitterOptimizedClient };