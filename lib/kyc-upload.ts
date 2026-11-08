'use client';

import { authHeaders } from '@/lib/api-token';
import { MAX_PHOTO_BYTES, fitSize, type FileKind } from '@/lib/kyc-files';

// Browser side of the identity photos: shrink the picture (phone cameras make 5-10 MB files), then send it.
const canvasBlob = (c: HTMLCanvasElement, q: number) => new Promise<Blob | null>((res) => c.toBlob(res, 'image/jpeg', q));

/** Turns any picture the person chose into a JPEG small enough to send (longest side 1600 px, quality lowered until it fits). */
export async function shrinkPhoto(file: File): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file);
    for (const max of [1600, 1200, 900]) {
      const { w, h } = fitSize(bmp.width, bmp.height, max);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')?.drawImage(bmp, 0, 0, w, h);
      for (const q of [0.85, 0.7, 0.55]) {
        const b = await canvasBlob(c, q);
        if (b && b.size <= MAX_PHOTO_BYTES) { bmp.close?.(); return b; }
      }
    }
    bmp.close?.();
    return null;
  } catch { return null; }
}

export async function uploadPhoto(kind: FileKind, blob: Blob): Promise<boolean> {
  try {
    const r = await fetch(`/api/kyc/files?kind=${kind}`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'image/jpeg' }), body: blob });
    return r.ok;
  } catch { return false; }
}
