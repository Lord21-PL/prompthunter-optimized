import { NextResponse } from 'next/server';

export async function GET() {
  // Sprawdź które zmienne są dostępne
  const envVars = {
    TWITTER_API_KEY: process.env.TWITTER_API_KEY ? 'SET' : 'MISSING',
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET ? 'SET' : 'MISSING',
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN ? 'SET' : 'MISSING',
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET ? 'SET' : 'MISSING',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
    TWITTER_MONTHLY_LIMIT: process.env.TWITTER_MONTHLY_LIMIT || 'NOT SET',
    TWITTER_MAX_PROFILES: process.env.TWITTER_MAX_PROFILES || 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  };

  return NextResponse.json({
    success: true,
    environment: envVars,
    timestamp: new Date().toISOString()
  });
}