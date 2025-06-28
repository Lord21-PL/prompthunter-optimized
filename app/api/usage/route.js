import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usage = {
      twitter: {
        used: 0,
        limit: 95,
        remaining: 95
      },
      openai: {
        used: 0,
        limit: 1000,
        remaining: 1000
      }
    };

    return NextResponse.json({
      success: true,
      usage
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}