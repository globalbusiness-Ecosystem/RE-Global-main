import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { submitKyc } from '@/lib/kyc-store';
import { uploadedKinds } from '@/lib/kyc-files-store';
import { hasAllPhotos } from '@/lib/kyc-files';
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
    // The photos this document type needs must already be uploaded.
    if (!hasAllPhotos(input.docType, await uploadedKinds(user.uid))) return NextResponse.json({ error: 'Photos missing', code: 'photos_missing' }, { status: 400, headers: H });
    const ok = await submitKyc(user.uid, input);
    if (!ok) return NextResponse.json({ error: 'A request already exists' }, { status: 409, headers: H });
    return NextResponse.json({ ok: true }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
