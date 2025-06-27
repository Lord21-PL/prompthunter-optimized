import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  try {
    const prisma = new PrismaClient();

    // Sprawdź połączenie z bazą
    await prisma.$connect();

    // Uruchom migracje (push schema)
    // W Railway używamy db push zamiast migrate
    console.log('Connecting to database...');

    // Test połączenia
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', result);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful. Schema will be pushed automatically.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test database connection',
    endpoint: '/api/migrate'
  });
}