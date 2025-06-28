import { NextResponse } from 'next/server';

// Tymczasowe przechowywanie (później zastąpimy bazą)
let profiles = [];

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    profiles 
  });
}

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username is required' 
      }, { status: 400 });
    }

    const newProfile = {
      id: Date.now(),
      username: username.trim(),
      created_at: new Date().toISOString(),
      prompts_count: 0
    };

    profiles.push(newProfile);

    return NextResponse.json({ 
      success: true, 
      profile: newProfile 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}