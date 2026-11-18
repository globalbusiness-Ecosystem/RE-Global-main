import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');

describe('linking the founder account needs a passkey', () => {
  const r = src('app/api/admin/founder/route.ts');
  it('the server asks for an existing passkey and a fresh one-time fingerprint token before linking', () => {
    const link = r.slice(r.indexOf('if (body.linkMe)'), r.indexOf('} else {', r.indexOf('if (body.linkMe)')));
    expect(link).toContain('passkeyCount(user.uid)');
    expect(link).toContain('consumeStepUp(user.uid');
    expect(link.indexOf('consumeStepUp')).toBeLessThan(link.indexOf('.set('));
    expect(link).toContain('passkey_required');
    expect(link).toContain('stepup_required');
  });
  it('the admin screen runs the fingerprint check and sends the token', () => {
    const s = src('components/admin/founder-settings.tsx');
    expect(s).toContain('fetchStepUpToken');
    expect(s).toContain("'X-Stepup-Token'");
  });
  it('no face image or biometric data is stored by this feature', () => {
    for (const f of ['app/api/admin/founder/route.ts', 'components/admin/founder-settings.tsx']) expect(src(f).toLowerCase()).not.toMatch(/faceapi|face-api|getusermedia|facedescriptor/);
  });
});
