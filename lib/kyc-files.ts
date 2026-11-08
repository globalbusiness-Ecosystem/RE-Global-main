// Identity documents sent for a verification request: which photos are needed, and what a photo must look like.
// Pure rules (no storage here). The photos themselves are kept by lib/kyc-files-store.ts, server only.

export const DOC_TYPES = ['id', 'passport'] as const;
export type DocType = (typeof DOC_TYPES)[number];
export const FILE_KINDS = ['front', 'back', 'selfie'] as const;
export type FileKind = (typeof FILE_KINDS)[number];

/** Largest photo we keep (after the browser shrinks it). Firestore documents hold 1 MB, and the photo is stored as text. */
export const MAX_PHOTO_BYTES = 600_000;

export const isDocType = (v: unknown): v is DocType => typeof v === 'string' && (DOC_TYPES as readonly string[]).includes(v);
export const isFileKind = (v: unknown): v is FileKind => typeof v === 'string' && (FILE_KINDS as readonly string[]).includes(v);

/** National ID: both sides and a selfie. Passport: the photo page and a selfie. */
export const requiredKinds = (t: DocType): FileKind[] => (t === 'id' ? ['front', 'back', 'selfie'] : ['front', 'selfie']);

/** True when every photo this document type needs has been uploaded. */
export const hasAllPhotos = (t: DocType, uploaded: readonly string[]): boolean => requiredKinds(t).every((k) => uploaded.includes(k));

/** Size to shrink a photo to: the longest side becomes `max` (never enlarged), keeping the shape. */
export function fitSize(w: number, h: number, max: number): { w: number; h: number } {
  if (!(w > 0) || !(h > 0)) return { w: 0, h: 0 };
  const k = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}
