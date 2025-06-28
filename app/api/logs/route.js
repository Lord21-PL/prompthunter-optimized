import { NextResponse } from 'next/server';

// Tymczasowe przechowywanie logów w pamięci
let logs = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    type: 'info',
    message: 'System PromptHunter uruchomiony',
    details: 'Aplikacja gotowa do pracy'
  }
];

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    total: logs.length
  });
}

export async function POST(request) {
  try {
    const { type, message, details } = await request.json();

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: type || 'info',
      message,
      details: details || null
    };

    logs.push(newLog);

    // Ogranicz do ostatnich 100 logów
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    return NextResponse.json({ 
      success: true, 
      log: newLog 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE() {
  logs = [];
  return NextResponse.json({ 
    success: true, 
    message: 'Logi wyczyszczone' 
  });
}