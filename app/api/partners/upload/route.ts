import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { detectImage } from '@/lib/image-validate';
import { uploadToSupabase } from '@/lib/supabase-storage';
import { getPartner } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };
const MAX_BYTES = 4 * 1024 * 1024;

// An approved partner uploads one project photo (JPG, PNG or WebP, up to 4MB). The type is read from the file's own bytes.
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS });
  }
  const limited = await rateLimited('partner-upload', user.uid, 60, 60 * 60 * 1000);
  if (limited) return limited;
  let file: File | null = null;
  try {
    const f = (await req.formData()).get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: HEADERS });
  }
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400, headers: HEADERS });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 400, headers: HEADERS });
  try {
    const partner = await getPartner(user.username);
    if (!partner || partner.status !== 'approved') return NextResponse.json({ error: 'not_partner' }, { status: 403, headers: HEADERS });
    const bytes = Buffer.from(await file.arrayBuffer());
    const kind = detectImage(bytes);
    if (!kind || kind.mime === 'image/gif') return NextResponse.json({ error: 'bad_type' }, { status: 400, headers: HEADERS });
    const owner = user.username.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const url = await uploadToSupabase(`partners/${owner}/${Date.now()}-${randomUUID()}.${kind.ext}`, bytes, kind.mime);
    return NextResponse.json({ ok: true, url }, { headers: HEADERS });
  } catch (err) {
    console.error('[partners/upload] error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 502, headers: HEADERS });
  }
}
