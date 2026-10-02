import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';
const MAX_AMOUNT = Number(process.env.PI_A2U_MAX_AMOUNT) > 0 ? Number(process.env.PI_A2U_MAX_AMOUNT) : 10;

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.PI_API_KEY) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
  let body: { uid?: unknown; amount?: unknown; memo?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const { uid, amount, memo } = body;
  if (typeof uid !== 'string' || uid.trim().length === 0 || uid.length > 128) {
    return NextResponse.json({ error: 'Invalid uid' }, { status: 400 });
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    return NextResponse.json({ error: `Amount must be between 0 and ${MAX_AMOUNT} Pi` }, { status: 400 });
  }
  const response = await fetch('https://api.minepi.com/v2/payments', {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment: {
        amount,
        memo: typeof memo === 'string' && memo ? memo.slice(0, 100) : 'RE Platform Reward',
        metadata: { type: 'app_to_user' },
        uid,
      },
    }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
