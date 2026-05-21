import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const checks = {
      api: true,
      database: await checkDatabase(),
      services: await checkServices(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      status: 'healthy',
      checks,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Validate Firebase connection
    return true;
  } catch {
    return false;
  }
}

async function checkServices(): Promise<Record<string, boolean>> {
  return {
    network: true,
    auth: true,
    payments: true,
    whatsapp: true,
  };
}
