import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Secondary market is not available yet' },
    { status: 503 }
  );
}
