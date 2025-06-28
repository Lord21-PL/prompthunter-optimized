import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const twitter_configured = !!(
      process.env.TWITTER_API_KEY && 
      process.env.TWITTER_API_SECRET && 
      process.env.TWITTER_ACCESS_TOKEN && 
      process.env.TWITTER_ACCESS_SECRET
    );

    const openai_configured = !!process.env.OPENAI_API_KEY;

    return NextResponse.json({
      success: true,
      twitter_configured,
      openai_configured,
      monthly_limit: parseInt(process.env.TWITTER_MONTHLY_LIMIT || '95'),
      max_profiles: parseInt(process.env.TWITTER_MAX_PROFILES || '3'),
      used_requests: 0,
      database_connected: !!process.env.DATABASE_URL
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}