import { NextResponse } from 'next/server';
import { TwitterClient } from '../../../lib/twitter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'miroburn';

    const twitterToken = process.env.TWITTER_BEARER_TOKEN;

    if (!twitterToken) {
      return NextResponse.json({
        success: false,
        error: 'Brak TWITTER_BEARER_TOKEN w zmiennych środowiskowych'
      });
    }

    const twitter = new TwitterClient(twitterToken);

    // Test 1: Pobierz dane użytkownika
    const user = await twitter.getUserByUsername(username);

    // Test 2: Pobierz ostatnie tweety
    const tweets = await twitter.getUserTweets(user.id, { maxResults: 5 });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        followers: user.public_metrics?.followers_count || 0
      },
      tweets: tweets.tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        url: `https://twitter.com/${username}/status/${tweet.id}`
      })),
      api_usage: {
        requests_used: 2,
        remaining_monthly: 98 // Przykład
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}