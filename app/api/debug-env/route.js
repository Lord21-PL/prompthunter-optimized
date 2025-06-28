import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    TWITTER_API_KEY: process.env.TWITTER_API_KEY ? 'SET' : 'NOT_SET',
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET ? 'SET' : 'NOT_SET',
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET ? 'SET' : 'NOT_SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
    PORT: process.env.PORT || 'NOT_SET',
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT || 'NOT_SET'
  };

  return NextResponse.json(envVars);
}