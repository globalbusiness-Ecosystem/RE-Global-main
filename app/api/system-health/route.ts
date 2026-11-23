import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { ipLimited } from '@/lib/rate-guard';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { probe } from '@/lib/health-checks';

export const dynamic = 'force-dynamic';

// Real health check: 200 only when the parts the app cannot work without really run, otherwise 503.
//  database  - one document read
//  queries   - a field-limited query (the same call shape the listings and tours use)
//  auth      - signs a login token with the service account key (no network, no user is created)
//  passkeys  - builds passkey login options with the installed WebAuthn library
//  payments  - the Pi API key is configured
// Public endpoint: booleans only (no env values, no error text). Reasons go to the server log.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('health', req, 30, 60 * 1000);
  if (limited) return limited;

  const [database, queries, auth, passkeys] = await Promise.all([
    probe('database', () => adminDb.collection('settings').doc('global').get()),
    probe('queries', () => adminDb.collection('properties').select('title').limit(1).get()),
    probe('auth', async () => {
      const token = await adminAuth.createCustomToken('health-probe');
      if (typeof token !== 'string' || token.length < 20) throw new Error('empty token');
    }),
    probe('passkeys', async () => {
      const o = await generateAuthenticationOptions({ rpID: 'health.invalid', userVerification: 'required' });
      if (!o.challenge) throw new Error('no challenge');
    }),
  ]);
  const payments = Boolean(process.env.PI_API_KEY);
  const healthy = database && queries && auth && passkeys && payments;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks: { api: true, database, queries, auth, passkeys, payments, ai: Boolean(process.env.ANTHROPIC_API_KEY) },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
