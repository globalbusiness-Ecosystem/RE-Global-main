// An invite link looks like https://site/?ref=ABC12345. Only a plausible code is kept (letters and digits, 4 to 12 long).
export const REF_STORAGE_KEY = 're_ref_code';

export function parseRefCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,12}$/.test(code) ? code : null;
}

export const inviteLink = (origin: string, code: string): string => `${origin.replace(/\/+$/, '')}/?ref=${encodeURIComponent(code)}`;

// The redeem endpoint answers 200 (counted) or a final refusal (400 invalid/own/mutual, 404 unknown code, 409 not new/already used).
// Anything else (401 not signed in yet, 429 busy, 5xx) is a failure to try again later, so the code must be kept.
export const isFinalRedeemStatus = (status: number): boolean => status === 200 || status === 400 || status === 404 || status === 409;
