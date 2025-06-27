import { NextResponse } from 'next/server';
import { TwitterOptimizedClient } from '../../../lib/twitterOptimized';

export async function GET() {
  try {
    const twitterClient = new TwitterOptimizedClient();
    const stats = await twitterClient.getMonthlyStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Błąd pobierania statystyk API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}