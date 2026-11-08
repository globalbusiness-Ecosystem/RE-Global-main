import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { submitKyc } from '@/lib/kyc-store';
import { uploadedKinds } from '@/lib/kyc-files-store';
import { hasAllPhotos } from '@/lib/kyc-files';
import { pickMailLang } from '@/lib/kyc-mail';
import { ensureKycProviders } from '@/lib/kyc-provider/registry';
import { activeKycProvider } from '@/lib/kyc-provider/provider';
import { siteUrl } from '@/lib/site-url';
import { needsKyc, parseKycRequest } from '@/lib/kyc-rules';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// A person asks to be verified. The team reviews the request; nothing is approved automatically.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'kyc-request', limit: 5, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  if (!needsKyc(user.uid)) return NextResponse.json({ error: 'Not needed' }, { status: 400, headers: H });
  const input = parseKycRequest(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Please check your details' }, { status: 400, headers: H });
  try {
    ensureKycProviders();
    const provider = activeKycProvider();
    // Manual review: the photos this document type needs must already be uploaded. With an identity company the
    // person takes the photos on the company's page instead.
    if (!provider && !hasAllPhotos(input.docType, await uploadedKinds(user.uid))) return NextResponse.json({ error: 'Photos missing', code: 'photos_missing' }, { status: 400, headers: H });
    const session = provider ? await provider.start({ uid: user.uid, legalName: input.legalName, country: input.country, docType: input.docType, returnUrl: `${siteUrl().replace(/\/+$/, '')}/kyc` }) : null;
    const ok = await submitKyc(user.uid, input, pickMailLang(req.headers.get('accept-language')));
    if (!ok) return NextResponse.json({ error: 'A request already exists' }, { status: 409, headers: H });
    return NextResponse.json({ ok: true, ...(session ? { url: session.url } : {}) }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
