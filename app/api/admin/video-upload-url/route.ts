import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isAdminRequest } from '@/lib/admin-guard';
import { createSignedUpload } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

// Admin only. { type } -> { uploadUrl, publicUrl, ext }. The browser then PUTs the video to uploadUrl itself.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const ext = TYPES[String(body?.type ?? '')];
  if (!ext) return NextResponse.json({ ok: false, error: 'Only MP4, WebM or MOV videos' }, { status: 400 });
  try {
    const out = await createSignedUpload(`videos/${Date.now()}-${randomUUID()}.${ext}`);
    return NextResponse.json({ ok: true, ...out, ext });
  } catch (err) {
    console.error('[admin/video-upload-url] error:', err);
    return NextResponse.json({ ok: false, error: 'Could not prepare the upload' }, { status: 502 });
  }
}
