// Second step for staff admin logins: a 6-digit code from an authenticator app. Pure rules, shared by the login route and the tests.

export type TotpGate = 'ok' | 'needCode' | 'needEnroll' | 'check';

/**
 * After the PIN was right: what does the login need next?
 * - the account has a code set up: it needs a code ('needCode' when none was sent, else 'check' it);
 * - no code set up and the owner requires one: the person must set it up first ('needEnroll');
 * - no code set up and not required: the PIN is enough.
 */
export function totpGate(o: { enrolled: boolean; required: boolean; code: unknown }): TotpGate {
  const hasCode = typeof o.code === 'string' && o.code.trim() !== '';
  if (o.enrolled) return hasCode ? 'check' : 'needCode';
  return o.required ? 'needEnroll' : 'ok';
}

/** The link an authenticator app understands (also what the QR code carries). */
export function otpauthUri(account: string, secret: string, issuer = 'RE Global Admin'): string {
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** A code may be used once: its 30-second step must be newer than the last one accepted. */
export const isFreshStep = (step: number | null, last: number): step is number => step !== null && step > last;
