import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { ensureProviders } from '@/lib/card-pay/registry';
import { cardWebhookDeps } from '@/lib/card-pay/deps';
import { handleCardWebhook } from '@/lib/card-pay/webhook';

export const dynamic = 'force-dynamic';

// Called by the payment company, not by a person: there is no sign-in. It is protected by the company's signature
// (checked inside the provider's parseWebhook) and an IP rate limit.
export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const limited = await ipLimited('card-webhook', req, 120, 60_000);
  if (limited) return limited;
  ensureProviders();
  const { provider } = await ctx.params;
  const raw = await req.text();
  if (raw.length > 100_000) return NextResponse.json({ ok: false, error: 'too large' }, { status: 413 });
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const reply = await handleCardWebhook(provider, raw, headers, cardWebhookDeps);
  return NextResponse.json(reply.body, { status: reply.status, headers: { 'Cache-Control': 'no-store' } });
}
