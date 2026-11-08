import { NextRequest, NextResponse } from 'next/server';
import { ipLimited } from '@/lib/rate-guard';
import { ensureKycProviders } from '@/lib/kyc-provider/registry';
import { getKycProvider } from '@/lib/kyc-provider/provider';
import { applyKycDecision } from '@/lib/kyc-decision';
import { cleanNote } from '@/lib/kyc-rules';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Called by the identity company, not by a person: no sign-in. Protected by the company's signature (checked in the
// provider's parseWebhook) and an IP rate limit. Only the company selected with KYC_PROVIDER is accepted.
export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const limited = await ipLimited('kyc-webhook', req, 120, 60_000);
  if (limited) return limited;
  ensureKycProviders();
  const { provider } = await ctx.params;
  const p = getKycProvider(provider);
  if (!p || (process.env.KYC_PROVIDER ?? '').trim().toLowerCase() !== p.id) return NextResponse.json({ ok: false }, { status: 404, headers: H });
  const raw = await req.text();
  if (raw.length > 100_000) return NextResponse.json({ ok: false }, { status: 413, headers: H });
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const ev = p.parseWebhook(raw, headers);
  if (!ev || !ev.uid.startsWith('web_')) return NextResponse.json({ ok: false }, { status: 401, headers: H });
  const reason = cleanNote(ev.reason) || (ev.decision === 'rejected' ? 'Rejected by the identity check' : '');
  try {
    const r = await applyKycDecision(ev.uid, ev.decision, reason, `provider:${p.id}`);
    // 404/409 are final answers (unknown person, already decided): replying 200 stops the company from retrying forever.
    return NextResponse.json({ ok: true, applied: r.code === 200 }, { headers: H });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: H });
  }
}
