import 'server-only';

// Minimal Supabase Storage uploader (REST, no extra dependency).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server only), SUPABASE_BUCKET (default "properties", must be Public).
export async function uploadToSupabase(path: string, bytes: Buffer, contentType: string): Promise<string> {
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const bucket = (process.env.SUPABASE_BUCKET || 'properties').trim();
  if (!base || !key) throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');

  const res = await fetch(`${base}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': contentType,
      'Cache-Control': 'max-age=31536000',
      'x-upsert': 'false',
    },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { message?: string; error?: string };
      msg = j.message || j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

// A one-time upload address so the browser can send a big file straight to Supabase (Vercel functions refuse bodies over ~4.5MB).
// Returns the address to PUT the file to, and the public address the file will have afterwards.
export async function createSignedUpload(path: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const bucket = (process.env.SUPABASE_BUCKET || 'properties').trim();
  if (!base || !key) throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  const res = await fetch(`${base}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { url?: string };
  if (!j.url) throw new Error('No upload address returned');
  const rel = j.url.startsWith('http') ? j.url : `${base}/storage/v1${j.url.startsWith('/') ? '' : '/'}${j.url}`;
  return { uploadUrl: rel, publicUrl: `${base}/storage/v1/object/public/${bucket}/${path}` };
}

// A one-time upload address so the browser can send a big file straight to Supabase (Vercel functions refuse bodies over ~4.5MB).
// Returns the address to PUT the file to, and the public address the file will have afterwards.
export async function createSignedUpload(path: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const bucket = (process.env.SUPABASE_BUCKET || 'properties').trim();
  if (!base || !key) throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  const res = await fetch(`${base}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { url?: string };
  if (!j.url) throw new Error('No upload address returned');
  const rel = j.url.startsWith('http') ? j.url : `${base}/storage/v1${j.url.startsWith('/') ? '' : '/'}${j.url}`;
  return { uploadUrl: rel, publicUrl: `${base}/storage/v1/object/public/${bucket}/${path}` };
}
