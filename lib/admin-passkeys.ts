import 'server-only';
import { adminDb } from '@/lib/firebase-admin';

/** The admin panel has one shared sign-in, so its passkeys belong to this fixed owner (never a real account id). */
export const ADMIN_PASSKEY_UID = 'admin:panel';

/** True when at least one admin passkey exists. A store that cannot be reached counts as "none", so the PIN sign-in keeps working. */
export async function adminHasPasskeys(): Promise<boolean> {
  try {
    return !(await adminDb.collection('passkeys').where('uid', '==', ADMIN_PASSKEY_UID).limit(1).get()).empty;
  } catch { return false; }
}
