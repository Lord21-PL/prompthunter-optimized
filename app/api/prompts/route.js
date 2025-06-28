import { NextResponse } from 'next/server';

// Tymczasowe przechowywanie promptów w pamięci
let prompts = [];

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      prompts: prompts,
      total: prompts.length
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const promptData = await request.json();

    // Sprawdź czy prompt już istnieje
    const exists = prompts.some(p => p.tweet_id === promptData.tweet_id);

    if (exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt already exists',
        duplicate: true
      });
    }

    // Dodaj nowy prompt
    const newPrompt = {
      id: Date.now(),
      ...promptData,
      created_at: new Date().toISOString()
    };

    prompts.push(newPrompt);

    // Ogranicz do ostatnich 100 promptów
    if (prompts.length > 100) {
      prompts = prompts.slice(-100);
    }

    return NextResponse.json({ 
      success: true, 
      prompt: newPrompt 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE() {
  prompts = [];
  return NextResponse.json({ 
    success: true, 
    message: 'Wszystkie prompty usunięte' 
  });
}