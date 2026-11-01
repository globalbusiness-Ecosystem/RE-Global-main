import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const rules = readFileSync('firestore.rules', 'utf8');
const route = readFileSync('app/api/my-avatar/route.ts', 'utf8');

// The only collections a signed-in browser may touch directly. Everything else is server-only (Admin SDK).
const CLIENT_COLLECTIONS = ['contracts', 'favorites', 'inspections', 'preferences', 'profiles', 'properties', 'referrals'];

describe('avatar privacy and security', () => {
  it('Firestore rules give browsers no direct access to avatars', () => {
    const matched = [...rules.matchAll(/^\s*match \/([a-z_]+)\/\{/gm)].map((m) => m[1]).filter((c) => c !== 'databases').sort();
    expect(matched).toEqual(CLIENT_COLLECTIONS);
    expect(matched).not.toContain('avatars');
    expect(rules).toMatch(/avatars \(private profile pictures/);
  });
  it('every handler checks the signed-in user and the rate limit first', () => {
    for (const verb of ['GET', 'PUT', 'DELETE']) {
      const body = route.slice(route.indexOf(`export async function ${verb}`));
      const firstLines = body.split('\n').slice(0, 4).join('\n');
      expect(firstLines, verb).toContain('guardApi(req');
    }
  });
  it('the route only reads or writes the signed-in user\'s own document', () => {
    expect([...route.matchAll(/\.collection\('([a-z_]+)'\)/g)].map((m) => m[1])).toEqual(['avatars', 'avatars', 'avatars']);
    expect([...route.matchAll(/\.doc\(([^)]+)\)/g)].map((m) => m[1])).toEqual(['user.username', 'user.username', 'user.username']);
  });
  it('the response is never cached and the photo type is checked by its real bytes', () => {
    expect(route).toContain("'Cache-Control': 'no-store'");
    expect(route).toContain('detectImage(');
    expect(route).toContain("'image/jpeg'");
    expect(route).not.toContain('svg');
  });
  it('the content security policy lets the page show the picture (data: images)', () => {
    const cfg = readFileSync('next.config.mjs', 'utf8');
    const img = /img-src ([^;"]+)/.exec(cfg)?.[1] ?? '';
    expect(img).toContain('data:');
  });
  it('no other API route returns the avatar to someone else', () => {
    const files = ['app/api/my-data/route.ts'];
    for (const f of files) expect(readFileSync(f, 'utf8')).toContain("one('avatars')");
    const reads = readFileSync('app/api/my-properties/route.ts', 'utf8');
    expect(reads).not.toContain('avatars');
  });
});
