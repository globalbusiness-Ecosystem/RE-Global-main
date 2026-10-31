import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement as h } from 'react';

vi.mock('server-only', () => ({}));

let store: Record<string, Record<string, Record<string, unknown>>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: { collection: (n: string) => ({ doc: (id: string) => ({
    get: async () => ({ exists: !!store[n]?.[id], data: () => store[n]?.[id] }),
    set: async (d: Record<string, unknown>) => { (store[n] ||= {})[id] = d; },
    delete: async () => { delete store[n]?.[id]; },
  }) }) },
}));
const g = vi.hoisted(() => ({ user: { uid: 'u1', username: 'ann' } as unknown }));
vi.mock('@/lib/api-guard', () => ({ guardApi: async () => g.user }));

import { GET, PUT, DELETE } from '@/app/api/my-avatar/route';
import { AVATAR_I18N, AVATAR_MAX_BYTES, AVATAR_PRESETS, centerSquare, encodeUnderLimit, initialsOf, isPresetId, validateAvatarPayload } from '@/lib/avatar';
import { UserAvatar } from '@/components/user-avatar';
import { NextResponse } from 'next/server';

const jpeg = (n = 100) => 'data:image/jpeg;base64,' + Buffer.from([0xff, 0xd8, 0xff, ...new Array(n).fill(1)]).toString('base64');
const req = (body?: unknown, headers: Record<string, string> = {}) =>
  new Request('http://x/api/my-avatar', { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body), headers }) as never;

beforeEach(() => { store = {}; g.user = { uid: 'u1', username: 'ann' }; });

describe('avatar helpers', () => {
  it('has unique presets and validates ids', () => {
    expect(new Set(AVATAR_PRESETS.map((p) => p.id)).size).toBe(AVATAR_PRESETS.length);
    expect(isPresetId('home')).toBe(true);
    expect(isPresetId('<script>')).toBe(false);
  });
  it('validates payloads', () => {
    expect(validateAvatarPayload({ preset: 'sun' })).toEqual({ kind: 'preset', id: 'sun' });
    expect(validateAvatarPayload({ preset: 'nope' })).toBeNull();
    expect(validateAvatarPayload({ photo: jpeg() })?.kind).toBe('photo');
    expect(validateAvatarPayload({ photo: 'data:image/svg+xml;base64,AAAA' })).toBeNull();
    expect(validateAvatarPayload({ photo: 'data:image/png;base64,AAAA' })).toBeNull();
    expect(validateAvatarPayload({ photo: jpeg(AVATAR_MAX_BYTES) })).toBeNull();
    expect(validateAvatarPayload(null)).toBeNull();
  });
  it('centres a square crop', () => {
    expect(centerSquare(400, 200)).toEqual({ sx: 100, sy: 0, side: 200 });
    expect(centerSquare(100, 300)).toEqual({ sx: 0, sy: 100, side: 100 });
  });
  it('encodes under the limit by lowering quality', () => {
    const calls: number[] = [];
    const out = encodeUnderLimit((q) => { calls.push(q); return q > 0.6 ? 'x'.repeat(100_000) : 'ok'; });
    expect(out).toBe('ok');
    expect(calls.length).toBeGreaterThan(1);
    expect(encodeUnderLimit(() => 'x'.repeat(100_000))).toBeNull();
  });
  it('makes initials and covers 7 languages', () => {
    expect(initialsOf('ann')).toBe('AN');
    expect(initialsOf('')).toBe('?');
    expect(Object.keys(AVATAR_I18N).sort()).toEqual(['ar', 'en', 'es', 'fr', 'pt', 'ur', 'zh']);
  });
});

describe('/api/my-avatar', () => {
  it('passes through the guard response when not signed in', async () => {
    g.user = NextResponse.json({ error: 'x' }, { status: 401 });
    expect((await GET(req())).status).toBe(401);
    expect((await PUT(req({ preset: 'sun' }))).status).toBe(401);
  });
  it('stores a preset and reads it back, only for the owner', async () => {
    expect((await PUT(req({ preset: 'sun' }))).status).toBe(200);
    expect(store.avatars.ann.preset).toBe('sun');
    expect(await (await GET(req())).json()).toEqual({ avatar: { preset: 'sun' } });
    g.user = { uid: 'u2', username: 'bob' };
    expect(await (await GET(req())).json()).toEqual({ avatar: null });
  });
  it('stores a real jpeg and rejects fake image bytes', async () => {
    expect((await PUT(req({ photo: jpeg() }))).status).toBe(200);
    expect(String(store.avatars.ann.photo)).toMatch(/^data:image\/jpeg;base64,/);
    const fake = 'data:image/jpeg;base64,' + Buffer.from('<svg onload=alert(1)>').toString('base64');
    expect((await PUT(req({ photo: fake }))).status).toBe(400);
  });
  it('rejects bad bodies, oversize and unsafe usernames', async () => {
    expect((await PUT(req({ preset: 'zzz' }))).status).toBe(400);
    expect((await PUT(req({ photo: jpeg() }, { 'content-length': '999999' }))).status).toBe(413);
    g.user = { uid: 'u1', username: '../x' };
    expect((await PUT(req({ preset: 'sun' }))).status).toBe(400);
  });
  it('removes the picture', async () => {
    await PUT(req({ preset: 'sun' }));
    expect((await DELETE(req())).status).toBe(200);
    expect(store.avatars.ann).toBeUndefined();
  });
});

describe('UserAvatar', () => {
  it('renders photo, preset and initials', () => {
    expect(renderToStaticMarkup(h(UserAvatar, { avatar: { photo: jpeg() }, username: 'ann' }))).toContain('<img');
    expect(renderToStaticMarkup(h(UserAvatar, { avatar: { preset: 'sun' }, username: 'ann' }))).toContain('🌞');
    expect(renderToStaticMarkup(h(UserAvatar, { avatar: null, username: 'ann' }))).toContain('AN');
  });
});
