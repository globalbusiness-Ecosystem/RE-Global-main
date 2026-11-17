import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseVideoUrl, embedUrl, videoThumb } from '@/lib/video-embed';
import { parseAnnouncements, visibleAnnouncements, parseDate, parseLink, MAX_ANNOUNCEMENTS } from '@/lib/announcements';

const src = (p: string) => readFileSync(p, 'utf8');
const item = (o: object = {}) => ({ kind: 'offer', t: { en: 'Hi' }, ...o });

describe('video links', () => {
  it('reads YouTube, Vimeo and file links', () => {
    expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(parseVideoUrl('https://vimeo.com/123456789')).toEqual({ type: 'vimeo', id: '123456789' });
    expect(parseVideoUrl('https://cdn.example.com/a/b.mp4')?.type).toBe('file');
  });
  it('refuses anything else', () => {
    for (const v of ['http://youtu.be/dQw4w9WgXcQ', 'javascript:alert(1)', 'https://evil.com/page', 'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ', '', null, 5]) expect(parseVideoUrl(v)).toBeNull();
  });
  it('builds embeds only on the known players', () => {
    expect(embedUrl({ type: 'youtube', id: 'dQw4w9WgXcQ' })).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(embedUrl({ type: 'vimeo', id: '123456789' })).toContain('player.vimeo.com/video/123456789');
    expect(embedUrl({ type: 'file', url: 'https://x.com/a.mp4' })).toBeNull();
    expect(videoThumb({ type: 'youtube', id: 'dQw4w9WgXcQ' })).toContain('dQw4w9WgXcQ');
  });
});

describe('announcement parsing', () => {
  it('defaults: board on, stats off', () => {
    const a = parseAnnouncements(null);
    expect(a).toMatchObject({ enabled: true, showStats: false, items: [] });
  });
  it('drops items without a title and video items without a valid link', () => {
    const a = parseAnnouncements({ items: [item(), { kind: 'offer' }, item({ kind: 'video' }), item({ kind: 'video', video: 'https://youtu.be/dQw4w9WgXcQ' })] });
    expect(a.items).toHaveLength(2);
  });
  it('keeps only safe links, dates and images', () => {
    expect(parseLink('page:buy')).toBe('page:buy');
    expect(parseLink('page:nope')).toBeNull();
    expect(parseLink('javascript:alert(1)')).toBeNull();
    expect(parseLink('http://x.com')).toBeNull();
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('2026-11-17')).toBe('2026-11-17');
    expect(parseAnnouncements({ items: [item({ img: 'javascript:x', link: 'data:text/html,x' })] }).items[0]).toMatchObject({ img: null, link: null });
  });
  it('caps the list', () => {
    expect(parseAnnouncements({ items: Array.from({ length: 40 }, () => item()) }).items).toHaveLength(MAX_ANNOUNCEMENTS);
  });
  it('hides inactive items and offers/events after their date', () => {
    const a = parseAnnouncements({ items: [item({ date: '2026-11-16' }), item({ date: '2026-11-17' }), item({ kind: 'news', date: '2020-01-01' }), item({ active: false })] });
    expect(visibleAnnouncements(a.items, '2026-11-17')).toHaveLength(2);
  });
});

describe('wiring', () => {
  it('home page shows the board and hides stats unless switched on', () => {
    const h = src('components/pages/home-page.tsx');
    expect(h).toContain('<HomeAnnouncements');
    expect(h).toContain('announcements.showStats &&');
  });
  it('public API is rate limited and hides inactive items; admin API is guarded', () => {
    expect(src('app/api/announcements/route.ts')).toMatch(/ipLimited[\s\S]*filter\(\(x\) => x\.active\)/);
    const adm = src('app/api/admin/announcements/route.ts');
    expect((adm.match(/isAdminRequest\(req\)/g) ?? []).length).toBe(2);
    expect(adm).toContain('logAdmin');
  });
  it('video modal only embeds known players and the admin tab is registered', () => {
    expect(src('components/home-announcements.tsx')).toContain('embedUrl(ref)');
    expect(src('components/admin/properties-tab.tsx')).toContain('<AnnouncementsSettings');
  });
});

describe('video upload', () => {
  it('upload address is admin only and limited to video types; admin screen uses it', () => {
    const r = src('app/api/admin/video-upload-url/route.ts');
    expect(r).toContain('isAdminRequest(req)');
    expect(r).toMatch(/video\/mp4[\s\S]*video\/webm[\s\S]*video\/quicktime/);
    expect(src('components/admin/announcements-settings.tsx')).toContain('/api/admin/video-upload-url');
  });
});

describe('video upload', () => {
  it('upload address is admin only and limited to video types; admin screen uses it', () => {
    const r = src('app/api/admin/video-upload-url/route.ts');
    expect(r).toContain('isAdminRequest(req)');
    expect(r).toMatch(/video\/mp4[\s\S]*video\/webm[\s\S]*video\/quicktime/);
    expect(src('components/admin/announcements-settings.tsx')).toContain('/api/admin/video-upload-url');
  });
});
