import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadToSupabase } from '@/lib/supabase-storage';
import { isAdminRequest } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

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
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: 'File too large (max 4MB)' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return NextResponse.json({ ok: false, error: 'Only PDF files are allowed' }, { status: 400 });
  }

  try {
    const path = `contract-docs/${Date.now()}-${randomUUID()}.pdf`;
    const url = await uploadToSupabase(path, bytes, 'application/pdf');
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error('[admin/upload-contract] error:', err);
    const reason = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: `Upload failed: ${reason}` }, { status: 502 });
  }
}
