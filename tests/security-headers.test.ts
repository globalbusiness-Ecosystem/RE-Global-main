import { describe, it, expect } from 'vitest';

type Rule = { source: string; headers: { key: string; value: string }[] };

async function rules(): Promise<Rule[]> {
  const mod = await import(String('../next.config.mjs'));
  return mod.default.headers();
}
const header = (r: Rule | undefined, key: string) => r?.headers.find((h) => h.key === key)?.value;

describe('security headers', () => {
  it('sets the baseline headers for every page', async () => {
    const all = (await rules()).find((r) => r.source === '/:path*');
    expect(header(all, 'Strict-Transport-Security')).toContain('max-age=63072000');
    expect(header(all, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header(all, 'X-Content-Type-Options')).toBe('nosniff');
    expect(header(all, 'Permissions-Policy')).toContain('camera=(self)');
    const csp = header(all, 'Content-Security-Policy') ?? '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain('frame-ancestors');
  });

  it('keeps the Pi browser allowed to embed the app, and nobody else', async () => {
    const csp = header((await rules()).find((r) => r.source === '/:path*'), 'Content-Security-Policy') ?? '';
    expect(csp).toContain('https://sandbox.minepi.com');
    expect(csp).not.toMatch(/frame-ancestors[^;]*\*(?!\.)/);
  });

  it('never indexes or caches the admin panel and its API', async () => {
    for (const source of ['/admin/:path*', '/api/admin/:path*']) {
      const r = (await rules()).find((x) => x.source === source);
      expect(header(r, 'X-Robots-Tag')).toContain('noindex');
      expect(header(r, 'Cache-Control')).toBe('no-store');
    }
  });
});
