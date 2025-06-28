// lib/twitter.js - Fixed Twitter API Client

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

  // FIXED: Poprawiony parametr exclude
  async getUserTweetsDeep(userId, options = {}) {
    const {
      totalTweets = 200,
      excludeReplies = true,
      excludeRetweets = true,
      sinceId = null
    } = options;

    let allTweets = [];
    let nextToken = null;
    let requestCount = 0;
    const maxRequestsPerProfile = 10;

    console.log(`🔍 Pobieranie ${totalTweets} tweetów dla użytkownika ${userId}...`);

    while (allTweets.length < totalTweets && requestCount < maxRequestsPerProfile) {
      const batchSize = Math.min(100, totalTweets - allTweets.length);

      let url = `${this.baseUrl}/users/${userId}/tweets?`;
      url += `max_results=${batchSize}`;
      url += `&tweet.fields=id,text,created_at,public_metrics,context_annotations`;

      if (nextToken) {
        url += `&pagination_token=${nextToken}`;
      }

      if (sinceId && !nextToken) {
        url += `&since_id=${sinceId}`;
      }

      // FIXED: Poprawny format exclude - jedna wartość z przecinkami
      const excludeValues = [];
      if (excludeReplies) excludeValues.push('replies');
      if (excludeRetweets) excludeValues.push('retweets');

      if (excludeValues.length > 0) {
        url += `&exclude=${excludeValues.join(',')}`;
      }

      console.log(`📡 Request ${requestCount + 1}/${maxRequestsPerProfile}: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Twitter API Error: ${response.status}`, error);
        throw new Error(`Twitter API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const tweets = data.data || [];

      allTweets.push(...tweets);
      requestCount++;

      console.log(`✅ Pobrano ${tweets.length} tweetów (łącznie: ${allTweets.length})`);

      nextToken = data.meta?.next_token;

      if (!nextToken || tweets.length === 0) {
        console.log(`🏁 Koniec tweetów dla użytkownika ${userId}`);
        break;
      }

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

  // FIXED: Poprawiona stara metoda też
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

    // FIXED: Poprawny format exclude
    const excludeValues = [];
    if (excludeReplies) excludeValues.push('replies');
    if (excludeRetweets) excludeValues.push('retweets');

    if (excludeValues.length > 0) {
      url += `&exclude=${excludeValues.join(',')}`;
    }

    console.log(`📡 Twitter API Request: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Twitter API Error: ${response.status}`, error);
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

    console.log(`📡 Twitter Search API Request: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Twitter API Error: ${response.status}`, error);
      throw new Error(`Twitter API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      tweets: data.data || [],
      meta: data.meta || {}
    };
  }
}