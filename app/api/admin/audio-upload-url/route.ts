import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isAdminRequest } from '@/lib/admin-guard';
import { createSignedUpload } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'weba' };

// Admin only. { type } -> { uploadUrl, publicUrl, ext }. The browser then PUTs the sound file to uploadUrl itself.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const ext = TYPES[String(body?.type ?? '')];
  if (!ext) return NextResponse.json({ ok: false, error: 'Only MP3, M4A, AAC, OGG, WAV or WebM audio' }, { status: 400 });
  try {
    const out = await createSignedUpload(`audio/${Date.now()}-${randomUUID()}.${ext}`);
    return NextResponse.json({ ok: true, ...out, ext });
  } catch (err) {
    console.error('[admin/audio-upload-url] error:', err);
    return NextResponse.json({ ok: false, error: 'Could not prepare the upload' }, { status: 502 });
  }
}
