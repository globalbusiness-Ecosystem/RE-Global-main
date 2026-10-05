import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';

const TX_TYPES = ['buy', 'rent', 'hotel', 'invest', 'tokenized'];
const CURRENCIES = ['PI', 'USD'];

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

function cleanStr(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '';
}

// Authenticated proxy to the RE backend. The caller must hold a valid Pi access
// token; the payer identity is taken from that token, never from the request body.
export async function POST(req: NextRequest) {
  const guard = await guardApi(req, { scope: 'payments', limit: 20 });
  if (guard instanceof Response) return guard;

  // Server-side variable first; NEXT_PUBLIC_API_URL kept only as a fallback.
  const backend = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!backend) return bad('Payments are not configured', 500);

  let b: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return bad('Invalid request');
    b = parsed as Record<string, unknown>;
  } catch {
    return bad('Invalid request');
  }

  const amount = b.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 1e9) {
    return bad('Invalid amount');
  }
  if (typeof b.currency !== 'string' || !CURRENCIES.includes(b.currency)) return bad('Invalid currency');
  if (typeof b.transactionType !== 'string' || !TX_TYPES.includes(b.transactionType)) {
    return bad('Invalid transaction type');
  }
  const propertyId = cleanStr(b.propertyId, 128);
  if (!propertyId) return bad('Invalid propertyId');

  let metadata: Record<string, unknown> | undefined;
  if (b.metadata !== undefined && b.metadata !== null) {
    if (typeof b.metadata !== 'object' || Array.isArray(b.metadata) || JSON.stringify(b.metadata).length > 4000) {
      return bad('Invalid metadata');
    }
    metadata = b.metadata as Record<string, unknown>;
  }

  try {
    const res = await fetch(`${backend.replace(/\/+$/, '')}/api/token-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        userId: guard.username, // identity comes from the verified token
        amount,
        currency: b.currency,
        transactionType: b.transactionType,
        propertyId,
        propertyTitle: cleanStr(b.propertyTitle, 150),
        metadata,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return bad('Could not reach payment service', 502);
  }
}
