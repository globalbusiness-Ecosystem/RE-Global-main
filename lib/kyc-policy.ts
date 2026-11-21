import 'server-only';
import { adminDb } from '@/lib/firebase-admin';

// Platform setting (settings/kyc). requireAll: every account, Pi included, must have an approved identity check before paying.
// Web sign-ins always need it. Off by default, so turning it on is the team's decision.
export type KycPolicy = { requireAll: boolean };
export const DEFAULT_KYC_POLICY: KycPolicy = { requireAll: false };

let cache: { at: number; v: KycPolicy } | null = null;
const TTL_MS = 30_000;

export async function getKycPolicy(): Promise<KycPolicy> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.v;
  try {
    const d = (await adminDb.collection('settings').doc('kyc').get()).data();
    const v: KycPolicy = { requireAll: d?.requireAll === true };
    cache = { at: Date.now(), v };
    return v;
  } catch {
    // If the setting cannot be read, keep the last known value (or the default) rather than blocking everyone.
    return cache?.v ?? DEFAULT_KYC_POLICY;
  }
}

export async function setKycPolicy(p: KycPolicy): Promise<void> {
  await adminDb.collection('settings').doc('kyc').set({ requireAll: p.requireAll === true }, { merge: true });
  cache = null;
}
