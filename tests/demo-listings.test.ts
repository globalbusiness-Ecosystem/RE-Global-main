import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('server-only', () => ({}));
const admin = vi.fn();
vi.mock('@/lib/admin-guard', () => ({ isAdminRequest: (...a: unknown[]) => admin(...a) }));
const logAdmin = vi.fn();
vi.mock('@/lib/admin-audit', () => ({ logAdmin: (...a: unknown[]) => logAdmin(...a) }));
vi.mock('@/lib/rate-guard', () => ({ ipLimited: async () => null }));
const state = { exists: true, data: { showDemoListings: false } as Record<string, unknown>, fail: false, set: vi.fn() };
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: async () => { if (state.fail) throw new Error('down'); return { exists: state.exists, data: () => state.data }; },
        set: (...a: unknown[]) => state.set(...a),
      }),
    }),
  },
}));
vi.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => 'NOW' } }));

import { parseShowDemo } from '@/lib/demo-listings';
import { getShowDemo } from '@/lib/demo-listings-server';
import { GET as publicGet } from '@/app/api/site-settings/route';
import { GET as adminGet, PUT } from '@/app/api/admin/display-settings/route';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

describe('parseShowDemo', () => {
  it('only an explicit false hides them', () => {
    expect(parseShowDemo(false)).toBe(false);
    for (const v of [true, undefined, null, 0, '', 'false', {}]) expect(parseShowDemo(v)).toBe(true);
  });
});

describe('getShowDemo', () => {
  beforeEach(() => { state.exists = true; state.data = { showDemoListings: false }; state.fail = false; });
  it('reads the saved switch', async () => {
    expect(await getShowDemo()).toBe(false);
    state.data = { showDemoListings: true };
    expect(await getShowDemo()).toBe(true);
  });
  it('keeps them visible when nothing is saved or the database is down', async () => {
    state.exists = false;
    expect(await getShowDemo()).toBe(true);
    state.exists = true; state.fail = true;
    expect(await getShowDemo()).toBe(true);
  });
});

describe('public /api/site-settings', () => {
  beforeEach(() => { state.exists = true; state.data = { showDemoListings: false }; state.fail = false; });
  it('tells visitors the switch, with a short CDN cache', async () => {
    const res = await publicGet({ headers: new Headers() } as never);
    expect(await res.json()).toEqual({ showDemoListings: false });
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=60');
  });
});

describe('admin /api/admin/display-settings', () => {
  const put = (body: unknown) => PUT({ json: async () => body, headers: new Headers() } as never);
  beforeEach(() => { admin.mockReset(); logAdmin.mockReset(); state.set.mockReset(); admin.mockResolvedValue(true); state.exists = true; state.data = { showDemoListings: true }; state.fail = false; });

  it('is admin only', async () => {
    admin.mockResolvedValue(false);
    expect((await adminGet({ headers: new Headers() } as never)).status).toBe(401);
    expect((await put({ showDemoListings: false })).status).toBe(401);
    expect(state.set).not.toHaveBeenCalled();
  });
  it('accepts only true or false', async () => {
    for (const bad of [{}, { showDemoListings: 'no' }, { showDemoListings: 0 }, null]) expect((await put(bad)).status).toBe(400);
    expect(state.set).not.toHaveBeenCalled();
  });
  it('saves the switch and writes it to the activity log', async () => {
    const res = await put({ showDemoListings: false });
    expect(res.status).toBe(200);
    expect(state.set).toHaveBeenCalledTimes(1);
    expect((state.set.mock.calls[0] as unknown[])[1]).toMatchObject({ mergeFields: ['showDemoListings', 'updatedAt'] });
    expect(logAdmin).toHaveBeenCalledWith('display.demo', { from: true, to: false });
  });
  it('has a readable activity log entry', () => {
    expect(auditLabel('display.demo')).toContain('التجريبية');
    expect(auditSummary('display.demo', { to: false })).toBe('إخفاء');
    expect(auditSummary('display.demo', { to: true })).toBe('إظهار');
  });
});

describe('wiring', () => {
  it('every list page wraps its sample listings, and the map respects the switch', () => {
    for (const p of ['buy', 'rent', 'hotel', 'invest', 'tokenized', 'abroad', 'offplan']) {
      expect(readFileSync(`components/pages/${p}-page.tsx`, 'utf8')).toContain('<DemoOnly>');
    }
    const m = readFileSync('components/pages/map-page.tsx', 'utf8');
    expect(m).toContain('useShowDemo');
    expect(m).toContain('showDemo === false');
  });
  it('the switch lives in the admin properties tab', () => {
    expect(readFileSync('components/admin/properties-tab.tsx', 'utf8')).toContain('<DisplaySettings');
  });
});
