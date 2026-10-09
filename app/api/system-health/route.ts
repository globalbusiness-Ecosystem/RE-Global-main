import 'server-only';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Real health check: returns 200 only if Firestore answers and the Pi API key is
// configured, otherwise 503. Deliberately exposes booleans only (no env values,
// no error text), since this endpoint is public.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export async function GET() {
  let database = false;
  try {
    await withTimeout(adminDb.collection('settings').doc('global').get(), 3000);
    database = true;
  } catch {
    database = false;
  }
  const payments = Boolean(process.env.PI_API_KEY);
  const healthy = database && payments;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks: { api: true, database, payments },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
