import { isCountry } from './legal-profiles';

// Identity verification (KYC / AML). People who sign in with Google or e-mail (uid "web_…") must be verified before
// they can pay. Pi users are already identity-checked by Pi Network itself, so they are not asked again.
export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

export const needsKyc = (uid: string): boolean => typeof uid === 'string' && uid.startsWith('web_');

export const canMoveKyc = (from: KycStatus, to: KycStatus): boolean => {
  if (to === 'pending') return from === 'none' || from === 'rejected';
  if (to === 'approved' || to === 'rejected') return from === 'pending' || (from === 'approved' && to === 'rejected');
  return false;
};

export interface KycRequestInput { legalName: string; country: string; phone: string }

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Validates what a person types in the verification request. Returns null when anything is missing or odd. */
export function parseKycRequest(b: unknown): KycRequestInput | null {
  const o = (b ?? {}) as Record<string, unknown>;
  const legalName = clean(o.legalName, 100);
  const country = typeof o.country === 'string' ? o.country.toUpperCase() : '';
  const phone = clean(o.phone, 20);
  if (legalName.length < 5 || !/^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(legalName) || legalName.split(' ').length < 2) return null;
  if (!isCountry(country)) return null;
  if (!/^\+?[0-9 ()-]{7,20}$/.test(phone)) return null;
  return { legalName, country, phone };
}

export const cleanNote = (v: unknown): string => clean(v, 300);
