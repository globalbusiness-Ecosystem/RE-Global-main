import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseProject, parsePlan, installmentSchedule, lowestMonthly, statusAfterSave, isPartnerImage, MAX_IMAGES } from '@/lib/partner-projects';

const base = {
  title: 'Nile View Tower', description: 'A 20-floor residential tower on the Nile corniche with a pool.', kind: 'apartment', country: 'EG', city: 'Cairo',
  price: 2500000, currency: 'EGP', images: ['https://x.supabase.co/storage/v1/object/public/properties/partners/acme/1.jpg'], contact: '+20 100 123 4567',
  installments: [{ label: '5 years', downPct: 10, months: 60, extraPct: 0 }],
};

describe('parseProject', () => {
  it('accepts a complete project and cleans the text', () => {
    const r = parseProject({ ...base, title: '  Nile   View\u0000 Tower ', price: '2500000.456' });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.title).toBe('Nile View Tower'); expect(r.value.price).toBe(2500000.46); expect(r.value.country).toBe('EG'); }
  });
  it('names the first wrong field', () => {
    const bad = (patch: Record<string, unknown>) => { const r = parseProject({ ...base, ...patch }); return r.ok ? 'ok' : r.error; };
    expect(bad({ title: 'ab' })).toBe('title');
    expect(bad({ description: 'too short' })).toBe('description');
    expect(bad({ kind: 'castle' })).toBe('kind');
    expect(bad({ country: 'ZZ' })).toBe('country');
    expect(bad({ city: 'x' })).toBe('city');
    expect(bad({ price: 0 })).toBe('price');
    expect(bad({ price: 'abc' })).toBe('price');
    expect(bad({ currency: 'BTC' })).toBe('currency');
    expect(bad({ images: ['http://insecure/x.jpg'] })).toBe('images');
    expect(bad({ images: Array(MAX_IMAGES + 1).fill('https://a.b/c.jpg') })).toBe('images');
    expect(bad({ contact: 'call me' })).toBe('contact');
    expect(bad({ installments: Array(4).fill(base.installments[0]) })).toBe('plan');
    expect(bad({ installments: [{ downPct: 95, months: 12 }] })).toBe('plan');
  });
  it('contact is optional; an e-mail or a phone number is fine', () => {
    expect(parseProject({ ...base, contact: '' }).ok).toBe(true);
    expect(parseProject({ ...base, contact: 'sales@acme.com' }).ok).toBe(true);
  });
  it('a project may have no photos yet (a draft) and no plans', () => {
    expect(parseProject({ ...base, images: [], installments: [] }).ok).toBe(true);
  });
});

describe('instalments', () => {
  it('splits the price into the up-front part and the monthly payment', () => {
    expect(installmentSchedule(1_000_000, { label: '', downPct: 10, months: 60, extraPct: 0 })).toEqual({ down: 100000, financed: 900000, monthly: 15000, months: 60, total: 1_000_000, extra: 0 });
  });
  it('an extra charge applies to the financed part only', () => {
    const s = installmentSchedule(1000, { label: '', downPct: 20, months: 10, extraPct: 10 });
    expect(s).toMatchObject({ down: 200, financed: 800, monthly: 88, total: 1080, extra: 80 });
  });
  it('rejects plans outside the limits', () => {
    expect(parsePlan({ downPct: 10, months: 1 })).toBeNull();
    expect(parsePlan({ downPct: 10, months: 241 })).toBeNull();
    expect(parsePlan({ downPct: -1, months: 12 })).toBeNull();
    expect(parsePlan({ downPct: 10, months: 12, extraPct: 101 })).toBeNull();
    expect(parsePlan({ downPct: 0, months: 12 })).toEqual({ label: '', downPct: 0, months: 12, extraPct: 0 });
  });
  it('finds the lowest monthly payment', () => {
    expect(lowestMonthly(1200, [{ label: '', downPct: 0, months: 12, extraPct: 0 }, { label: '', downPct: 0, months: 24, extraPct: 0 }])).toBe(50);
    expect(lowestMonthly(1200, [])).toBeNull();
  });
});

describe('review flow', () => {
  it('a changed approved project goes back to review; a hidden one is locked', () => {
    expect(statusAfterSave('approved', false)).toBe('pending');
    expect(statusAfterSave('pending', false)).toBe('pending');
    expect(statusAfterSave('draft', false)).toBe('draft');
    expect(statusAfterSave('rejected', false)).toBe('draft');
    expect(statusAfterSave('rejected', true)).toBe('pending');
    expect(statusAfterSave('hidden', true)).toBeNull();
  });
  it('only photos stored for partners by this platform are accepted', () => {
    const base = 'https://x.supabase.co';
    expect(isPartnerImage(`${base}/storage/v1/object/public/properties/partners/acme/1.jpg`, base)).toBe(true);
    expect(isPartnerImage('https://evil.example/storage/v1/object/public/properties/partners/acme/1.jpg', base)).toBe(false);
    expect(isPartnerImage(`${base}/storage/v1/object/public/properties/kyc/1.jpg`, base)).toBe(false);
    expect(isPartnerImage('https://x.supabase.co/storage/v1/object/public/properties/partners/a/1.jpg', '')).toBe(false);
  });
});

describe('wiring', () => {
  const src = (p: string) => readFileSync(p, 'utf8');
  it('partner routes need a signed-in user, are rate limited, and only approved partners can write', () => {
    for (const f of ['app/api/partners/projects/route.ts', 'app/api/partners/upload/route.ts']) {
      expect(src(f)).toContain('verifyPiAccessToken');
      expect(src(f)).toContain('rateLimited(');
    }
    expect(src('lib/partner-projects-server.ts')).toContain("partner.status !== 'approved'");
    expect(src('app/api/partners/upload/route.ts')).toContain("partner.status !== 'approved'");
    expect(src('app/api/partners/upload/route.ts')).toContain('detectImage(');
  });
  it('an owner can only touch their own project', () => {
    const s = src('lib/partner-projects-server.ts');
    expect(s).toContain('cur.owner !== username');
    expect(s).toContain('.owner !== username');
  });
  it('the public showcase only shows approved projects of partners who are still approved', () => {
    const s = src('lib/partner-projects-server.ts');
    expect(s).toContain("where('status', '==', 'approved')");
    expect(s).toContain('active.has(');
  });
  it('the admin review is admin-only, limited to allowed steps, and logged', () => {
    const s = src('app/api/admin/partner-projects/route.ts');
    expect(s.match(/isAdminRequest\(req\)/g)?.length).toBe(2);
    expect(s).toContain('step.from.includes(cur.status)');
    expect(s).toContain('logAdmin(`partner.project.');
  });
});
