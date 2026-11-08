import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { detectImage } from '@/lib/image-validate';
import { getKyc } from '@/lib/kyc-store';
import { putKycFile, uploadedKinds } from '@/lib/kyc-files-store';
import { needsKyc } from '@/lib/kyc-rules';
import { MAX_PHOTO_BYTES, isFileKind } from '@/lib/kyc-files';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// A web sign-in uploads one identity photo (?kind=front|back|selfie) as the raw picture. Only while no request is
// waiting for review or approved; the photo is kept privately and only the team can open it.
export async function PUT(req: NextRequest) {
  const user = await guardApi(req, { scope: 'kyc-files', limit: 20, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  if (!needsKyc(user.uid)) return NextResponse.json({ error: 'Not needed' }, { status: 400, headers: H });
  const kind = req.nextUrl.searchParams.get('kind');
  if (!isFileKind(kind)) return NextResponse.json({ error: 'Invalid photo' }, { status: 400, headers: H });
  if (Number(req.headers.get('content-length') || 0) > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Too large' }, { status: 413, headers: H });
  try {
    const k = await getKyc(user.uid);
    if (k.status === 'pending' || k.status === 'approved') return NextResponse.json({ error: 'A request already exists' }, { status: 409, headers: H });
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Invalid photo' }, { status: 400, headers: H });
    // The declared type is not trusted: check the real file signature (jpeg or webp only).
    const real = detectImage(bytes);
    if (!real || (real.mime !== 'image/jpeg' && real.mime !== 'image/webp')) return NextResponse.json({ error: 'Invalid photo' }, { status: 400, headers: H });
    await putKycFile(user.uid, kind, real.mime, bytes);
    return NextResponse.json({ ok: true, uploaded: await uploadedKinds(user.uid) }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
