import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { webClaimsToSet, webUsername, webIdentityFromClaims } from '@/lib/web-auth';

const src = (p: string) => readFileSync(p, 'utf8');
const FB = 'AbCdEfGhIjKlMnOp12345';

describe('web account name on the sign-in token', () => {
  it('is the same name the API gives the account', () => {
    expect(webUsername(FB)).toBe('web_AbCdEfGhIj');
    expect(webIdentityFromClaims({ uid: FB, email_verified: true, firebase: { sign_in_provider: 'google.com' } })?.username).toBe(webUsername(FB));
  });
  it('sets the name when missing and keeps the other claims', () => {
    expect(webClaimsToSet(FB, undefined)).toEqual({ username: 'web_AbCdEfGhIj' });
    expect(webClaimsToSet(FB, { role: 'x' })).toEqual({ role: 'x', username: 'web_AbCdEfGhIj' });
  });
  it('replaces a wrong name (nobody can keep a name that is not theirs) and does nothing when it is right', () => {
    expect(webClaimsToSet(FB, { username: 'someone_else' })).toEqual({ username: 'web_AbCdEfGhIj' });
    expect(webClaimsToSet(FB, { username: 'web_AbCdEfGhIj' })).toBeNull();
  });
});

describe('wiring', () => {
  it('the route only serves verified web accounts, is rate limited, and takes the name from the account not the request', () => {
    const s = src('app/api/auth/web-claims/route.ts');
    expect(s).toContain("startsWith('web_')");
    expect(s).toContain('rateLimited(');
    expect(s).toContain('webClaimsToSet(firebaseUid');
    expect(s).not.toContain('req.json');
  });
  it('the app asks once per account, then refreshes the token', () => {
    const s = src('contexts/pi-auth-context.tsx');
    expect(s).toContain('/api/auth/web-claims');
    expect(s).toContain('webClaimsAsked.current !== u.uid');
    expect(s).toContain('getIdToken(true)');
  });
});
