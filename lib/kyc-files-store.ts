import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { encryptField, decryptField } from './field-crypto';
import { FILE_KINDS, type FileKind } from './kyc-files';

// Identity photos: one Firestore document per photo (kyc_files/{uid}__{kind}), written and read by the server only.
const id = (uid: string, kind: FileKind) => `${uid}__${kind}`;
const okUid = (uid: string) => !!uid && !uid.includes('/') && uid.length <= 140;
const col = () => adminDb.collection('kyc_files');

export async function putKycFile(uid: string, kind: FileKind, mime: string, bytes: Uint8Array): Promise<void> {
  if (!okUid(uid)) throw new Error('bad uid');
  await col().doc(id(uid, kind)).set({ uid, kind, mime, data: encryptField(Buffer.from(bytes).toString('base64')), bytes: bytes.length, at: Timestamp.now() });
}

export async function getKycFile(uid: string, kind: FileKind): Promise<{ mime: string; bytes: Buffer } | null> {
  if (!okUid(uid)) return null;
  const s = await col().doc(id(uid, kind)).get();
  const d = s.exists ? (s.data() as { mime?: string; data?: string }) : null;
  if (!d || typeof d.data !== 'string' || (d.mime !== 'image/jpeg' && d.mime !== 'image/webp')) return null;
  const b64 = decryptField(d.data);
  return b64 ? { mime: d.mime, bytes: Buffer.from(b64, 'base64') } : null;
}

/** Which photos this person has uploaded so far (names only, never the pictures). */
export async function uploadedKinds(uid: string): Promise<FileKind[]> {
  if (!okUid(uid)) return [];
  const snaps = await Promise.all(FILE_KINDS.map((k) => col().doc(id(uid, k)).get()));
  return FILE_KINDS.filter((_, i) => snaps[i].exists);
}

export async function deleteKycFiles(uid: string): Promise<void> {
  if (!okUid(uid)) return;
  await Promise.all(FILE_KINDS.map((k) => col().doc(id(uid, k)).delete()));
}
