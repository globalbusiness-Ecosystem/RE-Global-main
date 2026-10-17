import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadToSupabase } from '@/lib/supabase-storage';
import { isAdminRequest } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: 'Only JPG, PNG or WebP images' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: 'Image too large (max 4MB)' }, { status: 400 });

  try {
    const path = `properties/${Date.now()}-${randomUUID()}.${ext}`;
    const url = await uploadToSupabase(path, Buffer.from(await file.arrayBuffer()), file.type);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error('[admin/upload-image] error:', err);
    const reason = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: `Upload failed: ${reason}` }, { status: 502 });
  }
}
