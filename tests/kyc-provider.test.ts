import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { registerKycProvider, activeKycProvider, clearKycProviders, type KycProvider } from '@/lib/kyc-provider/provider';

const src = (p: string) => readFileSync(p, 'utf8');
const fake: KycProvider = { id: 'fake', start: async () => ({ url: 'https://idv.test/s/1' }), parseWebhook: () => null };

describe('identity company registry', () => {
  beforeEach(() => clearKycProviders());
  it('stays manual with nothing set, "manual", or a company that is not connected', () => {
    registerKycProvider(fake);
    expect(activeKycProvider(undefined)).toBeNull();
    expect(activeKycProvider('')).toBeNull();
    expect(activeKycProvider('manual')).toBeNull();
    expect(activeKycProvider('sumsub')).toBeNull();
  });
  it('uses the connected company chosen by name (case and spaces ignored)', () => {
    registerKycProvider(fake);
    expect(activeKycProvider(' Fake ')?.id).toBe('fake');
  });
});

describe('wiring', () => {
  it('the team and the callback share one decision path', () => {
    expect(src('app/api/admin/kyc/route.ts')).toContain('applyKycDecision');
    expect(src('app/api/kyc/webhook/[provider]/route.ts')).toContain('applyKycDecision');
    const d = src('lib/kyc-decision.ts');
    for (const part of ['deleteKycFiles', 'logAdmin', 'notifyKycDecision']) expect(d).toContain(part);
  });
  it('the callback is rate limited, signature checked and tied to KYC_PROVIDER', () => {
    const w = src('app/api/kyc/webhook/[provider]/route.ts');
    expect(w).toContain('ipLimited');
    expect(w).toContain('parseWebhook');
    expect(w).toContain('KYC_PROVIDER');
    expect(w).toContain('status: 401');
  });
  it('photos are only demanded in manual review, and the page follows the company url', () => {
    expect(src('app/api/kyc/request/route.ts')).toContain('!provider && !hasAllPhotos');
    expect(src('app/kyc/page.tsx')).toContain("startsWith('https://')");
    expect(src('app/api/kyc/me/route.ts')).toContain('hosted');
  });
});
