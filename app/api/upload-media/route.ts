import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import { guardApi } from '@/lib/api-guard';
import { adminStorage } from '@/lib/firebase-admin';
import { detectImage } from '@/lib/image-validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_BODY_SIZE = MAX_FILE_SIZE + 512 * 1024; // file + multipart overhead
const MAX_METADATA_CHARS = 2000;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

function parseMetadata(raw: FormDataEntryValue | null): Record<string, unknown> {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > MAX_METADATA_CHARS) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * POST /api/upload-media
 * Authenticated image upload (camera or gallery). Files go to Firebase Storage
 * (the serverless filesystem on Vercel is read-only / not persistent).
 */
export async function POST(request: NextRequest) {
  const guard = await guardApi(request, { scope: 'upload', limit: 10 });
  if (guard instanceof Response) return guard;

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return bad('Storage is not configured', 500);

  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_SIZE) return bad('File exceeds maximum size of 15MB', 413);

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return bad('No file provided');
    if (file.size === 0) return bad('Empty file');
    if (file.size > MAX_FILE_SIZE) return bad('File exceeds maximum size of 15MB', 413);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Trust the bytes, not the client-supplied MIME type or file name.
    const detected = detectImage(buffer);
    if (!detected) return bad('Unsupported image. Use JPEG, PNG, WebP or GIF.', 415);

    const type = formData.get('type');
    const metadata = parseMetadata(formData.get('metadata'));

    const timestamp = Date.now();
    const id = `${timestamp}-${randomBytes(8).toString('hex')}`;
    const filename = `${id}.${detected.ext}`;
    const objectPath = `uploads/${guard.uid}/${filename}`;
    const token = randomUUID();

    await adminStorage.bucket(bucketName).file(objectPath).save(buffer, {
      resumable: false,
      contentType: detected.mime,
      metadata: {
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token, uploadedBy: guard.username },
      },
    });

    const url =
      `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/` +
      `${encodeURIComponent(objectPath)}?alt=media&token=${token}`;

    return NextResponse.json({
      url,
      id,
      filename,
      type: typeof type === 'string' ? type.slice(0, 32) : '',
      size: file.size,
      uploadedAt: new Date(timestamp).toISOString(),
      metadata,
    });
  } catch (error) {
    console.error('[upload-media] error:', error);
    return bad('Upload failed', 500);
  }
}
