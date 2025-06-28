// lib/twitter.js - Enhanced Twitter API Client z większymi limitami

export class TwitterClient {
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.baseUrl = 'https://api.twitter.com/2';
  }

  async getUserByUsername(username) {
    const url = `${this.baseUrl}/users/by/username/${username}?user.fields=id,name,username,public_metrics`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  // ENHANCED: Pobierz więcej tweetów w wielu requestach
  async getUserTweetsDeep(userId, options = {}) {
    const {
      totalTweets = 200,        // ← ZWIĘKSZONE: Łącznie tweetów do pobrania
      excludeReplies = true,
      excludeRetweets = true,
      sinceId = null
    } = options;

    let allTweets = [];
    let nextToken = null;
    let requestCount = 0;
    const maxRequestsPerProfile = 10; // ← LIMIT: Max 10 requestów per profil

    console.log(`🔍 Pobieranie ${totalTweets} tweetów dla użytkownika ${userId}...`);

    while (allTweets.length < totalTweets && requestCount < maxRequestsPerProfile) {
      const batchSize = Math.min(100, totalTweets - allTweets.length); // Max 100 per request (Twitter limit)

      let url = `${this.baseUrl}/users/${userId}/tweets?`;
      url += `max_results=${batchSize}`;
      url += `&tweet.fields=id,text,created_at,public_metrics,context_annotations`;

      if (nextToken) {
        url += `&pagination_token=${nextToken}`;
      }

      if (sinceId && !nextToken) { // Only on first request
        url += `&since_id=${sinceId}`;
      }

      if (excludeReplies) {
        url += `&exclude=replies`;
      }

      if (excludeRetweets) {
        url += `&exclude=retweets`;
      }

      console.log(`📡 Request ${requestCount + 1}/${maxRequestsPerProfile}: Pobieranie ${batchSize} tweetów...`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twitter API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const tweets = data.data || [];

      allTweets.push(...tweets);
      requestCount++;

      console.log(`✅ Pobrano ${tweets.length} tweetów (łącznie: ${allTweets.length})`);

      // Check if there are more tweets
      nextToken = data.meta?.next_token;

      if (!nextToken || tweets.length === 0) {
        console.log(`🏁 Koniec tweetów dla użytkownika ${userId}`);
        break;
      }

      // Rate limiting - pauza między requestami
      if (requestCount < maxRequestsPerProfile) {
        console.log(`⏳ Pauza 1s przed następnym requestem...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Podsumowanie: ${allTweets.length} tweetów w ${requestCount} requestach`);

    return {
      tweets: allTweets,
      meta: {
        result_count: allTweets.length,
        requests_used: requestCount,
        next_token: nextToken
      }
    };
  }

  // LEGACY: Stara metoda (dla kompatybilności)
  async getUserTweets(userId, options = {}) {
    const {
      maxResults = 100,
      sinceId = null,
      excludeReplies = true,
      excludeRetweets = true
    } = options;

    let url = `${this.baseUrl}/users/${userId}/tweets?`;
    url += `max_results=${Math.min(maxResults, 100)}`;
    url += `&tweet.fields=id,text,created_at,public_metrics,context_annotations`;

    if (sinceId) {
      url += `&since_id=${sinceId}`;
    }

    if (excludeReplies) {
      url += `&exclude=replies`;
    }

    if (excludeRetweets) {
      url += `&exclude=retweets`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      tweets: data.data || [],
      meta: data.meta || {}
    };
  }

  async searchRecentTweets(query, maxResults = 10) {
    const url = `${this.baseUrl}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=id,text,created_at,author_id,public_metrics`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return {
      tweets: data.data || [],
      meta: data.meta || {}
    };
  }
}