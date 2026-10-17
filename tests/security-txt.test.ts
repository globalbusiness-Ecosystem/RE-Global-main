import { describe, it, expect, afterEach } from 'vitest';
import { GET } from '@/app/.well-known/security.txt/route';

afterEach(() => { delete process.env.SECURITY_CONTACT_EMAIL; });

describe('security.txt', () => {
  it('publishes nothing until a contact is configured', async () => {
    expect((await GET()).status).toBe(404);
  });

  it('refuses a malformed contact instead of publishing it', async () => {
    process.env.SECURITY_CONTACT_EMAIL = 'not an email';
    expect((await GET()).status).toBe(404);
  });

  it('serves the required fields with a future expiry', async () => {
    process.env.SECURITY_CONTACT_EMAIL = 'security@example.com';
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text).toContain('Contact: mailto:security@example.com');
    const expires = /Expires: (.+)/.exec(text)![1];
    expect(new Date(expires).getTime()).toBeGreaterThan(Date.now() + 100 * 24 * 3600 * 1000);
    expect(text).toContain('Canonical: ');
  });
});
